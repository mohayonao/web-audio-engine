"use strict";

const util = require("../util");
const AudioNode = require("./AudioNode");
const WaveShaperNodeDSP = require("./dsp/WaveShaperNode");

const OverSampleTypes = [ "none", "2x", "4x" ];

class WaveShaperNode extends AudioNode {
  constructor(context) {
    super(context, {
      inputs: [ 1 ],
      outputs: [ 1 ],
      channelCount: 2,
      channelCountMode: "max"
    });
    this._curve = null;
    this._overSample = "none";
  }

  getCurve() {
    return this._curve;
  }

  setCurve(value) {
    /* istanbul ignore else */
    if (value === null || value instanceof Float32Array) {
      this._curve = value;
    }
  }

  getOversample() {
    return this._overSample;
  }

  setOversample(value) {
    /* istanbul ignore else */
    if (OverSampleTypes.indexOf(value) !== -1) {
      this._overSample = value;
    }
  }

  channelDidUpdate(numberOfChannels) {
    this.getOutput(0).setNumberOfChannels(numberOfChannels);
  }
}

module.exports = util.mixin(WaveShaperNode, WaveShaperNodeDSP);
