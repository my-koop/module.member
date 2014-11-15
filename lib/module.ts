import utils = require("mykoop-utils");
import controllerList = require("./controllers/index");
import MKOption = require("./classes/MKOption");
var logger = utils.getLogger(module);

var async = require("async");

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
    callback: (err: Error, res ?: mkmember.MKOption[]) => void
  ) {
    this.db.getConnection(function(err, connection, cleanup) {
      if(err) {
        return callback(err, null);
      }
      var query = connection.query(
        "SELECT name,value,type FROM `option` where type in ('sub','fee');",
        function(err, rows) {
          cleanup();
          if (err) {
            return callback(err, null);
          }
          callback(null, rows);

      });
    });

  }
  getMemberInfo(
    id,
    callback: (err: Error, res ?: mkmember.MemberInfo) => void
  ) {
    this.db.getConnection(function(err, connection, cleanup) {
      if(err) {
        return callback(err, null);
      }
      var query = connection.query(
        "SELECT isActive,isMember,subscriptionExpirationDate as activeUntil FROM member WHERE id = ?",
         [id],
        function(err, rows) {
          cleanup();
          if (err) {
            return callback(err, null);
          }
          if(rows.length === 1){
            callback(null, rows[0])
          } else {
            callback(null, null)
          }

      });
    });
  }

  updateMemberInfo(
    updateInfo: mkmember.UpdateMember,
    callback: (err: Error) =>void
  ) {
    var self = this;
      //Get email from ID
      this.db.getConnection(function(err, connection, cleanup) {
        if(err) {
          return callback(err);
        }
        async.waterfall([
          //Get email from ID
          function getEmailWithId(next){
            var query = connection.query(
              "SELECT email from user where id = ?",
              [updateInfo.id],
              function(err , rows){
                if(err){
                  next(err);
                } else if (rows.length !== 1){
                  next(new Error("Didnt get email from id"));
                }
                next(null,rows[0].email);
              }
            )
          },
          function createBillForFee(email, next){
            if(!updateInfo.isMember){
                self.transaction.saveNewBill(
                {
                  total: updateInfo.feePrice,
                  archiveBill: false,
                  customerEmail : email,
                  items: [{
                        id: -1,
                        price: updateInfo.feePrice,
                        quantity: 1
                  }]
                }, function( err , res){
                  logger.verbose(res);
                  logger.verbose(err);
                    next(err, email , res && res.idBill)
                })
              } else {
                next(null,email,null);
              }
          }, function createBillForSub( email, feeBillId, next){
              self.transaction.saveNewBill(
              {
                total : updateInfo.subPrice,
                archiveBill: false,
                customerEmail: email,
                items: [{
                    id: -1,
                    price: updateInfo.subPrice,
                    quantity: 1
                }]
              }, function(err, res){
                logger.verbose(res);
                  logger.verbose(err);
                  next(err, feeBillId, res.idBill);
              })
          }, function updateMemberEntry(feeBillId, subBillId, next){
              var updateData = {
                feeTransactionId: feeBillId,
                subscriptionTransactionId: subBillId
              };
              var query = connection.query(
                "UPDATE table user SET ? WHERE id = ?",
                [updateData,updateInfo.id],
                function(err, rows){
                  var myError = null;
                  if(rows.length === 1 && rows[0].affectedRows !== 1){
                    myError = new Error("Failed to update member table");
                  }
                  callback(err || myError);
                });
          }
        ], function(err){
            cleanup();
            callback(err);
        }); // waterfall
      });//getConnection
    }
}

export = Module;
