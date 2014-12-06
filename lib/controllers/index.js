var endpoints = require("../../metadata/endpoints");
// Helper controllers.
//FIXME: Get this through the module manager...
//var validateCurrentUser = require("mykoop-user/lib/controllers/validateCurrentUser");
function attachControllers(binder) {
    var member = binder.moduleInstance;
    binder.attach({
        endPoint: endpoints.member.getSubcriptionOptions
    }, binder.makeSimpleController(member.getSubcriptionOptions));
    binder.attach({
        endPoint: endpoints.member.isUserAMember
    }, binder.makeSimpleController(member.isUserAMember, function (req) {
        var params = {
            id: parseInt(req.param("id"))
        };
        return params;
    }));
    binder.attach({
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
    }, binder.makeSimpleController(member.updateMemberInfo, function (req) {
        var params = {
            id: parseInt(req.param("id")),
            subscriptionChoice: parseInt(req.param("subscriptionChoice"))
        };
        return params;
    }));
}
exports.attachControllers = attachControllers;
