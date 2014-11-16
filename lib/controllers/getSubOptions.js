function getSubOptions(req, res) {
    this.getSubOptions(function (err, options) {
        if (err) {
            return res.error(err);
        }
        res.send(options);
    });
}
;
module.exports = getSubOptions;
