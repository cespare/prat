(function() {

  window.AlertHelper = (function() {

    function AlertHelper() {}

    AlertHelper.prototype.newAlert = function(type, message) {
      var rendered;
      this.delAlert();
      rendered = Mustache.render($("#alert-template").html(), {
        type: type,
        message: message
      });
      return $(".alert-container").append(rendered);
    };

    AlertHelper.prototype.delAlert = function() {
      return $(".alert").remove();
    };

    return AlertHelper;

  })();

}).call(this);
