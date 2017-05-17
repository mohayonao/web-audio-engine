"use strict";

const AudioNode = require("./AudioNode");
const BiquadFilterNodeDSP = require("./dsp/BiquadFilterNode");
const { defaults } = require("../utils");
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

const DEFAULT_TYPE = LOWPASS;
const DEFAULT_FREQUENCY = 350;
const DEFAULT_DETUNE = 0;
const DEFAULT_Q = 1;
const DEFAULT_GAIN = 0;

class BiquadFilterNode extends AudioNode {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {string}       opts.type
   * @param {number}       opts.frequency
   * @param {number}       opts.detune
   * @param {number}       opts.Q
   * @param {number}       opts.gain
   */
  constructor(context, opts = {}) {
    let type = defaults(opts.type, DEFAULT_TYPE);
    let frequency = defaults(opts.frequency, DEFAULT_FREQUENCY);
    let detune = defaults(opts.detune, DEFAULT_DETUNE);
    let Q = defaults(opts.Q, DEFAULT_Q);
    let gain = defaults(opts.gain, DEFAULT_GAIN);

    super(context, opts, {
      inputs: [ 1 ],
      outputs: [ 1 ],
      channelCount: 2,
      channelCountMode: MAX
    });

    this._type = type;
    this._frequency = this.addParam(CONTROL_RATE, frequency);
    this._detune = this.addParam(CONTROL_RATE, detune);
    this._Q = this.addParam(CONTROL_RATE, Q);
    this._gain = this.addParam(CONTROL_RATE, gain);

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
  getFrequencyResponse(frequencyHz, magResponse, phaseResponse) {
    this.dspGetFrequencyResponse(frequencyHz, magResponse, phaseResponse);
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
