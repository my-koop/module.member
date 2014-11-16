function getMemberInfo(req, res) {
    this.getMemberInfo(req.param("id"), function (err, isMember) {
        if (err) {
            return res.error(err);
        }
        res.send({
            isMember: isMember
        });
    });
}
;
module.exports = getMemberInfo;
