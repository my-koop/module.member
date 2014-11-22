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
      "SELECT m.id \
       FROM member as m \
       INNER JOIN bill as b1 on (m.feeTransactionId = b1.idbill) \
       WHERE m.id = ? AND b1.closedDate IS NOT NULL",
       [params.id],
      function(err, rows) {
        callback(
          err && new DatabaseError(err),
          {isMember: rows && rows.length === 1}
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
        },
        function createBillForFee(email: string, isMember: boolean, next) {
          if(!isMember) {
            self.transaction.saveNewBill(
            {
              total: params.feePrice,
              archiveBill: true,
              customerEmail : email,
              items: [{
                id: -1,
                // FIXME:: Do not trust the user
                price: params.feePrice,
                quantity: 1
              }]
            }, function(err , res) {
              logger.debug("New member bill result ", res);
              next(
                err,
                email,
                isMember,
                res && res.idBill
              );
            });
          } else {
            next(null, email, isMember, null);
          }
        }, function createBillForSub(email, isMember, feeBillId, next) {
            self.transaction.saveNewBill(
            {
              total : params.subPrice,
              archiveBill: true,
              customerEmail: email,
              items: [{
                id: -1,
                price: params.subPrice,
                quantity: 1
              }]
            }, function(err, res) {
              logger.debug("New subscription fee result ", res);
              next(err, isMember, feeBillId, res && res.idBill);
            });
        }, function updateMemberTable(isMember, feeBillId, subBillId, next) {
          if(!isMember) {
            connection.query(
              "INSERT INTO member SET id = ?, feeTransactionId = ?, subscriptionTransactionId = ?",
              [params.id, feeBillId, subBillId],
              function(err, rows) {
                logger.debug("Inserting into member table", err || rows);
                next(err && new DatabaseError(err));
              }
            );
          } else {
            connection.query(
              "UPDATE member SET subscriptionTransactionId = ? WHERE id = ?",
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
