(function() {

  window.Util = {
    scrolling: 0,
    scrolledToBottom: function() {
      var difference, messages;
      if (this.scrolling > 0) {
        return true;
      }
      messages = $(".chat-messages.current");
      difference = (messages[0].scrollHeight - messages.scrollTop()) - messages.outerHeight();
      return difference <= 1;
    },
    scrollToBottom: function(options) {
      var messages, scrollTop;
      if (options == null) {
        options = {
          animate: true
        };
      }
      messages = $(".chat-messages.current");
      scrollTop = messages[0].scrollHeight - messages.outerHeight() - 1;
      if (options.animate) {
        this.scrolling += 1;
        return messages.animate({
          scrollTop: scrollTop
        }, {
          duration: 150,
          complete: function() {
            return Util.scrolling -= 1;
          }
        });
      } else {
        return messages.prop({
          scrollTop: scrollTop
        });
      }
    },
    cleanupTipsy: function() {
      return $(".tipsy").remove();
    }
  };

}).call(this);
