"use strict";

const assert = require("assert");
const util = require("../util");
const AudioNode = require("./AudioNode");
const BiquadFilterNodeDSP = require("./dsp/BiquadFilterNode");

class BiquadFilterNode extends AudioNode {
  constructor(context) {
    super(context, {
      inputs: [ 1 ],
      outputs: [ 1 ],
      channelCount: 2,
      channelCountMode: "max"
    });
    this._type = BiquadFilterNodeDSP.LOWPASS;
    this._frequency = this.addParam("control", 350);
    this._detune = this.addParam("control", 0);
    this._Q = this.addParam("control", 1);
    this._gain = this.addParam("control", 0);

    this.dspInit();
    this.dspSetNumberOfChannels(1);
  }

  getType() {
    return this.toFilterTypeName(this._type);
  }

  setType(value) {
    value = this.fromFilterTypeName(value);
    /* istanbul ignore else */
    if (BiquadFilterNodeDSP.FilterTypes.indexOf(value) !== -1) {
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
    this.dspSetNumberOfChannels(numberOfChannels);
    this.outputs[0].setNumberOfChannels(numberOfChannels);
  }

  getTailTime() {
    return 0.2;
  }

  fromFilterTypeName(value) {
    switch (value) {
    case "lowpass":
      return BiquadFilterNodeDSP.LOWPASS;
    case "highpass":
      return BiquadFilterNodeDSP.HIGHPASS;
    case "bandpass":
      return BiquadFilterNodeDSP.BANDPASS;
    case "lowshelf":
      return BiquadFilterNodeDSP.LOWSHELF;
    case "highshelf":
      return BiquadFilterNodeDSP.HIGHSHELF;
    case "peaking":
      return BiquadFilterNodeDSP.PEAKING;
    case "notch":
      return BiquadFilterNodeDSP.NOTCH;
    case "allpass":
      return BiquadFilterNodeDSP.ALLPASS;
    }
    return -1;
  }

  toFilterTypeName(value) {
    switch (value) {
    case BiquadFilterNodeDSP.LOWPASS:
      return "lowpass";
    case BiquadFilterNodeDSP.HIGHPASS:
      return "highpass";
    case BiquadFilterNodeDSP.BANDPASS:
      return "bandpass";
    case BiquadFilterNodeDSP.LOWSHELF:
      return "lowshelf";
    case BiquadFilterNodeDSP.HIGHSHELF:
      return "highshelf";
    case BiquadFilterNodeDSP.PEAKING:
      return "peaking";
    case BiquadFilterNodeDSP.NOTCH:
      return "notch";
    case BiquadFilterNodeDSP.ALLPASS:
      return "allpass";
    }
    /* istanbul ignore next */
    assert(!"NOT REACHED");
  }
}

module.exports = util.mixin(BiquadFilterNode, BiquadFilterNodeDSP);
