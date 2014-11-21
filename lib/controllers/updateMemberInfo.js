function updateMemberInfo(req, res) {
    var info = {
        id: req.session.user.id,
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
