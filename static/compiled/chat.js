(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.MessagesView = (function(_super) {

    __extends(MessagesView, _super);

    function MessagesView() {
      return MessagesView.__super__.constructor.apply(this, arguments);
    }

    MessagesView.prototype.tagName = "div";

    MessagesView.prototype.className = "chat-messages";

    return MessagesView;

  })(Backbone.View);

  window.MessagesViewCollection = (function(_super) {

    __extends(MessagesViewCollection, _super);

    function MessagesViewCollection() {
      this.pullMissingMessages = __bind(this.pullMissingMessages, this);

      this.appendMessage = __bind(this.appendMessage, this);

      this.renderMessagePartial = __bind(this.renderMessagePartial, this);

      this.newMessageInTimeWindow = __bind(this.newMessageInTimeWindow, this);

      this.appendMessages = __bind(this.appendMessages, this);

      this.appendInitialMessages = __bind(this.appendInitialMessages, this);

      this.onPreviewMessage = __bind(this.onPreviewMessage, this);

      this.onNewMessage = __bind(this.onNewMessage, this);

      this.toggleTitle = __bind(this.toggleTitle, this);

      this.clearToggleTitleInterval = __bind(this.clearToggleTitleInterval, this);

      this.checkAndNotify = __bind(this.checkAndNotify, this);

      this.changeCurrentChannel = __bind(this.changeCurrentChannel, this);

      this.removeChannel = __bind(this.removeChannel, this);

      this.addChannel = __bind(this.addChannel, this);

      this.render = __bind(this.render, this);
      return MessagesViewCollection.__super__.constructor.apply(this, arguments);
    }

    MessagesViewCollection.prototype.tagName = "div";

    MessagesViewCollection.prototype.className = "chat-messages-container";

    MessagesViewCollection.prototype.initialize = function(options) {
      var channel, view, _i, _len, _ref;
      this.channelHash = {};
      this.channels = options.channels;
      this.collapseTimeWindow = options.collapseTimeWindow;
      this.dateTimeHelper = options.dateTimeHelper;
      this.username = options.username;
      this.sound = options.sound;
      this.title = options.title;
      this.messageHub = options.messageHub;
      this.latestMessage = {
        datetime: 0
      };
      this.channelViewCollection = options.channelViewCollection;
      $(".input-container").before(this.$el);
      this.messageHub.on("publish_message", this.onNewMessage).on("preview_message", this.onPreviewMessage).on("reconnect", this.pullMissingMessages);
      this.messageHub.blockDequeue();
      this.channelViewCollection.on("changeCurrentChannel", this.changeCurrentChannel).on("leaveChannel", this.removeChannel).on("joinChannel", this.addChannel);
      _ref = options.channels;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        channel = _ref[_i];
        view = this.channelHash[channel] = new MessagesView();
        if (channel === this.channelViewCollection.currentChannel) {
          view.$el.addClass("current");
        }
      }
      this.messageContainerTemplate = $("#message-container-template").html();
      this.messagePartialTemplate = $("#message-partial-template").html();
      return this.render();
    };

    MessagesViewCollection.prototype.render = function() {
      var channel, _i, _len, _ref, _results;
      this.$el.children().detach();
      _ref = this.channels;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        channel = _ref[_i];
        _results.push(this.$el.append(this.channelHash[channel].$el));
      }
      return _results;
    };

    MessagesViewCollection.prototype.addChannel = function(channel) {
      var _this = this;
      this.channelHash[channel] = new MessagesView();
      this.$el.append(this.channelHash[channel].$el);
      return $.ajax({
        url: "/api/messages/" + (encodeURIComponent(channel)),
        dataType: "json",
        success: function(messages) {
          return _this.appendMessages(messages, {
            quiet: true
          });
        }
      });
    };

    MessagesViewCollection.prototype.removeChannel = function(channel) {
      this.channelHash[channel].$el.remove();
      return delete this.channelHash[channel];
    };

    MessagesViewCollection.prototype.changeCurrentChannel = function(newChannel) {
      var channel, view, _ref;
      _ref = this.channelHash;
      for (channel in _ref) {
        view = _ref[channel];
        view.$el.removeClass("current");
      }
      this.channelHash[newChannel].$el.addClass("current");
      return Util.scrollToBottom({
        animate: false
      });
    };

    MessagesViewCollection.prototype.checkAndNotify = function(message, author) {
      if (!document.hasFocus() || document.webkitHidden) {
        this.lastAuthor = author;
        if (this.toggleTitleInterval == null) {
          this.toggleTitleInterval = setInterval(this.toggleTitle, 1500);
        }
        window.onfocus = this.clearToggleTitleInterval;
        if (message.find(".its-you").length > 0) {
          return this.sound.playNewMessageAudio();
        }
      }
    };

    MessagesViewCollection.prototype.clearToggleTitleInterval = function() {
      window.onfocus = null;
      clearInterval(this.toggleTitleInterval);
      this.toggleTitleInterval = null;
      $("title").html(this.title);
      return this.showingTitle = true;
    };

    MessagesViewCollection.prototype.toggleTitle = function() {
      var newTitle;
      newTitle = this.showingTitle ? "" + this.lastAuthor + " says..." : this.title;
      $("title").html(newTitle);
      return this.showingTitle = !this.showingTitle;
    };

    MessagesViewCollection.prototype.onNewMessage = function(event, messageObject) {
      var $message, bottom, messagePartial;
      bottom = Util.scrolledToBottom();
      messagePartial = this.renderMessagePartial(messageObject);
      if (messageObject.channel !== this.channelViewCollection.currentChannel) {
        this.channelViewCollection.highlightChannel(messageObject.channel);
      }
      this.checkAndNotify(messagePartial, messageObject.user.name);
      $message = this.appendMessage(messageObject, messagePartial);
      if (bottom) {
        Util.scrollToBottom({
          animate: true
        });
        return $message.find("img").one("load", function() {
          return Util.scrollToBottom({
            animate: true
          });
        });
      }
    };

    MessagesViewCollection.prototype.onPreviewMessage = function(event, messageObject) {
      var $messageContainer, messagePreviewDiv;
      messagePreviewDiv = $("#message-preview .message");
      $messageContainer = $(Mustache.render(this.messagePartialTemplate, messageObject));
      messagePreviewDiv.replaceWith($messageContainer);
      return $("#message-preview").modal("show");
    };

    MessagesViewCollection.prototype.appendInitialMessages = function(messageDict) {
      var channel, messages, _results;
      _results = [];
      for (channel in messageDict) {
        messages = messageDict[channel];
        _results.push(this.appendMessages(messages, {
          quiet: true
        }));
      }
      return _results;
    };

    MessagesViewCollection.prototype.appendMessages = function(messages, options) {
      var message, messagePartial, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = messages.length; _i < _len; _i++) {
        message = messages[_i];
        if (options.quiet) {
          messagePartial = this.renderMessagePartial(message);
          _results.push(this.appendMessage(message, messagePartial));
        } else {
          _results.push(this.onNewMessage("publish_message", message));
        }
      }
      return _results;
    };

    MessagesViewCollection.prototype.findMessageEmail = function(message) {
      return message.find(".email").text();
    };

    MessagesViewCollection.prototype.findMessageTime = function(message) {
      return parseInt(message.find(".time").attr("data-time"));
    };

    MessagesViewCollection.prototype.newMessageInTimeWindow = function(recentMessage, oldMessage) {
      return (recentMessage["datetime"] - this.findMessageTime(oldMessage)) <= this.collapseTimeWindow;
    };

    MessagesViewCollection.prototype.renderMessagePartial = function(message) {
      var mustached;
      mustached = $(Mustache.render(this.messagePartialTemplate, message));
      mustached.find(".user-mention[data-username='" + this.username + "']").addClass("its-you");
      mustached.find(".channel-mention").on("click", this.channelViewCollection.joinChannelClick);
      return mustached;
    };

    MessagesViewCollection.prototype.appendMessage = function(message, messagePartial) {
      var $messageContainer, lastMessage, messagesList, timeContainer;
      if ($("#" + message.id).length > 0) {
        return;
      }
      if (message.datetime > this.latestMessage.datetime) {
        this.latestMessage = message;
      }
      messagesList = this.channelHash[message.channel].$el;
      lastMessage = messagesList.find(".message-container").last();
      if (this.findMessageEmail(lastMessage) === message.user.email && this.newMessageInTimeWindow(message, lastMessage)) {
        messagePartial.appendTo(lastMessage);
        timeContainer = lastMessage.find(".time");
        timeContainer.attr("data-time", message["datetime"]);
        this.dateTimeHelper.removeBindings(timeContainer);
      } else {
        $messageContainer = $(Mustache.render(this.messageContainerTemplate, message));
        $messageContainer.filter(".message-container").append(messagePartial);
        $messageContainer.appendTo(messagesList);
        timeContainer = $messageContainer.find(".time");
      }
      this.dateTimeHelper.bindOne(timeContainer);
      this.dateTimeHelper.updateTimestamp(timeContainer);
      return messagePartial;
    };

    MessagesViewCollection.prototype.pullMissingMessages = function() {
      var id,
        _this = this;
      id = this.latestMessage.message_id || "none";
      return $.ajax({
        url: "/api/messages_since/" + id,
        dataType: "json",
        success: function(messages) {
          return _this.appendMessages(messages, {
            quiet: false
          });
        },
        error: function(xhr, textStatus, errorThrown) {
          return console.log("Error updating messages: " + textStatus + ", " + errorThrown);
        },
        complete: this.messageHub.unblockDequeue()
      });
    };

    return MessagesViewCollection;

  })(Backbone.View);

}).call(this);
