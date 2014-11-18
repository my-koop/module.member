import express = require("express");

function getIsUserAMember(req: express.Request, res: express.Response) {
  this.getIsUserAMember(req.param("id"),function(err, isMember) {
    if (err) {
      return res.error(err);
    }

    res.send({
      isMember: isMember
    });
  });
};

export = getIsUserAMember;

