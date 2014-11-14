import express = require("express");

function updateMemberInfo(req: express.Request, res: express.Response) {
  this.updateMemberInfo(function(err, options) {
    if (err) {
      return res.error(err);
    }

    res.end();
  });
};

export = updateMemberInfo
