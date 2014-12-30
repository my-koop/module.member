import endpoints = require("../../metadata/endpoints");
import utils = require("mykoop-utils");
import Express = require("express");

import validation = require("../validation/index");

export function attachControllers(
  binder: utils.ModuleControllersBinder<mkmember.Module>
) {
  var member = binder.moduleInstance;
  var user = <mkuser.Module>member.getModuleManager().get("user");
  var validateCurrentUser = (<any>user.constructor).validateCurrentUser;

  binder.attach(
    {
      endPoint: endpoints.member.getSubcriptionOptions
    },
    binder.makeSimpleController(member.getSubcriptionOptions)
  );

  binder.attach(
    {
      endPoint: endpoints.member.isUserAMember,
      permissions: {
        membership: {
          view: true
        }
      },
      customPermissionDenied: validateCurrentUser
      // TODO:: Add Validation
    },
    binder.makeSimpleController(member.isUserAMember, function(req: Express.Request) {
      var params: mkmember.IsUserAMember.Params = {
        id: parseInt(req.param("id"))
      };
      return params;
    })
  );

  binder.attach(
    {
      endPoint: endpoints.member.updateMemberInfo,
      permissions: {
        membership: {
          edit: true
        }
      }
      // TODO:: Add Validation
    },
    binder.makeSimpleController(member.updateMemberInfo, function(req: Express.Request) {
      var params: mkmember.UpdateMemberInfo.Params = {
        id: parseInt(req.param("id")),
        subscriptionChoice: parseInt(req.param("subscriptionChoice"))
      };
      return params;
    })
  );
}
