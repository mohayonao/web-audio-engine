"use strict";

const AudioNode = require("./AudioNode");

const FilterTypes = [
  "lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "peaking", "notch", "allpass"
];

class BiquadFilterNode extends AudioNode {
  constructor(context) {
    super(context, {
      inputs: [ 1 ],
      outputs: [ 1 ],
      channelCount: 2,
      channelCountMode: "max"
    });
    this._type = "lowpass";
    this._frequency = this.addParam("control", 350);
    this._detune = this.addParam("control", 0);
    this._Q = this.addParam("control", 1);
    this._gain = this.addParam("control", 0);
  }

  getType() {
    return this._type;
  }

  setType(value) {
    /* istanbul ignore else */
    if (FilterTypes.indexOf(value) !== -1) {
      this._type = value;
    }
  }

  getFrequency() {
    return this._frequency;
  }

  getDetune() {
    return this._detune;
  }

  getQ() {
    return this._Q;
  }

  getGain() {
    return this._gain;
  }

  /* istanbul ignore next */
  getFrequencyResponse() {
    throw new TypeError("NOT YET IMPLEMENTED");
  }

  channelDidUpdate(numberOfChannels) {
    this.getOutput(0).setNumberOfChannels(numberOfChannels);
  }
}

module.exports = BiquadFilterNode;
