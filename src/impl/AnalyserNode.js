"use strict";

const util = require("../util");
const AudioNode = require("./AudioNode");
const AnalyserNodeDSP = require("./dsp/AnalyserNode");

const MaxFFTSize = 32768;
const MinFFTSize = 32;

class AnalyserNode extends AudioNode {
  /**
   * @param {AudioContext} context
   */
  constructor(context) {
    super(context, {
      inputs: [ 1 ],
      outputs: [ 1 ],
      channelCount: 1,
      channelCountMode: "max"
    });
    this._fftSize = 2048;
    this._minDecibels = -100;
    this._maxDecibels = -30;
    this._smoothingTimeConstant = 0.8;
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
    value = util.clip(value|0, MinFFTSize, MaxFFTSize);
    value = util.toPowerOfTwo(value, Math.ceil);
    this._fftSize = value;
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
    value = util.clip(util.toNumber(value), 0, 1);
    this._smoothingTimeConstant = value;
  }

  /**
   * @param {Float32Array} array
   */
  /* istanbul ignore next */
  getFloatFrequencyData() {
    throw new TypeError("NOT YET IMPLEMENTED");
  }

  /**
   * @param {Uint8Array} array
   */
  /* istanbul ignore next */
  getByteFrequencyData() {
    throw new TypeError("NOT YET IMPLEMENTED");
  }

  /**
   * @param {Float32Array} array
   */
  /* istanbul ignore next */
  getFloatTimeDomainData() {
    throw new TypeError("NOT YET IMPLEMENTED");
  }

  /**
   * @param {Uint8Array} array
   */
  /* istanbul ignore next */
  getByteTimeDomainData() {
    throw new TypeError("NOT YET IMPLEMENTED");
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
