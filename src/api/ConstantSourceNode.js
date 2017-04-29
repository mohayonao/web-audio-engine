"use strict";

const impl = require("../impl");
const AudioNode = require("./AudioNode");
const AudioParam = require("./AudioParam");

class ConstantSourceNode extends AudioNode {
  constructor(context, opts) {
    super(context);

    this._impl = new impl.ConstantSourceNode(context._impl, opts);
    this._impl.$offset = new AudioParam(context, this._impl.getOffset());
    this._impl.$onended = null;
  }

  get offset() {
    return this._impl.$offset;
  }

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

module.exports = ConstantSourceNode;
