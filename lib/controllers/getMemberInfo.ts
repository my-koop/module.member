import express = require("express");

function getMemberInfo(req: express.Request, res: express.Response) {
  this.getMemberInfo(req.param("id"),function(err, isMember) {
    if (err) {
      return res.status(500).send("Unable to get member informations");
    }

    res.send({
      isMember: isMember
    });
  });
};

export = getMemberInfo;

