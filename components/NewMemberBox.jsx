// Good old React Component!

var React = require("react");
var PropTypes = React.PropTypes;
var Link = require("react-router").Link;
var BSCol = require("react-bootstrap/Col");
var BSGrid = require("react-bootstrap/Grid");
var BSRow = require("react-bootstrap/Row");
var BSInput = require("react-bootstrap/Input");
var routeData = require("dynamic-metadata").routes;
var BSButton = require("react-bootstrap/Button");
var actions = require("actions");
var _ = require("lodash");

// Use this to provide localization strings.
var __ = require("language").__;

var NewMemberBox = React.createClass({

  mixins: [React.addons.LinkedStateMixin],

  propTypes : {
    displayName : PropTypes.string
  },

  getInitialState: function() {
    return {
      subOptions: {},
      feePrice: null,
      subPrice: 3,
      totalPrice: null,
      memberInfo: {}
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
          console.error(err);
          return;
        } else {
          console.log(res);
          for(var row in res){
            if(res[row].type == "fee"){
              price = res[row].value;
            } else {
              var option = {};
              option["name"] = res[row].name;
              option["value"] = res[row].value;
              options.push(option);
            }
          }
          self.setState({
            subOptions: options,
            feePrice : price
          })
        }
      }
    )

    //Getting member information for this user
    actions.member.getMemberInfo(
      {
        data: {
          id: self.props.id
        }
      },
      function(err, info){
        if(err){
          console.error(err);
          return;
        }
        if(!info){
          //User is not a member
          self.setState({
            memberInfo: null
          });
        } else {
          //User has an entry in member table
          self.setState({
            memberInfo : info
          });
        }
      }
    )
  },

  onSubmit: function(){

  },

  displayFee: function(){
    var display = "";
    if(this.state.memberInfo.isMember){
      display = __("member::memberBoxFeeIsMember");
    } else {
      display = this.state.feePrice + "$";
    }
    return display;
  },
  calculateTotalPrice: function(){
    var total = parseInt(this.state.subPrice) + (this.state.memberInfo.isMember?0:this.state.feePrice);
    return total;
  },

  //FIX ME: Submit request
    //Store form values in state
    //Send data to controller
/* */


  render: function() {
    var name = this.props.displayName || this.props.name || "Empty";

   var subOptions = _.map(this.state.subOptions,function(option){
      return (
          <option value={option.value}>
            {__("member::memberBoxDropdown" + option.name )}
          </option>
        );
    });

    return (
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
                defaultValue="3"
                label={__("member::memberBoxDropdown")}
                valueLink={this.linkState("subPrice")}
              >
                {subOptions}
              </BSInput>
            </BSCol>
            <BSCol xs={2} md={4}>
              <span> {this.state.subPrice + "$"} </span>
            </BSCol>
          </BSRow>
          <BSRow>
            <BSCol xs={2} md={4}>
              <span> NOTICE MESSAGE avec date dexpiration </span>
            </BSCol>
            <BSCol xs={2} md={4}>
              <span> Total: {this.calculateTotalPrice()}$ </span>
            </BSCol>
          </BSRow>
          <BSRow>
            <BSInput
              type="submit"
              bsStyle="primary"
              bsSize="large"
              value={__("user::register_submit_button")}
              className="pull-right"
            />
          </BSRow>
        </BSGrid>
      </form>
    );
  }
});

module.exports = NewMemberBox;
