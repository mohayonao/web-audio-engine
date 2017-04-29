"use strict";

const impl = require("../impl");
const AudioScheduledSourceNode = require("./AudioScheduledSourceNode");
const AudioParam = require("./AudioParam");

class ConstantSourceNode extends AudioScheduledSourceNode {
  constructor(context, opts) {
    super(context);

    this._impl = new impl.ConstantSourceNode(context._impl, opts);
    this._impl.$offset = new AudioParam(context, this._impl.getOffset());
    this._impl.$onended = null;
  }

  get offset() {
    return this._impl.$offset;
  }
}

module.exports = ConstantSourceNode;
