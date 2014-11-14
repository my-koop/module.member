var metaData = require("../../metadata/index");
// Controllers.
var getSubOptions = require("./getSubOptions");
var getMemberInfo = require("./getMemberInfo");
var endPoints = metaData.endpoints;
function attachControllers(binder) {
    binder.attach({
        endPoint: endPoints.member.getSubOptions
    }, getSubOptions);
    binder.attach({
        endPoint: endPoints.member.getMemberInfo
    }, getMemberInfo);
}
exports.attachControllers = attachControllers;
