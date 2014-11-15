function getMemberInfo(req, res) {
    this.getMemberInfo(req.param("id"), function (err, isMember) {
        if (err) {
            return res.status(500).send("Unable to get member informations");
        }
        res.send({
            isMember: isMember
        });
    });
}
;
module.exports = getMemberInfo;
