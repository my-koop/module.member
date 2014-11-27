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
        controllerList.attachControllers(new utils.ModuleControllersBinder(this));
    };
    Module.prototype.getSubcriptionOptions = function (params, callback) {
        this.callWithConnection(this.__getSubcriptionOptions, params, callback);
    };
    Module.prototype.__getSubcriptionOptions = function (connection, params, callback) {
        connection.query("SELECT name,value,type FROM `option` WHERE type IN ('sub','fee') ORDER BY CAST(value AS UNSIGNED) asc;", function (err, rows) {
            var options = [];
            for (var row in rows) {
                if (rows[row].type == "fee") {
                    var price = parseInt(rows[row].value);
                }
                else {
                    var option = {};
                    option["name"] = rows[row].name;
                    option["value"] = parseInt(rows[row].value);
                    options.push(option);
                }
            }
            var res = {
                options: options,
                price: price
            };
            logger.debug(res);
            callback(err && new DatabaseError(err), res);
        });
    };
    Module.prototype.isUserAMember = function (params, callback) {
        this.callWithConnection(this.__isUserAMember, params, callback);
    };
    Module.prototype.__isUserAMember = function (connection, params, callback) {
        connection.query("SELECT m.id \
       FROM member as m \
       INNER JOIN bill as b1 on (m.feeTransactionId = b1.idbill) \
       WHERE m.id = ? AND b1.closedDate IS NOT NULL", [params.id], function (err, rows) {
            callback(err && new DatabaseError(err), { isMember: rows && rows.length === 1 });
        });
    };
    Module.prototype.updateMemberInfo = function (params, callback) {
        this.callWithConnection(this.__updateMemberInfo, params, callback);
    };
    Module.prototype.__updateMemberInfo = function (connection, params, callback) {
        // FIXME:: Wrap all of this in a transaction!
        var self = this;
        async.waterfall([
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
                    next(null, row.email, row.isMember);
                });
            },
            function getPrices(email, isMember, next) {
                //Ordering by type so fee will always be in first row
                connection.query("SELECT `type`, `value`, `interval` \
             FROM `option` \
             WHERE \
             type = 'fee' OR \
             (type = 'sub' AND name = ?) \
             ORDER BY type asc", [params.subscriptionChoice], function (err, res) {
                    next(err && new DatabaseError(err), res.length === 2 && {
                        "fee": res[0].value,
                        "sub": res[1].value,
                        "subInterval": res[1].interval
                    }, email, isMember);
                });
            },
            function createBillForFee(info, email, isMember, next) {
                if (!isMember) {
                    self.transaction.saveNewBill({
                        total: info.fee,
                        archiveBill: false,
                        customerEmail: email,
                        items: [{
                            id: -1,
                            price: info.fee,
                            quantity: 1
                        }]
                    }, function (err, res) {
                        logger.debug("New member bill result ", res);
                        next(err, info, email, isMember, res && res.idBill);
                    });
                }
                else {
                    next(null, info, email, isMember, null);
                }
            },
            function createBillForSub(info, email, isMember, feeBillId, next) {
                self.transaction.saveNewBill({
                    total: info.sub,
                    archiveBill: false,
                    customerEmail: email,
                    items: [{
                        id: -1,
                        price: info.sub,
                        quantity: 1
                    }]
                }, function (err, res) {
                    logger.debug("New subscription fee result ", res);
                    next(err, info, isMember, feeBillId, res && res.idBill);
                });
            },
            function updateMemberTable(info, isMember, feeBillId, subBillId, next) {
                var interval = "INTERVAL " + info.subInterval;
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
            }
        ], callback);
    };
    return Module;
})(utils.BaseModule);
module.exports = Module;
