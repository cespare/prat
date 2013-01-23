(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.ChannelView = (function(_super) {

    __extends(ChannelView, _super);

    function ChannelView() {
      this.highlight = __bind(this.highlight, this);

      this.setInactive = __bind(this.setInactive, this);

      this.onClick = __bind(this.onClick, this);

      this.render = __bind(this.render, this);

      this.initialize = __bind(this.initialize, this);
      return ChannelView.__super__.constructor.apply(this, arguments);
    }

    _.extend(ChannelView.prototype, Backbone.Events);

    ChannelView.prototype.tagName = "div";

    ChannelView.prototype.className = "channel-button-container";

    ChannelView.prototype.initialize = function(options) {
      this.name = options.name;
      this.template = $("#channel-button-template").html();
      this.render();
      return this.channelButton = this.$el.find(".channel");
    };

    ChannelView.prototype.render = function() {
      var _this = this;
      this.$el.html(Mustache.render(this.template, {
        name: this.name
      }));
      this.$el.find(".leave").click(function() {
        return _this.trigger("leaveChannel", _this.name);
      });
      return this.$el.hover((function() {
        return _this.$el.addClass("hover");
      }), function() {
        return _this.$el.removeClass("hover");
      });
    };

    ChannelView.prototype.onClick = function() {
      $(".chat-controls .channel-name").html(this.name);
      this.channelButton.removeClass("unread");
      this.channelButton.addClass("current").off("click");
      return this.trigger("changeCurrentChannel", this.name);
    };

    ChannelView.prototype.setInactive = function() {
      return this.channelButton.removeClass("current").click(this.onClick);
    };

    ChannelView.prototype.highlight = function() {
      return this.channelButton.addClass("unread");
    };

    return ChannelView;

  })(Backbone.View);

  window.ChannelViewCollection = (function(_super) {

    __extends(ChannelViewCollection, _super);

    function ChannelViewCollection() {
      this.joinChannelClick = __bind(this.joinChannelClick, this);

      this.joinChannel = __bind(this.joinChannel, this);

      this.addNewChannelView = __bind(this.addNewChannelView, this);

      this.leaveChannel = __bind(this.leaveChannel, this);

      this.hideNewChannel = __bind(this.hideNewChannel, this);

      this.showNewChannel = __bind(this.showNewChannel, this);

      this.onChannelChange = __bind(this.onChannelChange, this);

      this.updateChannelOrder = __bind(this.updateChannelOrder, this);

      this.render = __bind(this.render, this);

      this.onSubmitChannel = __bind(this.onSubmitChannel, this);

      this.initialize = __bind(this.initialize, this);
      return ChannelViewCollection.__super__.constructor.apply(this, arguments);
    }

    ChannelViewCollection.prototype.tagName = "div";

    ChannelViewCollection.prototype.className = "channel-list-container";

    ChannelViewCollection.prototype.initialize = function(options) {
      var channel, _i, _len, _ref;
      this.channelsHash = {};
      this.currentChannel = options.currentChannel;
      this.messageHub = options.messageHub;
      this.channels = options.channels;
      _ref = options.channels;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        channel = _ref[_i];
        this.channelsHash[channel] = new ChannelView({
          name: channel
        });
      }
      $(".channel-controls-container").prepend(this.$el);
      this.$el.disableSelection();
      $('.add-channel-container').one("click", this.showNewChannel);
      $('.new-channel-name').click(function(event) {
        return event.stopPropagation();
      });
      $(".new-channel-name").on("keydown.return", this.onSubmitChannel);
      return this.render();
    };

    ChannelViewCollection.prototype.onSubmitChannel = function(event) {
      var newChannel;
      newChannel = event.target.value;
      if (newChannel.replace(/\s*$/, "") !== "") {
        this.joinChannel(newChannel);
      }
      return this.hideNewChannel({
        animate: false
      });
    };

    ChannelViewCollection.prototype.render = function() {
      var channel, _i, _len, _ref,
        _this = this;
      this.$el.children().detach();
      _ref = this.channels;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        channel = _ref[_i];
        this.addNewChannelView(this.channelsHash[channel]);
      }
      return this.$el.sortable({
        placeholder: "channel-button-placeholder",
        handle: ".reorder",
        axis: "y",
        start: function() {
          return $.fn.tipsy.disable();
        },
        stop: function() {
          return $.fn.tipsy.enable();
        },
        update: this.updateChannelOrder
      });
    };

    ChannelViewCollection.prototype.updateChannelOrder = function() {
      var channel, newDom, view, _ref;
      this.channels = new Array(this.channels.length);
      newDom = this.$el.children();
      _ref = this.channelsHash;
      for (channel in _ref) {
        view = _ref[channel];
        this.channels[newDom.index(view.el)] = channel;
      }
      return this.messageHub.reorderChannels(this.channels);
    };

    ChannelViewCollection.prototype.onChannelChange = function(nextCurrentChannel) {
      var _ref;
      if ((_ref = this.channelsHash[this.currentChannel]) != null) {
        _ref.setInactive();
      }
      this.currentChannel = nextCurrentChannel;
      this.trigger("changeCurrentChannel", nextCurrentChannel);
      return this.messageHub.switchChannel(this.currentChannel);
    };

    ChannelViewCollection.prototype.showNewChannel = function() {
      var _this = this;
      $(".plus-label").removeClass("unrotated");
      $(".plus-label").addClass("rotated");
      return $(".add-channel-container").stop(true).animate({
        width: "133px"
      }, 150, function() {
        $(".new-channel-name").show();
        return $(".new-channel-name").focus();
      }).one("click", function() {
        return _this.hideNewChannel();
      });
    };

    ChannelViewCollection.prototype.hideNewChannel = function(options) {
      var newChannelName, newChannelUI;
      if (options == null) {
        options = {
          animate: true
        };
      }
      newChannelName = $('.new-channel-name');
      newChannelName.val('');
      newChannelName.hide();
      newChannelUI = $(".add-channel-container");
      $(".plus-label").addClass("unrotated");
      $(".plus-label").removeClass("rotated");
      if (options.animate) {
        newChannelUI.stop(true).animate({
          width: "15px"
        }, 150, function() {
          return newChannelName.hide();
        });
      } else {
        newChannelName.hide();
        newChannelUI.width(15);
      }
      return newChannelUI.one("click", this.showNewChannel);
    };

    ChannelViewCollection.prototype.highlightChannel = function(channel) {
      return this.channelsHash[channel].highlight();
    };

    ChannelViewCollection.prototype.leaveChannel = function(channel) {
      this.channels = _.without(this.channels, channel);
      this.channelsHash[channel].$el.remove();
      delete this.channelsHash[channel];
      Util.cleanupTipsy();
      this.messageHub.leaveChannel(channel);
      this.trigger("leaveChannel", channel);
      if (channel === this.currentChannel && this.channels.length > 0) {
        return $("button.channel").first().click();
      }
    };

    ChannelViewCollection.prototype.addNewChannelView = function(view) {
      if (view.name !== this.currentChannel) {
        view.setInactive();
      } else {
        view.channelButton.addClass("current");
      }
      view.on("changeCurrentChannel", this.onChannelChange);
      view.on("leaveChannel", this.leaveChannel);
      return this.$el.append(view.$el);
    };

    ChannelViewCollection.prototype.joinChannel = function(channel) {
      var view;
      if (!_.include(this.channels, channel)) {
        this.channels.push(channel);
        view = this.channelsHash[channel] = new ChannelView({
          name: channel
        });
        this.addNewChannelView(view);
        this.trigger("joinChannel", channel);
        this.messageHub.joinChannel(channel);
      }
      return this.channelsHash[channel];
    };

    ChannelViewCollection.prototype.joinChannelClick = function(event) {
      var toAdd;
      toAdd = $(event.currentTarget).attr("data-channelname");
      return this.joinChannel(toAdd).onClick();
    };

    return ChannelViewCollection;

  })(Backbone.View);

}).call(this);
