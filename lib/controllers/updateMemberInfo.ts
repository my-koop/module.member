import express = require("express");

function updateMemberInfo(req: express.Request, res: express.Response) {

  var info = {
    id: req.session.user.id,
    subPrice: req.param("subPrice"),
    feePrice: req.param("feePrice")
  }

  this.updateMemberInfo(info, function(err, options) {
    if (err) {
      return res.error(err);
    }

    res.end();
  });
};

export = updateMemberInfo
