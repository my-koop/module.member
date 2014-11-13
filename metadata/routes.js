function addRoutes(metaData) {
    metaData.addFrontendRoute({
        idPath: ["public", "newMemBox"],
        component: "NewMemberBox",
        name: "newMemBox",
        path: "/newMemBox"
    });
}
exports.addRoutes = addRoutes;
