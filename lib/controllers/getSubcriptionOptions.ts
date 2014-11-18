import express = require("express");

function getSubcriptionOptions(req: express.Request, res: express.Response) {
  this.getSubcriptionOptions(function(err, ret) {
    if (err) {
      return res.error(err);
    }

    res.send({
     options: ret.options,
     price: ret.price
    });
  });
};

export = getSubcriptionOptions;

