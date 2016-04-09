"use strict";

const impl = require("../impl");
const AudioNode = require("./AudioNode");
const AudioParam = require("./AudioParam");

class BiquadFilterNode extends AudioNode {
  constructor(context, opts) {
    super(context);

    this._impl = new impl.BiquadFilterNode(context._impl, opts);
    this._impl.$frequency = new AudioParam(context, this._impl.getFrequency());
    this._impl.$detune = new AudioParam(context, this._impl.getDetune());
    this._impl.$Q = new AudioParam(context, this._impl.getQ());
    this._impl.$gain = new AudioParam(context, this._impl.getGain());
  }

  get type() {
    return this._impl.getType();
  }

  set type(value) {
    this._impl.setType(value);
  }

  get frequency() {
    return this._impl.$frequency;
  }

  get detune() {
    return this._impl.$detune;
  }

  get Q() {
    return this._impl.$Q;
  }

  get gain() {
    return this._impl.$gain;
  }

  getFrequencyResponse(frequencyHz, magResponse, phaseResponse) {
    this._impl.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);
  }
}

module.exports = BiquadFilterNode;
