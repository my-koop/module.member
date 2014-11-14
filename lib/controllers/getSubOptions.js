function getSubOptions(req, res) {
    this.getSubOptions(function (err, options) {
        if (err) {
            return res.status(500).send("Unable to get options");
        }
        res.send(options);
    });
}
;
module.exports = getSubOptions;
