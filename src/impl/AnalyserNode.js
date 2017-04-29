"use strict";

const util = require("../util");
const AudioNode = require("./AudioNode");
const AnalyserNodeDSP = require("./dsp/AnalyserNode");
const { MAX } = require("../constants/ChannelCountMode");

const DEFAULT_FFT_SIZE = 2048;
const DEFAULT_MIN_DECIBELS = -100;
const DEFAULT_MAX_DECIBELS = -30;
const DEFAULT_SMOOTHING_TIME_CONSTANT = 0.8;
const MIN_FFT_SIZE = 32;
const MAX_FFT_SIZE = 32768;

class AnalyserNode extends AudioNode {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.fftSize
   * @param {number}       opts.minDecibels
   * @param {number}       opts.maxDecibels
   * @param {number}       opts.smoothingTimeConstant
   */
  constructor(context, opts = {}) {
    let fftSize = util.defaults(opts.fftSize, DEFAULT_FFT_SIZE);
    let minDecibels = util.defaults(opts.minDecibels, DEFAULT_MIN_DECIBELS);
    let maxDecibels = util.defaults(opts.maxDecibels, DEFAULT_MAX_DECIBELS);
    let smoothingTimeConstant = util.defaults(opts.smoothingTimeConstant, DEFAULT_SMOOTHING_TIME_CONSTANT);

    super(context, opts, {
      inputs: [ 1 ],
      outputs: [ 1 ],
      channelCount: 1,
      channelCountMode: MAX
    });

    this._fftSize = fftSize;
    this._minDecibels = minDecibels;
    this._maxDecibels = maxDecibels;
    this._smoothingTimeConstant = smoothingTimeConstant;

    this.dspInit(context.sampleRate);
    this.setFftSize(fftSize);
  }

  /**
   * @return {number}
   */
  getFftSize() {
    return this._fftSize;
  }

  /**
   * @param {number} value
   */
  setFftSize(value) {
    value = util.clamp(value|0, MIN_FFT_SIZE, MAX_FFT_SIZE);
    value = util.toPowerOfTwo(value, Math.ceil);
    this._fftSize = value;
    this.dspUpdateSizes(this._fftSize);
  }

  /**
   * @return {number}
   */
  getFrequencyBinCount() {
    return this._fftSize / 2;
  }

  /**
   * @return {number}
   */
  getMinDecibels() {
    return this._minDecibels;
  }

  /**
   * @param {number} value
   */
  setMinDecibels(value) {
    value = util.toNumber(value);
    /* istanbul ignore else */
    if (-Infinity < value && value < this._maxDecibels) {
      this._minDecibels = value;
    }
  }

  /**
   * @return {number}
   */
  getMaxDecibels() {
    return this._maxDecibels;
  }

  /**
   * @param {number} value
   */
  setMaxDecibels(value) {
    value = util.toNumber(value);
    /* istanbul ignore else */
    if (this._minDecibels < value && value < Infinity) {
      this._maxDecibels = value;
    }
  }


  /**
   * @return {number}
   */
  getSmoothingTimeConstant() {
    return this._smoothingTimeConstant;
  }

  /**
   * @param {number}
   */
  setSmoothingTimeConstant(value) {
    value = util.clamp(util.toNumber(value), 0, 1);
    this._smoothingTimeConstant = value;
  }

  /**
   * @param {Float32Array} array
   */
  getFloatFrequencyData(array) {
    this.dspGetFloatFrequencyData(array);
  }

  /**
   * @param {Uint8Array} array
   */
  getByteFrequencyData(array) {
    this.dspGetByteFrequencyData(array);
  }

  /**
   * @param {Float32Array} array
   */
  getFloatTimeDomainData(array) {
    this.dspGetFloatTimeDomainData(array);
  }

  /**
   * @param {Uint8Array} array
   */
  getByteTimeDomainData(array) {
    this.dspGetByteTimeDomainData(array);
  }

  /**
   * @param {number} numberOfChannels
   */
  channelDidUpdate(numberOfChannels) {
    this.outputs[0].setNumberOfChannels(numberOfChannels);
  }
}

Object.assign(AnalyserNode.prototype, AnalyserNodeDSP);

module.exports = AnalyserNode;
