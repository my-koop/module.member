var MKOption = (function () {
    function MKOption(optionRow) {
        this.value = optionRow.value;
        this.name = optionRow.name;
        this.type = optionRow.type;
    }
    return MKOption;
})();
module.exports = MKOption;
