function getIsUserAMember(req, res) {
    this.getIsUserAMember(req.param("id"), function (err, isMember) {
        if (err) {
            return res.error(err);
        }
        res.send({
            isMember: isMember
        });
    });
}
;
module.exports = getIsUserAMember;
