import utils = require("mykoop-utils");
import controllerList = require("./controllers/index");
var logger = utils.getLogger(module);
import _ = require("lodash");
import async = require("async");
var DatabaseError = utils.errors.DatabaseError;
var ApplicationError = utils.errors.ApplicationError;
var ResourceNotFoundError = ApplicationError.ResourceNotFoundError;

class Module extends utils.BaseModule implements mkmember.Module {
  db: mkdatabase.Module;
  transaction: mktransaction.Module;
  init() {
    this.db = <mkdatabase.Module>this.getModuleManager().get("database");
    this.transaction = <mktransaction.Module> this.getModuleManager().get("transaction");
    controllerList.attachControllers(new utils.ModuleControllersBinder(this));
  }

  getSubcriptionOptions(
    params: mkmember.GetSubcriptionOptions.Params,
    callback: mkmember.GetSubcriptionOptions.Callback
  ) {
    this.callWithConnection(
      this.__getSubcriptionOptions,
      params,
      callback
    );
  }

  __getSubcriptionOptions(
    connection: mysql.IConnection,
    params: mkmember.GetSubcriptionOptions.Params,
    callback: mkmember.GetSubcriptionOptions.Callback
  ) {
    connection.query(
      "SELECT name,value,type FROM `option` WHERE type IN ('sub','fee') ORDER BY CAST(value AS UNSIGNED) asc;",
      function(err, rows) {
        var options = [];
        for(var row in rows) {
          if(rows[row].type == "fee") {
            var price = parseInt(rows[row].value);
          } else {
            var option = {};
            option["name"] = rows[row].name;
            option["value"] = parseInt(rows[row].value);
            options.push(option);
          }
        }
        var res = {
          options: options,
          price: price
        }
        logger.debug(res);
        callback(err && new DatabaseError(err), res);
      }
    );
  }

  isUserAMember(
    params: mkmember.IsUserAMember.Params,
    callback: mkmember.IsUserAMember.Callback
  ) {
    this.callWithConnection(
      this.__isUserAMember,
      params,
      callback
    );
  }

  __isUserAMember(
    connection: mysql.IConnection,
    params: mkmember.IsUserAMember.Params,
    callback: mkmember.IsUserAMember.Callback
  ) {
    connection.query(
      "SELECT m.id, m.subscriptionExpirationDate \
       FROM member as m \
       INNER JOIN bill as b1 on (m.feeTransactionId = b1.idbill) \
       WHERE m.id = ? AND b1.closedDate IS NOT NULL",
       [params.id],
      function(err, rows) {
        callback(
          err && new DatabaseError(err),
          {isMember: rows && rows.length === 1,
           activeUntil: (rows && rows.length === 1) ? rows[0].subscriptionExpirationDate : null}
        );
      }
    );
  }

  updateMemberInfo(
    params: mkmember.UpdateMemberInfo.Params,
    callback: mkmember.UpdateMemberInfo.Callback
  ) {
    this.callWithConnection(
      this.__updateMemberInfo,
      params,
      callback
    );
  }

  __updateMemberInfo(
    connection: mysql.IConnection,
    params: mkmember.UpdateMemberInfo.Params,
    callback: mkmember.UpdateMemberInfo.Callback
  ) {
      // FIXME:: Wrap all of this in a transaction!
      var self = this;
      async.waterfall([
        function getEmailWithId(next) {
          connection.query(
            "SELECT email, (isnull(member.id) != 1) as isMember \
             FROM user \
             LEFT JOIN member ON user.id = member.id \
             WHERE user.id = ?",
            [params.id],
            function(err , rows) {
              if(err) {
                return callback(new DatabaseError(err));
              }
              var row: any = _.first(rows);
              if(!row) {
                return callback(new ResourceNotFoundError(null, {id: "notFound"}));
              }
              next(null, row.email, row.isMember);
            }
          );
        },function getPrices(email: string, isMember: boolean, next){
          //Ordering by type so fee will always be in first row
          connection.query(
            "SELECT `type`, `value`, `interval` \
             FROM `option` \
             WHERE \
             type = 'fee' OR \
             (type = 'sub' AND name = ?) \
             ORDER BY type asc",
             [params.subscriptionChoice],
             function(err, res){
              if(res.length !== 2){
                return callback(new ResourceNotFoundError(null, {subscriptionChoice: "notFound"}))
              }
              next(err && new DatabaseError(err),
              {
                "fee" : res[0].value,
                "sub" : res[1].value,
                "subInterval" : res[1].interval
              },
              email,
              isMember
              )
            }
          );
        }
        ,function createBillForFee(info, email: string, isMember: boolean, next) {
          if(!isMember) {
            self.transaction.saveNewBill(
            {
              total: info.fee,
              archiveBill: false,
              customerEmail : email,
              category: "membership",
              items: [{
                id: -1,
                price: info.fee,
                quantity: 1
              }]
            }, function(err , res) {
              logger.debug("New member bill result ", res);
              next(
                err,
                info,
                email,
                isMember,
                res && res.idBill
              );
            });
          } else {
            next(null,info ,email, isMember, null);
          }
        }, function createBillForSub(info, email, isMember, feeBillId, next) {
            self.transaction.saveNewBill(
            {
              total : info.sub,
              archiveBill: false,
              customerEmail: email,
              category: "subscription",
              items: [{
                id: -1,
                price: info.sub,
                quantity: 1
              }]
            }, function(err, res) {
              logger.debug("New subscription fee result ", res);
              next(err, info, isMember, feeBillId, res && res.idBill);
            });
        }, function updateMemberTable(info, isMember, feeBillId, subBillId, next) {
          var interval = "INTERVAL " + info.subInterval;
          if(!isMember) {
            connection.query(
              "INSERT INTO member  \
               SET \
                 id = ?, \
                 feeTransactionId = ?, \
                 subscriptionTransactionId = ?, \
                 subscriptionExpirationDate = date_add(NOW()," + interval + " )",
              [params.id, feeBillId, subBillId],
              function(err, rows) {
                logger.debug("Inserting into member table", err || rows);
                next(err && new DatabaseError(err));
              }
            );
          } else {
            connection.query(
              "UPDATE member \
               SET \
                 subscriptionTransactionId = ?,\
                 subscriptionExpirationDate = CASE \
               WHEN subscriptionExpirationDate < NOW() \
               THEN date_add(NOW()," + interval + " ) \
               ELSE date_add(subscriptionExpirationDate,"  + interval + ") \
               END \
               WHERE id = ?",
              [subBillId, params.id],
              function(err, rows) {
                logger.debug("Updating member table", err || rows);
                next(err && new DatabaseError(err) );
              }
            );
          }
        }
      ], callback);
    }
}

export = Module;
