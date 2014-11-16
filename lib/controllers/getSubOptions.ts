import express = require("express");

function getSubOptions(req: express.Request, res: express.Response) {
  this.getSubOptions(function(err, options) {
    if (err) {
      return res.error(err);
    }

    res.send(
     options
    );
  });
};

export = getSubOptions;

