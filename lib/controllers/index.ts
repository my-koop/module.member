import endpoints = require("../../metadata/endpoints");
import utils = require("mykoop-utils");
import Express = require("express");

import validation = require("../validation/index");

export function attachControllers(
  binder: utils.ModuleControllersBinder<mkmember.Module>
) {
  binder.attach(
    {
      endPoint: endpoints.member.getSubcriptionOptions
    },
    binder.makeSimpleController("getSubcriptionOptions")
  );
  binder.attach(
    {
      endPoint: endpoints.member.isUserAMember
      // TODO:: Add Validation
    },
    binder.makeSimpleController("isUserAMember", function(req: Express.Request) {
      var params: mkmember.IsUserAMember.Params = {
        id: parseInt(req.param("id"))
      };
      return params;
    })
  );
  binder.attach(
    {
      endPoint: endpoints.member.updateMemberInfo
      // TODO:: Check permissions and allow current user to pass through
      // TODO:: Add Validation
    },
    binder.makeSimpleController("updateMemberInfo", function(req: Express.Request) {
      var params: mkmember.UpdateMemberInfo.Params = {
        id: parseInt(req.param("id")),
        feePrice: parseInt(req.param("feePrice")),
        subPrice: parseInt(req.param("subPrice"))
      };
      return params;
    })
  );
}
