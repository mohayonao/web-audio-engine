"use strict";

const impl = require("../impl");
const AudioNode = require("./AudioNode");

class AudioWorkerNode extends AudioNode {
  constructor(context, opts) {
    super(context);

    this._impl = new impl.AudioWorkerNode(context._impl, opts);
    this._impl.$onmessage = null;
  }

  postMessage(message) {
    this._impl.postMessage(message);
  }

  get onmessage() {
    return this._impl.$onmessage;
  }

  set onmessage(callback) {
    this._impl.replaceEventListener("message", this._impl.$onmessage, callback);
    this._impl.$onmessage = callback;
  }
}

module.exports = AudioWorkerNode;
