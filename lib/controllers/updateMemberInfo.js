function updateMemberInfo(req, res) {
    var info = {
        id: req.param("id"),
        isMember: req.param("isMember"),
        subPrice: req.param("subPrice"),
        feePrice: req.param("feePrice")
    };
    this.updateMemberInfo(info, function (err, options) {
        if (err) {
            return res.error(err);
        }
        res.end();
    });
}
;
module.exports = updateMemberInfo;