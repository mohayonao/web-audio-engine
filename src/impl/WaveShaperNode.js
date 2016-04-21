"use strict";

const util = require("../util");
const AudioNode = require("./AudioNode");
const WaveShaperNodeDSP = require("./dsp/WaveShaperNode");

const OverSampleTypes = [ "none", "2x", "4x" ];

class WaveShaperNode extends AudioNode {
  /**
   * @param {AudioContext}
   */
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

  /**
   * @return {Float32Array}
   */
  getCurve() {
    return this._curve;
  }

  /**
   * @param {Float32Array} value
   */
  setCurve(value) {
    /* istanbul ignore else */
    if (value === null || value instanceof Float32Array) {
      this._curve = value;
    }
  }

  /**
   * @return {boolean}
   */
  getOversample() {
    return this._overSample;
  }

  /**
   * @param {boolean} value
   */
  setOversample(value) {
    /* istanbul ignore else */
    if (OverSampleTypes.indexOf(value) !== -1) {
      this._overSample = value;
    }
  }

  /**
   * @param {number} numberOfChannels
   */
  channelDidUpdate(numberOfChannels) {
    this.outputs[0].setNumberOfChannels(numberOfChannels);
  }
}

module.exports = util.mixin(WaveShaperNode, WaveShaperNodeDSP);
