var metaData = require("../../metadata/index");
// Controllers.
var getSubcriptionOptions = require("./getSubcriptionOptions");
var getMemberInfo = require("./getMemberInfo");
var updateMemberInfo = require("./updateMemberInfo");
var endPoints = metaData.endpoints;
function attachControllers(binder) {
    binder.attach({
        endPoint: endPoints.member.getSubcriptionOptions
    }, getSubcriptionOptions);
    binder.attach({
        endPoint: endPoints.member.getMemberInfo
    }, getMemberInfo);
    binder.attach({
        endPoint: endPoints.member.updateMemberInfo
    }, updateMemberInfo);
}
exports.attachControllers = attachControllers;
