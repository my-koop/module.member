var contributions = {
    core: {
        settings: {
            membership: {
                titleKey: "member::title",
                component: {
                    resolve: "component",
                    value: "MembershipSettings"
                },
                priority: 100
            }
        }
    },
    user: {
        profileEdit: {
            membership: {
                titleKey: "member::memberAdhesionBoxTab",
                component: {
                    resolve: "component",
                    value: "NewMemberBox"
                },
                hash: "membership",
                priority: 225,
                permissions: {
                    user: {
                        profile: {
                            membership: {
                                view: true
                            }
                        }
                    }
                }
            }
        }
    }
};
module.exports = contributions;
