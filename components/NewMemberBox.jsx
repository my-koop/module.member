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
      totalPrice: null
    }
  },

  componentWillMount: function(){
    var self = this;
    var price;
    var options = [];

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
  },

  onSubmit: function(){

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
              Adhesion a la coop
            </BSCol>
            <BSCol xs={2} md={4}>
              {this.state.feePrice + "$"}
            </BSCol>
          </BSRow>
          <BSRow>
            <BSCol xs={2} md={4}>
              <BSInput
                type="select"
                defaultValue="3"
                label="Duree de l'abonnement"
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
              <span> Total: {parseInt(this.state.feePrice) + parseInt(this.state.subPrice)} $ </span>
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
