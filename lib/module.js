var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var utils = require("mykoop-utils");
var controllerList = require("./controllers/index");
var async = require("async");
var ApplicationError = utils.errors.ApplicationError;
var Module = (function (_super) {
    __extends(Module, _super);
    function Module() {
        _super.apply(this, arguments);
    }
    Module.prototype.init = function () {
        var db = this.getModuleManager().get("database");
        var routerModule = this.getModuleManager().get("router");
        controllerList.attachControllers(new utils.ModuleControllersBinder(this));
        this.db = db;
    };
    Module.prototype.getSubOptions = function (callback) {
        this.db.getConnection(function (err, connection, cleanup) {
            if (err) {
                return callback(err, null);
            }
            var query = connection.query("SELECT name,value,type FROM `option` where type in ('sub','fee');", function (err, rows) {
                cleanup();
                if (err) {
                    return callback(err, null);
                }
                callback(null, rows);
            });
        });
    };
    Module.prototype.getMemberInfo = function (id, callback) {
        this.db.getConnection(function (err, connection, cleanup) {
            if (err) {
                return callback(err, null);
            }
            var query = connection.query("SELECT isActive,isMember,subscriptionExpirationDate as activeUntil FROM member WHERE id = ?", [id], function (err, rows) {
                cleanup();
                if (err) {
                    return callback(err, null);
                }
                if (rows.length === 1) {
                    callback(null, rows[0]);
                }
                else {
                    callback(null, null);
                }
            });
        });
    };
    Module.prototype.updateMemberInfo = function (updateInfo, callback) {
        //Get email from ID
        this.db.getConnection(function (err, connection, cleanup) {
            if (err) {
                return callback(err);
            }
            async.waterfall([
                //Get email from ID
                function getEmailWithId(next) {
                    var query = connection.query("SELECT email from user where id = ?", [updateInfo.id], function (err, rows) {
                        if (err) {
                            next(err);
                        }
                        else if (rows.length !== 1) {
                            next(new Error("Didnt get email from id"));
                        }
                        next(null, rows[0].email);
                    });
                },
                function createBillForFee(email, next) {
                    if (!updateInfo.isMember) {
                        actions.transaction.bill.new({
                            data: {
                                total: updateInfo.feePrice,
                                archiveBill: false,
                                customerEmail: email,
                                items: [{
                                    id: -1,
                                    price: updateInfo.feePrice,
                                    quantity: 1
                                }]
                            }
                        }, function (err, res) {
                            next(err, email, res.idBill);
                        });
                    }
                    else {
                        next(null, email, null);
                    }
                },
                function createBillForSub(email, feeBillId, next) {
                    actions.transaction.bill.new({
                        data: {
                            total: updateInfo.subPrice,
                            archiveBill: false,
                            customerEmail: email,
                            items: [{
                                id: -1,
                                price: updateInfo.subPrice,
                                quantity: 1
                            }]
                        }
                    }, function (err, res) {
                        next(err, feeBillId, res.idBill);
                    });
                },
                function updateMemberEntry(feeBillId, subBillId, next) {
                    var updateData = {
                        feeTransactionId: feeBillId,
                        subscriptionTransactionId: subBillId
                    };
                    var query = connection.query("UPDATE table user SET ? WHERE id = ?", [updateData, updateInfo.id], function (err, rows) {
                        var myError = null;
                        if (rows.length === 1 && rows[0].affectedRows !== 1) {
                            myError = new Error("Failed to update member table");
                        }
                        callback(err || myError);
                    });
                }
            ], function (err) {
                cleanup();
                callback(err);
            }); // waterfall
        }); //getConnection
    };
    return Module;
})(utils.BaseModule);
module.exports = Module;
