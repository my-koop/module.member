var endpoints = require("../../metadata/endpoints");
function attachControllers(binder) {
    binder.attach({
        endPoint: endpoints.member.getSubcriptionOptions
    }, binder.makeSimpleController("getSubcriptionOptions"));
    binder.attach({
        endPoint: endpoints.member.isUserAMember
    }, binder.makeSimpleController("isUserAMember", function (req) {
        var params = {
            id: parseInt(req.param("id"))
        };
        return params;
    }));
    binder.attach({
        endPoint: endpoints.member.updateMemberInfo
    }, binder.makeSimpleController("updateMemberInfo", function (req) {
        var params = {
            id: parseInt(req.param("id")),
            feePrice: parseInt(req.param("feePrice")),
            subPrice: parseInt(req.param("subPrice"))
        };
        return params;
    }));
}
exports.attachControllers = attachControllers;
