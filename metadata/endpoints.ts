var endpoints = {
  member: {
    getSubcriptionOptions: {
      path: "/members/options",
      method:"get"
    },
    isUserAMember: {
      path: "/users/:id/ismember",
      method: "get"
    },
    updateMemberInfo: {
      path: "/users/:id/members",
      method: "put"
    }
  }

}
export = endpoints;
