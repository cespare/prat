(function() {

  window.Sound = (function() {

    function Sound(newMessageAudioLocation) {
      this.newMessageAudioLocation = newMessageAudioLocation;
      this.first = true;
      this.init();
    }

    Sound.prototype.init = function() {
      if (typeof webkitAudioContext === "undefined" || webkitAudioContext === null) {
        return;
      }
      this.context = new webkitAudioContext();
      return this.loadNewMessageAudio(this.newMessageAudioLocation);
    };

    Sound.prototype.loadNewMessageAudio = function(location, buffer) {
      var request,
        _this = this;
      request = new XMLHttpRequest();
      request.open("GET", location, true);
      request.responseType = "arraybuffer";
      request.onload = function() {
        return _this.context.decodeAudioData(request.response, (function(buffer) {
          return _this.newMessageAudio = buffer;
        }));
      };
      return request.send();
    };

    Sound.prototype.playNewMessageAudio = function() {
      var source;
      if (this.newMessageAudio == null) {
        return;
      }
      source = this.context.createBufferSource();
      source.buffer = this.newMessageAudio;
      source.connect(this.context.destination);
      return source.noteOn(0);
    };

    return Sound;

  })();

}).call(this);
