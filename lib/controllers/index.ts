import endpoints = require("../../metadata/endpoints");
import utils = require("mykoop-utils");
import Express = require("express");

import validation = require("../validation/index");

// Helper controllers.
//FIXME: Get this through the module manager...
//var validateCurrentUser = require("mykoop-user/lib/controllers/validateCurrentUser");

export function attachControllers(
  binder: utils.ModuleControllersBinder<mkmember.Module>
) {
  var member = binder.moduleInstance;
  binder.attach(
    {
      endPoint: endpoints.member.getSubcriptionOptions
    },
    binder.makeSimpleController(member.getSubcriptionOptions)
  );

  binder.attach(
    {
      endPoint: endpoints.member.isUserAMember
      /*
      permissions: {
        user: {
          profile: {
            membership: {
              view: true
            }
          }
        }
      },
      customPermissionDenied: validateCurrentUser
      */
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
        user: {
          profile: {
            membership: {
              edit: true
            }
          }
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
