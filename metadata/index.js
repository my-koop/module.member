var utils = require("mykoop-utils");
var routes = require("./routes");
var translations = require("../locales/index");
var endpoints = require("./endpoints");
var metaDataBuilder = new utils.MetaDataBuilder();
routes.addRoutes(metaDataBuilder);
metaDataBuilder.addData("translations", translations);
metaDataBuilder.addData("endpoints", endpoints);
metaDataBuilder.addData("adminEditPlugins", {
    membership: {
        titleKey: "member::memberAdhesionBoxTab",
        component: {
            resolve: "component",
            value: "NewMemberBox"
        }
    }
});
metaDataBuilder.addData("core", {
    contributions: {
        settings: {
            membership: {
                titleKey: "member::title",
                component: {
                    resolve: "component",
                    value: "MembershipSettings"
                }
            }
        }
    }
});
var metaData = metaDataBuilder.get();
module.exports = metaData;
