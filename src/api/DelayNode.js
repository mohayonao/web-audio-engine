"use strict";

const impl = require("../impl");
const AudioNode = require("./AudioNode");
const AudioParam = require("./AudioParam");

class DelayNode extends AudioNode {
  constructor(context, opts) {
    super(context);

    this._impl = new impl.DelayNode(context._impl, opts);
    this._impl.$delay = new AudioParam(context, this._impl.getDelay());
  }

  get delay() {
    return this._impl.$delay;
  }
}

module.exports = DelayNode;
