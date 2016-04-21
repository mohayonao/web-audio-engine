"use strict";

const util = require("../util");
const AudioNode = require("./AudioNode");
const IIRFilterNodeDSP = require("./dsp/IIRFilterNode");

class IIRFilterNode extends AudioNode {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {Float32Array} opts.feedforward
   * @param {Float32Array} opts.feedback
   */
  constructor(context, opts) {
    opts = opts || /* istanbul ignore next */ {};

    let feedforward = opts.feedforward;
    let feedback = opts.feedback;

    super(context, {
      inputs: [ 1 ],
      outputs: [ 1 ],
      channelCount: 2,
      channelCountMode: "max"
    });
    this._feedforward = feedforward;
    this._feedback = feedback;
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
   * @return {Float32Array}
   */
  getFeedforward() {
    return this._feedforward;
  }

  /**
   * @return {Float32Array}
   */
  getFeedback() {
    return this._feedback;
  }

  /**
   * @param {number} numberOfChannels
   */
  channelDidUpdate(numberOfChannels) {
    this.outputs[0].setNumberOfChannels(numberOfChannels);
  }
}

module.exports = util.mixin(IIRFilterNode, IIRFilterNodeDSP);
