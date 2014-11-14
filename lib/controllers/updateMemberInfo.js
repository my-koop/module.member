function updateMemberInfo(req, res) {
    this.updateMemberInfo(function (err, options) {
        if (err) {
            return res.error(err);
        }
        res.end();
    });
}
;
module.exports = updateMemberInfo;
