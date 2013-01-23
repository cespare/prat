(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.ChannelUsers = (function() {

    function ChannelUsers(messageHub, initialUsers, currentChannel, channelViewCollection) {
      this.messageHub = messageHub;
      this.initialUsers = initialUsers;
      this.leaveChannel = __bind(this.leaveChannel, this);

      this.joinChannel = __bind(this.joinChannel, this);

      this.updateUserStatus = __bind(this.updateUserStatus, this);

      this.displayUserStatuses = __bind(this.displayUserStatuses, this);

      this.removeUserStatuses = __bind(this.removeUserStatuses, this);

      this.populateNewUserStatusesView = __bind(this.populateNewUserStatusesView, this);

      this.addUserStatusesView = __bind(this.addUserStatusesView, this);

      this.populateInitialUserStatuses = __bind(this.populateInitialUserStatuses, this);

      this.addUserStatusesIfNecessary = __bind(this.addUserStatusesIfNecessary, this);

      this.resetUserStatuses = __bind(this.resetUserStatuses, this);

      this.updateAllChannels = __bind(this.updateAllChannels, this);

      this.views = {};
      this.init(currentChannel, channelViewCollection);
    }

    ChannelUsers.prototype.init = function(currentChannel, channelViewCollection) {
      var channel, users, _ref;
      _ref = this.initialUsers;
      for (channel in _ref) {
        users = _ref[channel];
        this.addUserStatusesView(channel);
        if (channel === currentChannel) {
          this.displayUserStatuses(channel);
        }
      }
      this.messageHub.on("user_active user_offline", this.updateUserStatus).on("join_channel", this.joinChannel).on("leave_channel", this.leaveChannel).on("reconnect", this.updateAllChannels);
      this.messageHub.blockDequeue();
      return channelViewCollection.on("changeCurrentChannel", this.displayUserStatuses).on("leaveChannel", this.removeUserStatuses).on("joinChannel", this.populateNewUserStatusesView);
    };

    ChannelUsers.prototype.updateAllChannels = function() {
      var _this = this;
      return $.ajax({
        url: "/api/user_status",
        dataType: "json",
        success: this.resetUserStatuses,
        error: function(xhr, textStatus, errorThrown) {
          return console.log("Error updating channels: " + textStatus + ", " + errorThrown);
        },
        complete: function() {
          return _this.messageHub.unblockDequeue();
        }
      });
    };

    ChannelUsers.prototype.resetUserStatuses = function(channelsHash) {
      var channel, users, _results;
      _results = [];
      for (channel in channelsHash) {
        users = channelsHash[channel];
        if (!this.views[channel]) {
          continue;
        }
        _results.push(this.views[channel].collection.reset(users));
      }
      return _results;
    };

    ChannelUsers.prototype.addUserStatusesIfNecessary = function(users, channel) {
      var collection, user, _i, _len, _results;
      if (this.views[channel] == null) {
        return;
      }
      collection = this.views[channel].collection;
      _results = [];
      for (_i = 0, _len = users.length; _i < _len; _i++) {
        user = users[_i];
        if (!collection.get(user.email)) {
          _results.push(collection.add(user));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    ChannelUsers.prototype.populateInitialUserStatuses = function() {
      var channel, users, _ref, _results;
      _ref = this.initialUsers;
      _results = [];
      for (channel in _ref) {
        users = _ref[channel];
        _results.push(this.addUserStatusesIfNecessary(users, channel));
      }
      return _results;
    };

    ChannelUsers.prototype.addUserStatusesView = function(channel) {
      var usersCollection, usersView;
      usersCollection = new UserStatusCollection;
      usersView = new UserStatusView({
        collection: usersCollection
      });
      $(".right-sidebar").append(usersView.$el);
      usersCollection.on("change add remove reset", usersView.render);
      usersView.render();
      return this.views[channel] = usersView;
    };

    ChannelUsers.prototype.populateNewUserStatusesView = function(channel) {
      var _this = this;
      this.addUserStatusesView(channel);
      return $.ajax({
        url: "/api/user_status/" + (encodeURIComponent(channel)),
        dataType: "json",
        success: function(data) {
          return _this.addUserStatusesIfNecessary(data, channel);
        }
      });
    };

    ChannelUsers.prototype.removeUserStatuses = function(channel) {
      var usersView;
      if (this.views[channel] == null) {
        return;
      }
      usersView = this.views[channel];
      delete this.views[channel];
      return usersView.remove();
    };

    ChannelUsers.prototype.displayUserStatuses = function(channel) {
      if (this.views[channel] == null) {
        return;
      }
      $(".channel-users.current").removeClass("current");
      return this.views[channel].$el.addClass("current");
    };

    ChannelUsers.prototype.updateUserStatus = function(event, data) {
      var model, newStatus, view;
      newStatus = event.split("_")[1];
      view = this.views[data.channel];
      model = view.collection.get(data.user.email);
      if (model != null) {
        model.set({
          status: newStatus
        });
        return view.collection.sort();
      } else {
        return view.collection.add(data.user);
      }
    };

    ChannelUsers.prototype.joinChannel = function(event, data) {
      var collection;
      collection = this.views[data.channel].collection;
      if (collection.get(data.user.email) != null) {
        return;
      }
      return collection.add(data.user);
    };

    ChannelUsers.prototype.leaveChannel = function(event, data) {
      var collection;
      collection = this.views[data.channel].collection;
      return collection.remove(data.user.email);
    };

    return ChannelUsers;

  })();

  window.UserStatus = (function(_super) {

    __extends(UserStatus, _super);

    function UserStatus() {
      return UserStatus.__super__.constructor.apply(this, arguments);
    }

    UserStatus.prototype.initialize = function(options) {
      return this.attributes.isCurrentUser = this.attributes.email === CurrentUserEmail;
    };

    UserStatus.prototype.idAttribute = "email";

    return UserStatus;

  })(Backbone.Model);

  window.UserStatusCollection = (function(_super) {

    __extends(UserStatusCollection, _super);

    function UserStatusCollection() {
      return UserStatusCollection.__super__.constructor.apply(this, arguments);
    }

    UserStatusCollection.prototype.model = UserStatus;

    UserStatusCollection.prototype.comparator = function(userA, userB) {
      var attrA, attrB;
      attrA = userA.attributes;
      attrB = userB.attributes;
      if (attrA.isCurrentUser) {
        return -1;
      } else if (attrB.isCurrentUser) {
        return 1;
      } else if (attrA.status === "active" && attrB.status !== "active") {
        return -1;
      } else if (attrB.status === "active" && attrA.status !== "active") {
        return 1;
      } else if (attrA.name === attrB.name) {
        return 0;
      } else if (attrA.name < attrB.name) {
        return -1;
      } else if (attrA.name > attrB.name) {
        return 1;
      }
    };

    return UserStatusCollection;

  })(Backbone.Collection);

  window.UserStatusView = (function(_super) {

    __extends(UserStatusView, _super);

    function UserStatusView() {
      this.render = __bind(this.render, this);

      this.renderUserStatusCollection = __bind(this.renderUserStatusCollection, this);

      this.renderUserStatus = __bind(this.renderUserStatus, this);
      return UserStatusView.__super__.constructor.apply(this, arguments);
    }

    UserStatusView.prototype.initialize = function() {
      return this.userStatusTemplate = $("#user-status-template").html();
    };

    UserStatusView.prototype.tagname = "div";

    UserStatusView.prototype.className = "channel-users";

    UserStatusView.prototype.renderUserStatus = function(user) {
      return Mustache.render(this.userStatusTemplate, user.attributes);
    };

    UserStatusView.prototype.renderUserStatusCollection = function() {
      return this.collection.map(this.renderUserStatus).join("");
    };

    UserStatusView.prototype.render = function() {
      Util.cleanupTipsy();
      this.$el.html(this.renderUserStatusCollection());
      return this;
    };

    return UserStatusView;

  })(Backbone.View);

}).call(this);
