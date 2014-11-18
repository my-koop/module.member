function getSubcriptionOptions(req, res) {
    this.getSubcriptionOptions(function (err, ret) {
        if (err) {
            return res.error(err);
        }
        res.send({
            options: ret.options,
            price: ret.price
        });
    });
}
;
module.exports = getSubcriptionOptions;
