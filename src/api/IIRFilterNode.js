"use strict";

const impl = require("../impl");
const AudioNode = require("./AudioNode");

class IIRFilterNode extends AudioNode {
  constructor(context, opts) {
    super(context);

    this._impl = new impl.IIRFilterNode(context._impl, opts);
  }

  getFrequencyResponse(frequencyHz, magResponse, phaseResponse) {
    this._impl.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);
  }
}

module.exports = IIRFilterNode;
