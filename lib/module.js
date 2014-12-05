var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var utils = require("mykoop-utils");
var controllerList = require("./controllers/index");
var logger = utils.getLogger(module);
var _ = require("lodash");
var async = require("async");
var DatabaseError = utils.errors.DatabaseError;
var ApplicationError = utils.errors.ApplicationError;
var ResourceNotFoundError = ApplicationError.ResourceNotFoundError;
var Module = (function (_super) {
    __extends(Module, _super);
    function Module() {
        _super.apply(this, arguments);
    }
    Module.prototype.init = function () {
        this.db = this.getModuleManager().get("database");
        this.transaction = this.getModuleManager().get("transaction");
        this.core = this.getModuleManager().get("core");
        controllerList.attachControllers(new utils.ModuleControllersBinder(this));
    };
    Module.prototype.getSubcriptionOptions = function (params, callback) {
        this.callWithConnection(this.__getSubcriptionOptions, params, callback);
    };
    Module.prototype.__getSubcriptionOptions = function (connection, params, callback) {
        this.core.__getSettings(connection, {
            keys: ["subscriptions", "membershipFee"]
        }, function (err, result) {
            if (err) {
                return callback(err);
            }
            var options = {
                options: JSON.parse(result.subscriptions),
                membershipFee: result.membershipFee || 0
            };
            callback(null, options);
        });
    };
    Module.prototype.isUserAMember = function (params, callback) {
        this.callWithConnection(this.__isUserAMember, params, callback);
    };
    Module.prototype.__isUserAMember = function (connection, params, callback) {
        connection.query("SELECT m.id, m.subscriptionExpirationDate \
       FROM member as m \
       INNER JOIN bill as b1 on (m.feeTransactionId = b1.idbill) \
       WHERE m.id = ? AND b1.closedDate IS NOT NULL", [params.id], function (err, rows) {
            callback(err && new DatabaseError(err), { isMember: rows && rows.length === 1, activeUntil: (rows && rows.length === 1) ? rows[0].subscriptionExpirationDate : null });
        });
    };
    Module.prototype.updateMemberInfo = function (params, callback) {
        this.callWithConnection(this.__updateMemberInfo, params, callback);
    };
    Module.prototype.__updateMemberInfo = function (connection, params, callback) {
        var self = this;
        var isMember = false;
        var email;
        var subscriptionInfo;
        var mysqlhelper = new utils.MySqlHelper();
        mysqlhelper.setConnection(_.noop, connection);
        async.waterfall([
            mysqlhelper.beginTransaction,
            function getEmailWithId(next) {
                connection.query("SELECT email, (isnull(member.id) != 1) as isMember \
             FROM user \
             LEFT JOIN member ON user.id = member.id \
             WHERE user.id = ?", [params.id], function (err, rows) {
                    if (err) {
                        return callback(new DatabaseError(err));
                    }
                    var row = _.first(rows);
                    if (!row) {
                        return callback(new ResourceNotFoundError(null, { id: "notFound" }));
                    }
                    isMember = row.isMember;
                    email = row.email;
                    next(null);
                });
            },
            function getPrices(next) {
                //Ordering by type so fee will always be in first row
                self.__getSubcriptionOptions(connection, {}, next);
            },
            function checkSubscription(info, next) {
                if (params.subscriptionChoice >= info.options.length) {
                    return next(new ResourceNotFoundError(null, { subscriptionChoice: "invalid" }));
                }
                subscriptionInfo = info.options[params.subscriptionChoice];
                next(null, info.membershipFee);
            },
            function createBillForFee(fee, next) {
                if (!isMember) {
                    self.transaction.saveNewBill({
                        total: fee,
                        archiveBill: false,
                        customerEmail: email,
                        category: "membership",
                        items: [{
                            id: -1,
                            price: fee,
                            quantity: 1
                        }]
                    }, function (err, res) {
                        logger.debug("New member bill result ", res);
                        next(err, res && res.idBill);
                    });
                }
                else {
                    next(null, null);
                }
            },
            function createBillForSub(feeBillId, next) {
                self.transaction.saveNewBill({
                    total: subscriptionInfo.price,
                    archiveBill: false,
                    customerEmail: email,
                    category: "subscription",
                    items: [{
                        id: -1,
                        price: subscriptionInfo.price,
                        quantity: 1
                    }]
                }, function (err, res) {
                    logger.debug("New subscription fee result ", res);
                    next(err, feeBillId, res && res.idBill);
                });
            },
            function updateMemberTable(feeBillId, subBillId, next) {
                var interval = "INTERVAL " + subscriptionInfo.duration + " Month";
                if (!isMember) {
                    connection.query("INSERT INTO member  \
               SET \
                 id = ?, \
                 feeTransactionId = ?, \
                 subscriptionTransactionId = ?, \
                 subscriptionExpirationDate = date_add(NOW()," + interval + " )", [params.id, feeBillId, subBillId], function (err, rows) {
                        logger.debug("Inserting into member table", err || rows);
                        next(err && new DatabaseError(err));
                    });
                }
                else {
                    connection.query("UPDATE member \
               SET \
                 subscriptionTransactionId = ?,\
                 subscriptionExpirationDate = CASE \
               WHEN subscriptionExpirationDate < NOW() \
               THEN date_add(NOW()," + interval + " ) \
               ELSE date_add(subscriptionExpirationDate," + interval + ") \
               END \
               WHERE id = ?", [subBillId, params.id], function (err, rows) {
                        logger.debug("Updating member table", err || rows);
                        next(err && new DatabaseError(err));
                    });
                }
            },
            mysqlhelper.commitTransaction,
        ], callback);
    };
    return Module;
})(utils.BaseModule);
module.exports = Module;
