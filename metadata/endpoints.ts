var endpoints = {
  example: {
    get1: {
      path: "/example/:id",
      method: "get",
      validation: {
        resolve: "validation",
        value: "get1"
      }
    },
    getSubOptions: {
      path: "/member/getSubOptions",
      method:"get"
    }
  }

}
export = endpoints;
