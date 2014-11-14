import utils = require("mykoop-utils");
import controllerList = require("./controllers/index");
import MKOption = require("./classes/MKOption");
var ApplicationError = utils.errors.ApplicationError;

class Module extends utils.BaseModule implements mkmember.Module {
  db: mkdatabase.Module;
  init() {
    var db = <mkdatabase.Module>this.getModuleManager().get("database");
    var routerModule = <mykoop.Router>this.getModuleManager().get("router");

    controllerList.attachControllers(new utils.ModuleControllersBinder(this));

    this.db = db;
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
}

export = Module;
