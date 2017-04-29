"use strict";

const util = require("../util");
const AudioNode = require("./AudioNode");
const WaveShaperNodeDSP = require("./dsp/WaveShaperNode");
const { MAX } = require("../constants/ChannelCountMode");

const OverSampleTypes = [ "none", "2x", "4x" ];

const DEFAULT_CURVE = null;
const DEFAULT_OVERSAMPLE = "none";

class WaveShaperNode extends AudioNode {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {Float32Arrat} opts.curve
   * @param {string}       opts.overSample
   */
  constructor(context, opts = {}) {
    let curve = util.defaults(opts.curve, DEFAULT_CURVE);
    let overSample = util.defaults(opts.overSample, DEFAULT_OVERSAMPLE);

    super(context, opts, {
      inputs: [ 1 ],
      outputs: [ 1 ],
      channelCount: 2,
      channelCountMode: MAX
    });

    this._curve = curve;
    this._overSample = overSample;

    this.dspInit();
    this.dspUpdateKernel(null, 1);
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
      this.dspUpdateKernel(this._curve, this.outputs[0].getNumberOfChannels());
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
    this.dspUpdateKernel(this._curve, numberOfChannels);
    this.outputs[0].setNumberOfChannels(numberOfChannels);
  }
}

Object.assign(WaveShaperNode.prototype, WaveShaperNodeDSP);

module.exports = WaveShaperNode;
