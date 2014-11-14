var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var utils = require("mykoop-utils");
var controllerList = require("./controllers/index");
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
    return Module;
})(utils.BaseModule);
module.exports = Module;
