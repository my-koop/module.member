var endpoints = require("../../metadata/endpoints");
function attachControllers(binder) {
    var member = binder.moduleInstance;
    var user = member.getModuleManager().get("user");
    var validateCurrentUser = user.constructor.validateCurrentUser;
    binder.attach({
        endPoint: endpoints.member.getSubcriptionOptions
    }, binder.makeSimpleController(member.getSubcriptionOptions));
    binder.attach({
        endPoint: endpoints.member.isUserAMember,
        permissions: {
            membership: {
                view: true
            }
        },
        customPermissionDenied: validateCurrentUser
    }, binder.makeSimpleController(member.isUserAMember, function (req) {
        var params = {
            id: parseInt(req.param("id"))
        };
        return params;
    }));
    binder.attach({
        endPoint: endpoints.member.updateMemberInfo,
        permissions: {
            membership: {
                edit: true
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
