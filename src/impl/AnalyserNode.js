"use strict";

const util = require("../_util");
const AudioNode = require("./AudioNode");

const MaxFFTSize = 32768;
const MinFFTSize = 32;

class AnalyserNode extends AudioNode {
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

  getFftSize() {
    return this._fftSize;
  }

  setFftSize(value) {
    value = util.clip(value|0, MinFFTSize, MaxFFTSize);
    value = util.toPowerOfTwo(value, Math.ceil);
    this._fftSize = value;
  }

  getFrequencyBinCount() {
    return this._fftSize / 2;
  }

  getMinDecibels() {
    return this._minDecibels;
  }

  setMinDecibels(value) {
    value = util.toNumber(value);
    /* istanbul ignore else */
    if (-Infinity < value && value < this._maxDecibels) {
      this._minDecibels = value;
    }
  }

  getMaxDecibels() {
    return this._maxDecibels;
  }

  setMaxDecibels(value) {
    value = util.toNumber(value);
    /* istanbul ignore else */
    if (this._minDecibels < value && value < Infinity) {
      this._maxDecibels = value;
    }
  }

  getSmoothingTimeConstant() {
    return this._smoothingTimeConstant;
  }

  setSmoothingTimeConstant(value) {
    value = util.clip(util.toNumber(value), 0, 1);
    this._smoothingTimeConstant = value;
  }

  /* istanbul ignore next */
  getFloatFrequencyData() {
    throw new TypeError("NOT YET IMPLEMENTED");
  }

  /* istanbul ignore next */
  getByteFrequencyData() {
    throw new TypeError("NOT YET IMPLEMENTED");
  }

  /* istanbul ignore next */
  getFloatTimeDomainData() {
    throw new TypeError("NOT YET IMPLEMENTED");
  }

  /* istanbul ignore next */
  getByteTimeDomainData() {
    throw new TypeError("NOT YET IMPLEMENTED");
  }

  channelDidUpdate(numberOfChannels) {
    this.getOutput(0).setNumberOfChannels(numberOfChannels);
  }
}

module.exports = AnalyserNode;
