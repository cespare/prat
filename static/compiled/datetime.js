(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.DateTime = (function() {

    DateTime.MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    DateTime.DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    DateTime.DAY_MILLISECONDS = 1000 * 60 * 60 * 24;

    function DateTime(unixTime) {
      var am;
      this.unixTime = unixTime;
      this.posted = new Date(this.unixTime * 1000);
      this.year = this.posted.getFullYear();
      this.date = this.posted.getDate();
      this.weekday = DateTime.DAYS[this.posted.getDay()];
      this.month = DateTime.MONTHS[this.posted.getMonth()];
      this.hours = this.posted.getHours();
      this.minutes = this.posted.getMinutes();
      this.minutes = this.minutes < 10 ? "0" + this.minutes : this.minutes;
      am = true;
      if (this.hours > 12) {
        am = false;
        this.hours -= 12;
      } else if (this.hours === 12) {
        am = false;
      } else if (this.hours === 0) {
        this.hours = 12;
      }
      this.amPM = am ? "AM" : "PM";
    }

    DateTime.prototype.contextualTime = function() {
      var daysBetween, diff, diffHours, diffMinutes, now, time;
      now = new Date();
      diff = now.getTime() / 1000 - this.unixTime;
      diffMinutes = Math.round(diff / 60);
      diffHours = Math.round(diffMinutes / 60);
      daysBetween = Math.round((now.getTime() - this.posted.getTime()) / DateTime.DAY_MILLISECONDS);
      time = "" + this.hours + ":" + this.minutes + " " + this.amPM;
      if (diffMinutes < 1) {
        return "a moment ago";
      } else if (diffMinutes === 1) {
        return "a minute ago";
      } else if (diffMinutes < 60) {
        return "" + diffMinutes + " minutes ago";
      } else if (diffHours === 1) {
        return "an hour ago";
      } else if (diffHours < 11) {
        return "" + diffHours + " hours ago";
      } else if (this.date === now.getDate()) {
        return time;
      } else if (this.date === now.getDate() - 1) {
        return "yesterday at " + time;
      } else if (daysBetween < 7) {
        return "" + this.weekday + " at " + time;
      } else if (daysBetween < 365) {
        return "" + this.date + " " + this.month + " " + time;
      } else {
        return "" + this.date + " " + this.month + " " + time;
      }
    };

    return DateTime;

  })();

  window.DateTimeHelper = (function() {

    function DateTimeHelper() {
      this.updateTimestamps = __bind(this.updateTimestamps, this);
      this.init();
    }

    DateTimeHelper.prototype.init = function() {
      return this.setUpdateTimestampsInterval(60000);
    };

    DateTimeHelper.prototype.bindOne = function(timeContainer) {
      return timeContainer.data("datetime", new DateTime(parseInt(timeContainer.attr("data-time"))));
    };

    DateTimeHelper.prototype.removeBindings = function(timeContainer) {
      return timeContainer.removeData("datetime");
    };

    DateTimeHelper.prototype.updateTimestamps = function() {
      var _this = this;
      return $(".author-container .time").each(function(index, timeContainer) {
        return _this.updateTimestamp($(timeContainer));
      });
    };

    DateTimeHelper.prototype.updateTimestamp = function(timeContainer) {
      return timeContainer.html(timeContainer.data("datetime").contextualTime());
    };

    DateTimeHelper.prototype.setUpdateTimestampsInterval = function(interval) {
      return this.intervalID = setInterval(this.updateTimestamps, interval);
    };

    DateTimeHelper.prototype.clearUpdateTimestampsTimeout = function() {
      return clearInterval(this.intervalID != null);
    };

    return DateTimeHelper;

  })();

}).call(this);
