var React = require("react");
var PropTypes = React.PropTypes;
var BSCol = require("react-bootstrap/Col");
var BSGrid = require("react-bootstrap/Grid");
var BSRow = require("react-bootstrap/Row");
var BSInput = require("react-bootstrap/Input");
var BSAlert = require("react-bootstrap/Alert");
var actions = require("actions");
var _ = require("lodash");

// Use this to provide localization strings.
var __ = require("language").__;

var NewMemberBox = React.createClass({

  mixins: [React.addons.LinkedStateMixin],

  propTypes : {
    userId: PropTypes.number.isRequired
  },

  getInitialState: function() {
    return {
      subOptions: [],
      feePrice: null,
      subPrice: null,
      totalPrice: null,
      memberInfo: null,
      alertMessage: null,
      alertStyle: null
    }
  },

  componentWillMount: function(){
    var self = this;
    var price;
    var options = [];

    //Getting fee and subscriptions costs
    actions.member.getSubOptions(
      {},
      function(err, res){
        if(err){
          self.setMessage(__("member::memberBoxFailure"), isError = true);
          return;
        } else {
          console.log(res);
          for(var row in res){
            if(res[row].type == "fee"){
              price = res[row].value;
            } else {
              var option = {};
              option["name"] = res[row].name;
              option["value"] = parseInt(res[row].value);
              options.push(option);
            }
          }
          self.setState({
            subOptions: options,
            feePrice : price,
            subPrice : _.min(options,'value').value
          })
        }
      }
    )

    //Getting member information for this user
    actions.member.getMemberInfo(
      {
        data: {
          id: self.props.userId
        }
      },
      function(err, res){
        if(err){
          self.setMessage(__("member::memberBoxFailure"), isError = true);
          return;
        }
        if(res.isMember){
          self.setState({
            isMember: res.isMember,
            feePrice: 0
          });
        } else {
          self.setState({
            isMember: res.isMember,
          });
        }
    })
  },

  onSubmit: function(e){
    e.preventDefault();
    var self = this;
    actions.member.updateMemberInfo(
    {
      data: {
        id: self.props.userId,
        isMember: self.state.isMember,
        subPrice: self.state.subPrice,
        feePrice: self.state.feePrice
      }
    }, function(err){
      if(err){
        self.setMessage(__("member::memberBoxFailure"), isError = true);
      } else {
        self.setMessage(__("member::memberBoxSuccess"), isError = false);
      }
    });

  },

  setMessage: function(message, isError){
    var style = (isError) ? "warning" : "success";
    this.setState({
      alertMessage: message,
      alertStyle: style
    })
  },

  displayFee: function(){
    var display = "";
    if(this.state.feePrice === 0){
      display = __("member::memberBoxFeeIsMember");
    } else {
      display = this.state.feePrice + "$";
    }
    return display;
  },

  calculateTotalPrice: function(){
    var total = parseInt(this.state.subPrice) + parseInt(this.state.feePrice);
    return total;
  },

  render: function() {
    var subOptions = _.map(this.state.subOptions,function(option){
      return (
          <option value={option.value}>
            {__("member::memberBoxDropdown" + option.name )}
          </option>
        );
    });

    return (
      <div>
        { this.state.alertMessage ?
            <BSAlert bsStyle={this.state.alertStyle}>
              {this.state.alertMessage}
            </BSAlert>
          : null }
        <form onSubmit={this.onSubmit}>
          <BSGrid>
            <BSRow>
              <BSCol xs={2} md={4}>
               {__("member::memberBoxFeeMessage")}
              </BSCol>
              <BSCol xs={2} md={4}>
                {this.displayFee()}
              </BSCol>
            </BSRow>
            <BSRow>
              <BSCol xs={2} md={4}>
                <BSInput
                  type="select"
                  label={__("member::memberBoxDropdown")}
                  valueLink={this.linkState("subPrice")}
                >
                  {subOptions}
                </BSInput>
              </BSCol>
              <BSCol xs={2} md={4}>
                {this.state.subPrice + "$"}
              </BSCol>
            </BSRow>
            <BSRow>
              <BSCol xs={2} md={4}>
                <span> Total: {this.calculateTotalPrice()}$ </span>
              </BSCol>
            </BSRow>
            <BSRow>
              <BSCol>
                <BSInput
                  type="submit"
                  bsStyle="primary"
                  bsSize="large"
                  value={__("user::register_submit_button")}
                />
              </BSCol>
            </BSRow>
          </BSGrid>
        </form>
      </div>
    );
  }
});

module.exports = NewMemberBox;
