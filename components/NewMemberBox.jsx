var React = require("react");
var PropTypes = React.PropTypes;

var BSInput = require("react-bootstrap/Input");
var BSPanel = require("react-bootstrap/Panel");

var MKPermissionMixin = require("mykoop-user/components/PermissionMixin");
var MKAlert = require("mykoop-core/components/Alert");

var _ = require("lodash");
var __ = require("language").__;
var actions = require("actions");
var formatMoney = require("language").formatMoney;
var formatDate = require("language").formatDate;
var moment = require("moment");

var defaultState = {
  subOptions: [],
  feePrice: null,
  subPrice: null,
  iSubscription: 0,
  totalPrice: null,
  isMember: null,
  errorMessage: null,
  successMessage: null,
  activeUntil: null
};
var NewMemberBox = React.createClass({
  mixins: [MKPermissionMixin],

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
            duration: parseInt(option.duration),
            price: parseFloat(option.price)
          }
        });
        var firstOption = _.first(options);
        self.setState({
          subOptions: options,
          feePrice : parseFloat(res.membershipFee),
          subPrice : firstOption && firstOption.price || 0
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
          isMember: res.isMember,
          activeUntil: res.activeUntil
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
        subscriptionChoice: self.state.iSubscription,
      }
    }, function(err) {
      self.setMessage("member::memberBoxRequest", !!err);
      if(!err) {
        var duration = self.state.subOptions[self.state.iSubscription].duration;
        self.setState({
          isMember: true,
          activeUntil: moment(self.state.activeUntil || undefined)
            .add(duration, "month").toDate()
        });
      }
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

  getSubscriptionCost: function() {
    return formatMoney(this.state.subPrice || 0);
  },

  getSubscriptionExpiration: function(){
    return (this.state.activeUntil) ?
            moment(this.state.activeUntil).format("LLL")
            : __("member::memberBoxSubscriptionExpired")
  },

  getNewSubscriptionExpiration: function(){
    if(!_.isEmpty(this.state.subOptions)){
      var subscriptionChoice = this.state.subOptions[this.state.iSubscription].duration;
      return moment(this.state.activeUntil || undefined )
        .add(subscriptionChoice, "month")
        .format("LLL");
    } else {
      return "";
    }
  },

  calculateTotalPrice: function() {
    var total = this.state.subPrice + this.getAdhesionFee();
    return formatMoney(total);
  },

  render: function() {
    var canEditSubscription = this.constructor.validateUserPermissions({
      membership: {
        edit: true
      }
    });

    var subOptions = _.map(this.state.subOptions, function(option, i) {
      var years = Math.floor(option.duration/12);
      var months = option.duration%12;
      var text = [];
      if(years) {
        text.push(__("time::count", {key: "year", count: years}));
      }
      if(months) {
        text.push(__("time::count", {key: "month", count: months}));
      }

      return (
          <option key={i} value={i}>
            {text.join(", ")}
          </option>
        );
    });

    var self = this;
    var subPriceLink = {
      value: this.state.iSubscription,
      requestChange: function(i) {
        i = parseInt(i);
        self.setState({
          iSubscription: i,
          subPrice: self.state.subOptions[i].price
        });
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
          <BSPanel header={__("member::memberBoxMembershipPanel")}>
            <p
              className={this.state.isMember ? "text-success" : "text-warning"}
            >
              {this.state.isMember ?
                __("member::membershipCurrent") :
                __("member::membershipInexistent")
              }.
            </p>
            {!this.state.isMember ?
              <p>
                {__("member::memberBoxFeeMessage")}
                {": "}
                <strong>{this.getFeeString()}</strong>
              </p>
            : null}
          </BSPanel>
          {canEditSubscription || this.state.isMember ?
            <BSPanel header={__("member::memberboxSubscriptionPanel")}>
              {this.state.isMember ?
                <p>
                  {__("member::memberBoxSubscriptionStatus") + ": " + this.getSubscriptionExpiration()}
                </p>
              : null}
              {canEditSubscription ? [
                <BSInput
                  key="options"
                  type="select"
                  label={__("member::memberBoxDropdown")}
                  valueLink={subPriceLink}
                >
                  {subOptions}
                </BSInput>,
                <p key="fee">
                  {__("member::memberBoxSubscriptionCost") + ": " + this.getSubscriptionCost() }
                </p>,
                <p key="expiration">
                  {__("member::memberBoxSubscriptionNewExpiration") + ": " + this.getNewSubscriptionExpiration() }
                </p>
              ] : null}
            </BSPanel>
          : null}
          {canEditSubscription ?
            <BSPanel header={__("member::memberBoxTransactionDetail")}>
              <p>
                { __("member::memberBoxTotal") + ": " +  this.calculateTotalPrice() }
              </p>
              <BSInput
                type="submit"
                bsStyle="success"
                value={__("member::createInvoice")}
              />
            </BSPanel>
          : null}
        </form>
      </div>
    );
  }
});

module.exports = NewMemberBox;
