import metaData = require("../../metadata/index");
import utils = require("mykoop-utils");

import validation = require("../validation/index");

// Controllers.
import getSubOptions = require("./getSubOptions");
import getMemberInfo = require("./getMemberInfo");
import updateMemberInfo = require("./updateMemberInfo");

var endPoints = metaData.endpoints;

export function attachControllers(binder) {
  binder.attach(
    {
      endPoint: endPoints.member.getSubOptions
    },
    getSubOptions
  );
  binder.attach(
    {
      endPoint: endPoints.member.getMemberInfo
    },
    getMemberInfo
  );
  binder.attach(
    {
      endPoint: endPoints.member.updateMemberInfo
    },
    updateMemberInfo
  );
}
