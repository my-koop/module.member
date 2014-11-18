import utils = require("mykoop-utils");
import controllerList = require("./controllers/index");
var logger = utils.getLogger(module);

var async = require("async");
var DatabaseError = utils.errors.DatabaseError;
var ApplicationError = utils.errors.ApplicationError;

class Module extends utils.BaseModule implements mkmember.Module {
  db: mkdatabase.Module;
  transaction: mktransaction.Module;
  init() {
    var db = <mkdatabase.Module>this.getModuleManager().get("database");
    var routerModule = <mykoop.Router>this.getModuleManager().get("router");
    var transaction = <mktransaction.Module> this.getModuleManager().get("transaction");
    controllerList.attachControllers(new utils.ModuleControllersBinder(this));

    this.db = db;
    this.transaction = transaction;
  }

  getSubOptions(
    callback: (err: Error, res ?: mkmember.MKOption) => void
  ) {
    this.db.getConnection(function(err, connection, cleanup) {
      if(err) {
        return callback(err, null);
      }
      var query = connection.query(
        "SELECT name,value,type FROM `option` WHERE type IN ('sub','fee') ORDER BY CAST(value AS UNSIGNED) asc;",
        function(err, rows) {
          cleanup();
          var options = [];
          for(var row in rows){
            if(rows[row].type == "fee"){
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
          console.log(res);
          callback(err && new DatabaseError(err), res);
      });
    });

  }
  getMemberInfo(
    id,
    callback: (err: Error, res ?: boolean) => void
  ) {
    this.db.getConnection(function(err, connection, cleanup) {
      if(err) {
        return callback(err, null);
      }
      var query = connection.query(
        "SELECT (b1.isClosed = 1) \
         FROM member as m \
         LEFT JOIN bill as b1 on (m.feeTransactionId = b1.idbill) \
         WHERE m.id = ?",
         [id],
        function(err, rows) {
          cleanup();
          if (err) {
            callback(err && new DatabaseError(err), null);
          }
          if(rows.length === 1){
            callback(null, true)
          } else {
            callback(null, false)
          }

      });
    });
  }

  updateMemberInfo(
    updateInfo: mkmember.UpdateMember,
    callback: (err: Error) =>void
  ) {
    var self = this;
      this.db.getConnection(function(err, connection, cleanup) {
        if(err) {
          return callback(err);
        }
        async.waterfall([
          function beginTransaction(next) {
            logger.debug("Begin transaction");
            connection.beginTransaction(function(err) {
              next(err && new DatabaseError(err));
            });
          },
          function getEmailWithId(next){
            var query = connection.query(
              "SELECT email from user where id = ?",
              [updateInfo.id],
              function(err , rows){
                next(err && new DatabaseError(err), rows && rows[0].email);
              }
            )
          },
          function createBillForFee(email, next){
            if(!updateInfo.isMember){
                self.transaction.saveNewBill(
                {
                  total: updateInfo.feePrice,
                  archiveBill: true,
                  customerEmail : email,
                  items: [{
                        id: -1,
                        price: updateInfo.feePrice,
                        quantity: 1
                  }]
                }, function( err , res){
                  logger.verbose(res);
                    next(err && new DatabaseError(err), email , res && res.idBill)
                })
              } else {
                next(null, email, null);
              }
          }, function createBillForSub(email, feeBillId, next){
              self.transaction.saveNewBill(
              {
                total : updateInfo.subPrice,
                archiveBill: true,
                customerEmail: email,
                items: [{
                    id: -1,
                    price: updateInfo.subPrice,
                    quantity: 1
                }]
              }, function(err, res){
                logger.verbose(res);
                logger.verbose(err);
                next(err && new DatabaseError(err), feeBillId, res && res.idBill)
              })
          }, function updateMemberTable(feeBillId, subBillId, next){
              if(!updateInfo.isMember){
                  var query = connection.query(
                    "INSERT INTO member SET id = ?, feeTransactionId = ?, subscriptionTransactionId = ?",
                    [updateInfo.id, feeBillId, subBillId],
                    function(err, rows){
                      logger.verbose("Inserting into member table");
                      logger.verbose(err);
                      logger.verbose(rows);
                      next(err && new DatabaseError(err));
                  });
              } else {
                var query = connection.query(
                  "UPDATE member SET subscriptionTransactionId = ? WHERE id = ?",
                  [subBillId, updateInfo.id],
                  function(err, rows){
                    logger.verbose("Updating member table");
                    logger.verbose(err);
                    logger.verbose(rows);
                    next(err && new DatabaseError(err) );
                });
              }
          }, function commitTransaction(next) {
               logger.debug("Commiting transaction");
                // No errors yet, commit all that
                connection.commit(function(err) {
                  next(err && new DatabaseError(err));
                });
          }
        ], function(err){
            if(err) {
              connection.rollback(function() {
                cleanup();
                callback(new ApplicationError(err, {},""));
              });
              return;
            }
            cleanup();
            callback(null);
        }); // waterfall
      });//getConnection
    }
}

export = Module;
