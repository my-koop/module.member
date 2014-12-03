var React = require("react");

var BSCol = require("react-bootstrap/Col");
var BSInput = require("react-bootstrap/Input");

var MKOrderedTableActions = require("mykoop-core/components/OrderedTableActions");
var MKFormTable = require("mykoop-core/components/FormTable");
var MKListModButtons = require("mykoop-core/components/ListModButtons");

var _ = require("lodash");
var language = require("language");
var __ = language.__;
var getCurrencySymbol = language.getCurrencySymbol;

var MembershipSettings = React.createClass({
  mixins: [React.addons.LinkedStateMixin],

  propTypes: {
    settingsRaw: React.PropTypes.object.isRequired,
    addSettingsGetter: React.PropTypes.func.isRequired
  },

  getInitialState: function(props) {
    var props = props || this.props;
    return {
      subscriptions: _.map(
        JSON.parse(props.settingsRaw.subscriptions),
        function(subscription) {
          subscription.duration = parseInt(subscription.duration);
          subscription.price = Number(subscription.price);
          return subscription;
        }
      ),
      membershipFee: props.settingsRaw.membershipFee
    };
  },

  componentWillMount: function () {
    this.props.addSettingsGetter(this.getSettings);
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState(this.getInitialState(nextProps));
  },

  getSettings: function() {
    return {
      subscriptions: JSON.stringify(this.state.subscriptions),
      membershipFee: 10
    };
  },

  addSubscriptionOption: function() {
    var subscriptions = this.state.subscriptions;
    subscriptions.push({
      duration: 0,
      price: 0
    });
    this.setSubscriptions(subscriptions);
  },

  setSubscriptions: function(subscriptions) {
    this.setState({
      subscriptions: subscriptions
    });
  },

  render: function () {
    var self = this;
    var subscriptions = this.state.subscriptions;
    var subscriptionsRows = _.map(
      subscriptions,
      function(subscription, i) {
        var durationLink = {
          value: subscription.duration,
          requestChange: function(newDuration) {
            subscriptions[i].duration = parseInt(newDuration) || "";
            self.setSubscriptions(subscriptions);
          }
        };
        var priceLink = {
          value: subscription.price,
          requestChange: function(newPrice) {
            subscriptions[i].price = newPrice;
            self.setSubscriptions(subscriptions);
          }
        };
        return [
          <MKOrderedTableActions
            content={subscriptions}
            index={i}
            onContentModified={self.setSubscriptions}
          />,
          <BSInput
            type="number"
            valueLink={durationLink}
            addonAfter={__("time::month", {count: durationLink.value})}
          />,
          <BSInput
            type="number"
            valueLink={priceLink}
            addonAfter={getCurrencySymbol()}
          />
        ];
      }
    );

    var newSubscriptionButton = [{
      icon: "plus",
      tooltip: __("member::addSubscriptionOption"),
      callback: this.addSubscriptionOption
    }];
    subscriptionsRows.unshift([
      <MKListModButtons
        buttons={newSubscriptionButton}
      />
    ]);

    var length = subscriptions.length;
    var uniqueActionsCount = length > 1 ? (length > 2 ? 3 : 2) : 1;
    var tableHeaders = [
      {
        title: __("actions"),
        props: {className: "list-mod-min-width-" + uniqueActionsCount}
      },
      __("member::duration"),
      __("price")
    ];

    return (
      <BSCol md={6}>
        <BSInput
          type="number"
          label={__("member::membershipFee")}
          addonBefore={getCurrencySymbol()}
          valueLink={this.linkState("membershipFee")}
        />
        <MKFormTable
          headers={tableHeaders}
          data={subscriptionsRows}
        />
      </BSCol>
    );
  }
});

module.exports = MembershipSettings;
