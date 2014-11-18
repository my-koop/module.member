import express = require("express");

function getSubOptions(req: express.Request, res: express.Response) {
  this.getSubOptions(function(err, ret) {
    if (err) {
      return res.error(err);
    }

    res.send({
     options: ret.options,
     price: ret.price
    });
  });
};

export = getSubOptions;

