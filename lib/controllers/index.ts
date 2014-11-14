import metaData = require("../../metadata/index");
import utils = require("mykoop-utils");

import validation = require("../validation/index");

// Controllers.
import getSubOptions = require("./getSubOptions");

var endPoints = metaData.endpoints;

export function attachControllers(binder) {
  binder.attach(
    {
      endPoint: endPoints.member.getSubOptions
    },
    getSubOptions
  );
}
