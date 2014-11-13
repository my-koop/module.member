import utils = require("mykoop-utils");
export function addRoutes(metaData: utils.MetaDataBuilder) {
  metaData.addFrontendRoute({
    idPath: ["public","newMemBox"],
    component: "NewMemberBox",
    name: "newMemBox",
    path: "/newMemBox"
  });
}
