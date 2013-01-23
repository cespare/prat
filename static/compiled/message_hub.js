(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.MessageHub = (function() {

    _.extend(MessageHub.prototype, Backbone.Events);

    function MessageHub(address, reconnectTimeout, pingInterval, alertHelper) {
      this.address = address;
      this.reconnectTimeout = reconnectTimeout;
      this.pingInterval = pingInterval;
      this.alertHelper = alertHelper;
      this.blockDequeue = __bind(this.blockDequeue, this);

      this.clearAllTimeoutIDs = __bind(this.clearAllTimeoutIDs, this);

      this.keepAlive = __bind(this.keepAlive, this);

      this.onConnectionOpened = __bind(this.onConnectionOpened, this);

      this.onConnectionFailed = __bind(this.onConnectionFailed, this);

      this.joinChannel = __bind(this.joinChannel, this);

      this.leaveChannel = __bind(this.leaveChannel, this);

      this.sendChat = __bind(this.sendChat, this);

      this.sendPreview = __bind(this.sendPreview, this);

      this.switchChannel = __bind(this.switchChannel, this);

      this.reorderChannels = __bind(this.reorderChannels, this);

      this.sendJSON = __bind(this.sendJSON, this);

      this.unblockDequeue = __bind(this.unblockDequeue, this);

      this.onMessage = __bind(this.onMessage, this);

      this.createSocket = __bind(this.createSocket, this);

      this.init = __bind(this.init, this);

      this.timeoutIDs = [];
      this.pingIDs = [];
      this.queueing = false;
      this.reconnect = false;
      this.queue = [];
      this.blockingDequeue = 0;
      this.currentlyBlockingDequeue = 0;
    }

    MessageHub.prototype.init = function() {
      return this.createSocket();
    };

    MessageHub.prototype.createSocket = function() {
      var pingID, _i, _len, _ref, _ref1;
      if ((_ref = this.socket) != null) {
        _ref.close();
      }
      this.pingIDs = [];
      _ref1 = this.pingIDs;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        pingID = _ref1[_i];
        clearInterval(pingID);
      }
      this.timeoutIDs.push(setTimeout(this.createSocket, this.reconnectTimeout));
      console.log("Connecting to " + this.address);
      this.socket = new WebSocket(this.address);
      this.socket.onmessage = this.onMessage;
      this.socket.onclose = this.onConnectionFailed;
      return this.socket.onopen = this.onConnectionOpened;
    };

    MessageHub.prototype.onMessage = function(message) {
      var messageObject;
      messageObject = JSON.parse(message.data);
      if (this.queueing) {
        return this.queue.push(messageObject);
      } else {
        return this.trigger(messageObject.action, messageObject.action, messageObject.data);
      }
    };

    MessageHub.prototype.unblockDequeue = function() {
      var message, _i, _len, _ref;
      this.currentlyBlockingDequeue -= 1;
      if (this.currentlyBlockingDequeue <= 0) {
        _ref = this.queue;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          message = _ref[_i];
          this.trigger(message.action, message.action, message.data);
        }
        this.queue = [];
        return this.queueing = false;
      }
    };

    MessageHub.prototype.sendJSON = function(messageObject) {
      return this.socket.send(JSON.stringify(messageObject));
    };

    MessageHub.prototype.reorderChannels = function(channels) {
      return this.sendJSON({
        action: "reorder_channels",
        data: {
          channels: channels
        }
      });
    };

    MessageHub.prototype.switchChannel = function(channel) {
      return this.sendJSON({
        action: "switch_channel",
        data: {
          channel: channel
        }
      });
    };

    MessageHub.prototype.sendPreview = function(message, channel) {
      return this.sendJSON({
        action: "preview_message",
        data: {
          message: message,
          channel: channel
        }
      });
    };

    MessageHub.prototype.sendChat = function(message, channel) {
      return this.sendJSON({
        action: "publish_message",
        data: {
          message: message,
          channel: channel
        }
      });
    };

    MessageHub.prototype.leaveChannel = function(channel) {
      return this.sendJSON({
        action: "leave_channel",
        data: {
          channel: channel
        }
      });
    };

    MessageHub.prototype.joinChannel = function(channel) {
      return this.sendJSON({
        action: "join_channel",
        data: {
          channel: channel
        }
      });
    };

    MessageHub.prototype.onConnectionFailed = function() {
      this.reconnect = true;
      this.currentlyBlockingDequeue = this.blockingDequeue;
      this.clearAllTimeoutIDs();
      this.alertHelper.newAlert("alert-error", "Connection failed, reconnecting in " + (this.reconnectTimeout / 1000) + " seconds");
      console.log("Connection failed, reconnecting in " + (this.reconnectTimeout / 1000) + " seconds");
      return this.timeoutIDs.push(setTimeout(this.createSocket, this.reconnectTimeout));
    };

    MessageHub.prototype.onConnectionOpened = function() {
      this.alertHelper.delAlert();
      this.clearAllTimeoutIDs();
      this.pingIDs.push(setInterval(this.keepAlive, this.pingInterval));
      if (this.reconnect) {
        this.trigger("reconnect");
      }
      this.reconnect = false;
      return console.log("Connection successful");
    };

    MessageHub.prototype.keepAlive = function() {
      return this.sendJSON({
        action: "ping",
        data: {
          message: "PING"
        }
      });
    };

    MessageHub.prototype.clearAllTimeoutIDs = function() {
      var timeoutID, _i, _len, _ref;
      _ref = this.timeoutIDs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        timeoutID = _ref[_i];
        clearTimeout(timeoutID);
      }
      return this.timeoutIDs = [];
    };

    MessageHub.prototype.blockDequeue = function() {
      return this.blockingDequeue += 1;
    };

    return MessageHub;

  })();

}).call(this);
