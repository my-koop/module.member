var metaData = require("../../metadata/index");
// Controllers.
var getSubOptions = require("./getSubOptions");
var getMemberInfo = require("./getMemberInfo");
var updateMemberInfo = require("./updateMemberInfo");
var endPoints = metaData.endpoints;
function attachControllers(binder) {
    binder.attach({
        endPoint: endPoints.member.getSubOptions
    }, getSubOptions);
    binder.attach({
        endPoint: endPoints.member.getMemberInfo
    }, getMemberInfo);
    binder.attach({
        endPoint: endPoints.member.updateMemberInfo
    }, updateMemberInfo);
}
exports.attachControllers = attachControllers;
