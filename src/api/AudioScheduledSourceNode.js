"use strict";

const AudioNode = require("./AudioNode");

class AudioScheduledSourceNode extends AudioNode {
  get onended() {
    return this._impl.$onended;
  }

  set onended(callback) {
    this._impl.replaceEventListener("ended", this._impl.$onended, callback);
    this._impl.$onended = callback;
  }

  start(when) {
    this._impl.start(when);
  }

  stop(when) {
    this._impl.stop(when);
  }
}

module.exports = AudioScheduledSourceNode;
