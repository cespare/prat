(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.ChatControls = (function() {

    function ChatControls(messageHub, channelViewCollection, leftClosed, rightClosed) {
      this.messageHub = messageHub;
      this.channelViewCollection = channelViewCollection;
      this.addToChatHistory = __bind(this.addToChatHistory, this);

      this.onPreviousChatHistory = __bind(this.onPreviousChatHistory, this);

      this.onNextChatHistory = __bind(this.onNextChatHistory, this);

      this.onCollapseLeftSidebar = __bind(this.onCollapseLeftSidebar, this);

      this.onExpandLeftSidebar = __bind(this.onExpandLeftSidebar, this);

      this.onCollapseRightSidebar = __bind(this.onCollapseRightSidebar, this);

      this.onExpandRightSidebar = __bind(this.onExpandRightSidebar, this);

      this.onPreviewSend = __bind(this.onPreviewSend, this);

      this.onChatSubmit = __bind(this.onChatSubmit, this);

      this.onPreviewSubmit = __bind(this.onPreviewSubmit, this);

      this.init(leftClosed, rightClosed);
    }

    ChatControls.prototype.init = function(leftSidebarClosed, rightSidebarClosed) {
      var leftToggle, rightToggle;
      rightToggle = rightSidebarClosed ? this.onExpandRightSidebar : this.onCollapseRightSidebar;
      leftToggle = leftSidebarClosed ? this.onExpandLeftSidebar : this.onCollapseLeftSidebar;
      $(".toggle-right-sidebar").one("click", rightToggle);
      $(".toggle-left-sidebar").one("click", leftToggle);
      this.chatText = $("#chat-text");
      this.chatText.on("keydown.return", this.onChatSubmit);
      this.chatText.on("keydown.up", this.onPreviousChatHistory);
      this.chatText.on("keydown.down", this.onNextChatHistory);
      this.messageHub.on("force_refresh", this.refreshPage);
      $(".chat-submit").click(this.onChatSubmit);
      $(".chat-preview").click(this.onPreviewSubmit);
      $("#preview-submit").click(this.onPreviewSend);
      this.currentMessage = "";
      return this.chatHistoryOffset = -1;
    };

    ChatControls.prototype.onPreviewSubmit = function(event) {
      var message;
      message = this.chatText.val();
      return this.messageHub.sendPreview(message, this.channelViewCollection.currentChannel);
    };

    ChatControls.prototype.onChatSubmit = function(event) {
      var message;
      message = this.chatText.val();
      if (message.replace(/\s*$/, "") !== "") {
        this.messageHub.sendChat(message, this.channelViewCollection.currentChannel);
        this.addToChatHistory(message);
      }
      this.chatText.val("").focus();
      return event.preventDefault();
    };

    ChatControls.prototype.onPreviewSend = function() {
      $("#message-preview").modal("hide");
      return this.onChatSubmit({
        preventDefault: function() {}
      });
    };

    ChatControls.prototype.onExpandRightSidebar = function(event) {
      var rightSidebarButton;
      rightSidebarButton = $(".toggle-right-sidebar");
      rightSidebarButton.find(".ss-standard").html("right");
      $(".right-sidebar").removeClass("closed");
      $(".chat-column").removeClass("collapse-right");
      rightSidebarButton.one("click", this.onCollapseRightSidebar);
      return document.cookie = "rightSidebar=open";
    };

    ChatControls.prototype.onCollapseRightSidebar = function(event) {
      var rightSidebarButton;
      rightSidebarButton = $(".toggle-right-sidebar");
      rightSidebarButton.find(".ss-standard").html("left");
      $(".right-sidebar").addClass("closed");
      $(".chat-column").addClass("collapse-right");
      rightSidebarButton.one("click", this.onExpandRightSidebar);
      return document.cookie = "rightSidebar=closed";
    };

    ChatControls.prototype.onExpandLeftSidebar = function(event) {
      var leftSidebarButton;
      leftSidebarButton = $(".toggle-left-sidebar");
      leftSidebarButton.find(".ss-standard").html("left");
      $(".left-sidebar").removeClass("closed");
      $(".main-content").removeClass("collapse-left");
      leftSidebarButton.one("click", this.onCollapseLeftSidebar);
      return document.cookie = "leftSidebar=open";
    };

    ChatControls.prototype.onCollapseLeftSidebar = function(event) {
      var leftSidebarButton;
      leftSidebarButton = $(".toggle-left-sidebar");
      leftSidebarButton.find(".ss-standard").html("right");
      $(".left-sidebar").addClass("closed");
      $(".main-content").addClass("collapse-left");
      leftSidebarButton.one("click", this.onExpandLeftSidebar);
      return document.cookie = "leftSidebar=closed";
    };

    ChatControls.prototype.getChatHistory = function() {
      return JSON.parse(localStorage.getItem("chat_history"));
    };

    ChatControls.prototype.setChatHistory = function(history) {
      return localStorage.setItem("chat_history", JSON.stringify(history));
    };

    ChatControls.prototype.getChatFromHistory = function(history) {
      return history[history.length - this.chatHistoryOffset - 1];
    };

    ChatControls.prototype.onNextChatHistory = function() {
      var history, newValue;
      if (this.chatText.caret() !== this.chatText.val().length) {
        return;
      }
      history = this.getChatHistory();
      if (!((history != null ? history.length : void 0) > 0 && this.chatHistoryOffset !== -1)) {
        return;
      }
      this.chatHistoryOffset--;
      newValue = this.chatHistoryOffset === -1 ? this.currentMessage : this.getChatFromHistory(history);
      return this.chatText.val(newValue);
    };

    ChatControls.prototype.onPreviousChatHistory = function() {
      var history;
      if (this.chatText.caret() !== 0) {
        return;
      }
      if (this.chatHistoryOffset === -1) {
        this.currentMessage = this.chatText.val();
      }
      history = this.getChatHistory();
      if (!((history != null ? history.length : void 0) > 0)) {
        return;
      }
      if (this.chatHistoryOffset === history.length - 1) {
        return this.chatText.val(history[0]);
      } else {
        this.chatHistoryOffset++;
        return this.chatText.val(this.getChatFromHistory(history));
      }
    };

    ChatControls.prototype.addToChatHistory = function(message) {
      var history;
      history = this.getChatHistory();
      if (history == null) {
        history = [];
      }
      history.push(message);
      while (history.length > 50) {
        history.shift();
      }
      this.setChatHistory(history);
      this.chatHistoryOffset = -1;
      return this.currentMessage = "";
    };

    return ChatControls;

  })();

}).call(this);
