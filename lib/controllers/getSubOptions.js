function getSubOptions(req, res) {
    this.getSubOptions(function (err, ret) {
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
module.exports = getSubOptions;
