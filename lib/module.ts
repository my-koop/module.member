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
  core: mkcore.Module;
  init() {
    this.db = <mkdatabase.Module>this.getModuleManager().get("database");
    this.transaction = <mktransaction.Module> this.getModuleManager().get("transaction");
    this.core = <mkcore.Module> this.getModuleManager().get("core");
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
    this.core.__getSettings(connection, {
      keys: ["subscriptions", "membershipFee"]
    }, function(err, result) {
      if(err) {
        return callback(err);
      }
      var options = {
        options: JSON.parse(result.subscriptions),
        membershipFee: result.membershipFee || 0
      };

      callback(null, options);
    });
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
      var self = this;
      var isMember = false;
      var email;
      var subscriptionInfo: mkmember.Option;
      var mysqlhelper = new utils.MySqlHelper();
      mysqlhelper.setConnection(_.noop, connection);
      async.waterfall([
        mysqlhelper.beginTransaction,
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
              isMember = row.isMember;
              email = row.email;
              next(null);
            }
          );
        },
        function getPrices(next) {
          //Ordering by type so fee will always be in first row
          self.__getSubcriptionOptions(connection, {}, next);
        },
        function checkSubscription(
          info: mkmember.GetSubcriptionOptions.CallbackResult,
          next
        ) {
          if(params.subscriptionChoice >= info.options.length) {
            return next(new ResourceNotFoundError(
              null,
              {subscriptionChoice: "invalid"}
            ));
          }
          subscriptionInfo = info.options[params.subscriptionChoice];


          next(null, info.membershipFee);
        },
        function createBillForFee(
          fee,
          next
        ) {
          if(!isMember) {
            self.transaction.saveNewBill(
            {
              total: fee,
              archiveBill: false,
              customerEmail : email,
              items: [{
                id: -1,
                price: fee,
                quantity: 1
              }]
            }, function(err , res) {
              logger.debug("New member bill result ", res);
              next(
                err,
                res && res.idBill
              );
            });
          } else {
            next(null, null);
          }
        },
        function createBillForSub(feeBillId, next) {
          self.transaction.saveNewBill(
          {
            total : subscriptionInfo.price,
            archiveBill: false,
            customerEmail: email,
            items: [{
              id: -1,
              price: subscriptionInfo.price,
              quantity: 1
            }]
          }, function(err, res) {
            logger.debug("New subscription fee result ", res);
            next(err, feeBillId, res && res.idBill);
          });
        },
        function updateMemberTable(feeBillId, subBillId, next) {
          var interval = "INTERVAL " + subscriptionInfo.duration + " Month";
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
        },
        mysqlhelper.commitTransaction,
      ], callback);
    }
}

export = Module;
