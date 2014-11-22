var React = require("react");
var PropTypes = React.PropTypes;

var BSCol = require("react-bootstrap/Col");
var BSGrid = require("react-bootstrap/Grid");
var BSRow = require("react-bootstrap/Row");
var BSInput = require("react-bootstrap/Input");

var MKAlert = require("mykoop-core/components/Alert");

var _ = require("lodash");
var __ = require("language").__;
var actions = require("actions");
var formatMoney = require("language").formatMoney;

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
      isMember: null,
      errorMessage: null,
      successMessage: null
    }
  },

  componentDidMount: function() {
    var self = this;
    //Getting fee and subscriptions costs
    actions.member.getSubcriptionOptions(
      function(err, res) {
        if(err) {
          return self.setMessage(__("member::memberBoxRequest"), isError = true);
        }
        console.log(res);
        self.setState({
          subOptions: res.options,
          feePrice : self.state.isMember ? 0 : res.price,
          subPrice : _.min(res.options, 'value').value
        });
      }
    );

    actions.member.isUserAMember(
      {
        data: {
          id: self.props.userId
        }
      },
      function(err, res) {
        if(err) {
          return self.setMessage(__("member::memberBoxRequest"), isError = true);
        }
        self.setState({
          isMember: res.isMember,
          feePrice: res.isMember ? 0 : self.state.feePrice
        });
      }
    );
  },

  onSubmit: function(e) {
    e.preventDefault();
    var self = this;
    actions.member.updateMemberInfo(
    {
      data: {
        id: self.props.userId,
        subPrice: self.state.subPrice,
        feePrice: self.state.feePrice
      }
    }, function(err) {
      self.setMessage("member::memberBoxRequest", !!err);
    });
  },

  setMessage: function(localesKey, isError) {
    var message = __(localesKey, { context: isError ? "fail": "success" })
    this.setState({
      errorMessage: isError ? message : null,
      successMessage: !isError ? message : null
    })
  },

  getFeeString: function() {
    var display = "";
    if(this.state.isMember) {
      display = __("member::memberBoxFeeIsMember");
    } else {
      display = formatMoney((this.state.feePrice? this.state.feePrice : 0));
    }
    return display;
  },

  getSubscriptionString: function() {
    return formatMoney(this.state.subPrice? parseInt(this.state.subPrice) : 0 );
  },

  calculateTotalPrice: function() {
    var total = parseInt(this.state.subPrice) + parseInt(this.state.feePrice);
    return formatMoney(total);
  },

  render: function() {
    var subOptions = _.map(this.state.subOptions, function(option, key) {
      return (
          <option key={key} value={option.value}>
            {__("member::memberBoxDropdown", {context : option.name } )}
          </option>
        );
    });

    return (
      <div>
        <MKAlert bsStyle="danger" permanent>
          {this.state.errorMessage}
        </MKAlert>
        <MKAlert bsStyle="success">
          {this.state.successMessage}
        </MKAlert>
        <form onSubmit={this.onSubmit}>
          <BSGrid>
            <BSRow>
              <BSCol xs={2} md={4}>
                {__("member::memberBoxFeeMessage")}
              </BSCol>
              <BSCol xs={2} md={4}>
                {this.getFeeString()}
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
                { this.getSubscriptionString() }
              </BSCol>
            </BSRow>
            <BSRow>
              <BSCol xs={2} md={4}>
                <span>
                {
                  __("member::memberBoxTotal") + ":" +  this.calculateTotalPrice()
                }
                </span>
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
