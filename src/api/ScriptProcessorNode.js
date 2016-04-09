"use strict";

const impl = require("../impl");
const AudioNode = require("./AudioNode");

class ScriptProcessorNode extends AudioNode {
  constructor(context, opts) {
    super(context);

    this._impl = new impl.ScriptProcessorNode(context._impl, opts);
    this._impl.$onaudioprocess = null;
  }

  get bufferSize() {
    return this._impl.getBufferSize();
  }

  get onaudioprocess() {
    return this._impl.$onaudioprocess;
  }

  set onaudioprocess(callback) {
    this._impl.replaceEventListener("audioprocess", this._impl.$onaudioprocess, callback);
    this._impl.$onaudioprocess = callback;
  }
}

module.exports = ScriptProcessorNode;
