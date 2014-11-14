class MKOption implements mkmember.MKOption {
  value: string;
  name: string;
  type: string;

  constructor(optionRow){
    this.value = optionRow.value;
    this.name = optionRow.name;
    this.type = optionRow.type;
  }
}
export = MKOption;
