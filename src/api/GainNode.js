"use strict";

const impl = require("../impl");
const AudioNode = require("./AudioNode");
const AudioParam = require("./AudioParam");

class GainNode extends AudioNode {
  constructor(context, opts) {
    super(context);

    this._impl = new impl.GainNode(context._impl, opts);
    this._impl.$gain = new AudioParam(context, this._impl.getGain());
  }

  get gain() {
    return this._impl.$gain;
  }
}

module.exports = GainNode;
