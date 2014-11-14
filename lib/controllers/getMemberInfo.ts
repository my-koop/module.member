import express = require("express");

function getMemberInfo(req: express.Request, res: express.Response) {
  this.getMemberInfo(req.param("id"),function(err, infos) {
    if (err) {
      return res.status(500).send("Unable to get member informations");
    }

    res.send(infos);
  });
};

export = getMemberInfo;

