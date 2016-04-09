"use strict";

const impl = require("../impl");
const AudioNode = require("./AudioNode");

class AnalyserNode extends AudioNode {
  constructor(context, opts) {
    super(context);

    this._impl = new impl.AnalyserNode(context._impl, opts);
  }

  get fftSize() {
    return this._impl.getFftSize();
  }

  set fftSize(value) {
    this._impl.setFftSize(value);
  }

  get frequencyBinCount() {
    return this._impl.getFrequencyBinCount();
  }

  get minDecibels() {
    return this._impl.getMinDecibels();
  }

  set minDecibels(value) {
    this._impl.setMinDecibels(value);
  }

  get maxDecibels() {
    return this._impl.getMaxDecibels();
  }

  set maxDecibels(value) {
    this._impl.setMaxDecibels(value);
  }

  get smoothingTimeConstant() {
    return this._impl.getSmoothingTimeConstant();
  }

  set smoothingTimeConstant(value) {
    this._impl.setSmoothingTimeConstant(value);
  }

  getFloatFrequencyData(array) {
    this._impl.getFloatFrequencyData(array);
  }

  getByteFrequencyData(array) {
    this._impl.getByteFrequencyData(array);
  }

  getFloatTimeDomainData(array) {
    this._impl.getFloatTimeDomainData(array);
  }

  getByteTimeDomainData(array) {
    this._impl.getByteTimeDomainData(array);
  }
}

module.exports = AnalyserNode;
