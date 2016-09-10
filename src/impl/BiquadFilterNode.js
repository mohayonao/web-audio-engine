"use strict";

const AudioNode = require("./AudioNode");
const BiquadFilterNodeDSP = require("./dsp/BiquadFilterNode");
const { MAX } = require("../constants/ChannelCountMode");
const { CONTROL_RATE } = require("../constants/AudioParamRate");
const { LOWPASS } = require("../constants/BiquadFilterType");
const { HIGHPASS } = require("../constants/BiquadFilterType");
const { BANDPASS } = require("../constants/BiquadFilterType");
const { LOWSHELF } = require("../constants/BiquadFilterType");
const { HIGHSHELF } = require("../constants/BiquadFilterType");
const { PEAKING } = require("../constants/BiquadFilterType");
const { NOTCH } = require("../constants/BiquadFilterType");
const { ALLPASS } = require("../constants/BiquadFilterType");

const allowedBiquadFilterTypes = [
  LOWPASS, HIGHPASS, BANDPASS, LOWSHELF, HIGHSHELF, PEAKING, NOTCH, ALLPASS
];

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
    this._type = LOWPASS;
    this._frequency = this.addParam(CONTROL_RATE, 350);
    this._detune = this.addParam(CONTROL_RATE, 0);
    this._Q = this.addParam(CONTROL_RATE, 1);
    this._gain = this.addParam(CONTROL_RATE, 0);

    this.dspInit();
    this.dspUpdateKernel(1);
  }

  /**
   * @return {string}
   */
  getType() {
    return this._type;
  }

  /**
   * @param {string} value
   */
  setType(value) {
    /* istanbul ignore else */
    if (allowedBiquadFilterTypes.indexOf(value) !== -1) {
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
}

Object.assign(BiquadFilterNode.prototype, BiquadFilterNodeDSP);

module.exports = BiquadFilterNode;
