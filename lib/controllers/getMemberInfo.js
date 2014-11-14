function getMemberInfo(req, res) {
    this.getMemberInfo(req.param("id"), function (err, infos) {
        if (err) {
            return res.status(500).send("Unable to get member informations");
        }
        res.send(infos);
    });
}
;
module.exports = getMemberInfo;
