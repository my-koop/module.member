import express = require("express");

function getSubOptions(req: express.Request, res: express.Response) {
  this.getSubOptions(function(err, options) {
    if (err) {
      return res.status(500).send("Unable to get options");
    }

    res.send(
     options
    );
  });
};

export = getSubOptions;

