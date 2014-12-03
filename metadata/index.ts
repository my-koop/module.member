import utils = require("mykoop-utils");
import routes = require("./routes");
import translations = require("../locales/index");
import endpoints = require("./endpoints");

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
export = metaData;
