"use strict";

const assert = require("assert");
const AudioNode = require("./AudioNode");
const BiquadFilterNodeDSP = require("./dsp/BiquadFilterNode");
const { MAX } = require("../constants/ChannelCountMode");

class BiquadFilterNode extends AudioNode {
  /**
   * @param {AudioContext} context
   */
  constructor(context) {
    super(context, {
      inputs: [ 1 ],
      outputs: [ 1 ],
      channelCount: 2,
      channelCountMode: MAX
    });
    this._type = BiquadFilterNodeDSP.LOWPASS;
    this._frequency = this.addParam("control", 350);
    this._detune = this.addParam("control", 0);
    this._Q = this.addParam("control", 1);
    this._gain = this.addParam("control", 0);

    this.dspInit();
    this.dspUpdateKernel(1);
  }

  /**
   * @return {string}
   */
  getType() {
    return this.toFilterTypeName(this._type);
  }

  /**
   * @param {string} value
   */
  setType(value) {
    value = this.fromFilterTypeName(value);
    /* istanbul ignore else */
    if (BiquadFilterNodeDSP.FilterTypes.indexOf(value) !== -1) {
      this._type = value;
    }
  }

  /**
   * @return {AudioParam}
   */
  getFrequency() {
    return this._frequency;
  }

  /**
   * @return {AudioParam}
   */
  getDetune() {
    return this._detune;
  }

  /**
   * @return {AudioParam}
   */
  getQ() {
    return this._Q;
  }

  /**
   * @return {AudioParam}
   */
  getGain() {
    return this._gain;
  }

  /**
   * @param {Float32Array} frequencyHz
   * @param {Float32Array} magResponse
   * @param {Float32Array} phaseResponse
   */
  /* istanbul ignore next */
  getFrequencyResponse() {
    throw new TypeError("NOT YET IMPLEMENTED");
  }

  /**
   * @param {number} numberOfChannels
   */
  channelDidUpdate(numberOfChannels) {
    this.dspUpdateKernel(numberOfChannels);
    this.outputs[0].setNumberOfChannels(numberOfChannels);
  }

  /**
   * @return {number}
   */
  getTailTime() {
    return 0.2;
  }

  /**
   * @param {string} value
   * @return {number}
   */
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

  /**
   * @param {number} value
   * @return {string}
   */
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

Object.assign(BiquadFilterNode.prototype, BiquadFilterNodeDSP);

module.exports = BiquadFilterNode;
