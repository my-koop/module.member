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

var defaultState = {
  subOptions: [],
  feePrice: null,
  subPrice: null,
  iSubscription: 0,
  totalPrice: null,
  isMember: null,
  errorMessage: null,
  successMessage: null
};
var NewMemberBox = React.createClass({

  propTypes : {
    userId: PropTypes.number.isRequired
  },

  getInitialState: function() {
    return defaultState;
  },

  componentWillReceiveProps: function (nextProps) {
    if(this.props.userId !== nextProps.userId) {
      this.updateMembershipInformation(nextProps.userId);
    }
  },

  componentWillMount: function() {
    var self = this;
    //Getting fee and subscriptions costs
    actions.member.getSubcriptionOptions(
      function(err, res) {
        if(err) {
          return self.setMessage(__("member::memberBoxRequest"), isError = true);
        }
        var options = _.map(res.options, function(option) {
          return {
            name: option.name,
            value: parseInt(option.value) || 0
          }
        });
        options = _.sortBy(options, function(opt) {return opt.value;});

        self.setState({
          subOptions: options,
          feePrice : parseInt(res.price) || 0,
          subPrice : options.length !== 0 ? options[0].value : 0
        });
      }
    );
    this.updateMembershipInformation(this.props.userId);
  },

  updateMembershipInformation: function(userId) {
    var self = this;
    // Reset everything except subscription informations
    self.setState(_.omit(defaultState,
      "subOptions",
      "feePrice",
      "subPrice"
    ));
    actions.member.isUserAMember(
      {
        data: {
          id: userId
        }
      },
      function(err, res) {
        if(err) {
          return self.setMessage(__("member::memberBoxRequest"), isError = true);
        }
        self.setState({
          isMember: res.isMember
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
        subscriptionChoice: self.state.subOptions[parseInt(self.state.iSubscription)].name,
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

  getAdhesionFee: function() {
    return this.state.isMember ? 0 : this.state.feePrice || 0;
  },

  getFeeString: function() {
    var display = "";
    if(this.state.isMember) {
      display = __("member::memberBoxFeeIsMember");
    } else {
      display = formatMoney(this.getAdhesionFee());
    }
    return display;
  },

  getSubscriptionString: function() {
    return formatMoney(this.state.subPrice || 0);
  },

  calculateTotalPrice: function() {

    var total = this.state.subPrice + this.getAdhesionFee();
    return formatMoney(total);
  },

  render: function() {
    var subOptions = _.map(this.state.subOptions, function(option, i) {
      return (
          <option key={i} value={i}>
            {__("member::memberBoxDropdown", {context : option.name } )}
          </option>
        );
    });

    var self = this;
    var subPriceLink = {
      value: this.state.iSubscription,
      requestChange: function(i) {
        self.setState({
          iSubscription: i,
          subPrice: self.state.subOptions[parseInt(i)].value
        })
      }
    }

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
                  valueLink={subPriceLink}
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
