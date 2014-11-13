var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var utils = require("mykoop-utils");
var ModuleClass1 = require("./classes/ModuleClass1");
var controllerList = require("./controllers/index");
var ApplicationError = utils.errors.ApplicationError;
var Module = (function (_super) {
    __extends(Module, _super);
    function Module() {
        _super.apply(this, arguments);
    }
    Module.prototype.init = function () {
        controllerList.attachControllers(new utils.ModuleControllersBinder(this));
    };
    Module.prototype.method1 = function (inParam, callback) {
        if (!inParam.id) {
            return callback(new ApplicationError(null, {
                id: "custom message"
            }, "Wrong id"));
        }
        var res = new ModuleClass1();
        res.id = inParam.id + 1;
        res.value = inParam.value + " Incremented id by 1";
        callback(null, res);
    };
    Module.prototype.getSubOptions = function (callback) {
        var options;
        this.db.getConnection(function (err, connection, cleanup) {
            if (err) {
                return callback(err, null);
            }
            var query = connection.query("SELECT name,value FROM `option` where type in ('sub','fee');", function (err, rows) {
                cleanup();
                if (err) {
                    return callback(err, null);
                }
                for (var i in rows) {
                    options.push(new Option(rows[i]));
                }
                callback(new Error("No result"), null);
            });
        });
    };
    return Module;
})(utils.BaseModule);
module.exports = Module;
