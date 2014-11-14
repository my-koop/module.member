var metaData = require("../../metadata/index");
// Controllers.
var getSubOptions = require("./getSubOptions");
var endPoints = metaData.endpoints;
function attachControllers(binder) {
    binder.attach({
        endPoint: endPoints.member.getSubOptions
    }, getSubOptions);
}
exports.attachControllers = attachControllers;
