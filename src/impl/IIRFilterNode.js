"use strict";

const util = require("../util");
const AudioNode = require("./AudioNode");
const IIRFilterNodeDSP = require("./dsp/IIRFilterNode");
const { MAX } = require("../constants/ChannelCountMode");

class IIRFilterNode extends AudioNode {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {Float32Array} opts.feedforward
   * @param {Float32Array} opts.feedback
   */
  constructor(context, /* istanbul ignore next */ opts = {}) {
    let feedforward = util.defaults(opts.feedforward, [ 0 ]);
    let feedback = util.defaults(opts.feedback, [ 1 ]);

    super(context, {
      inputs: [ 1 ],
      outputs: [ 1 ],
      channelCount: 2,
      channelCountMode: MAX
    });
    this._feedforward = feedforward;
    this._feedback = feedback;

    this.dspInit();
    this.dspUpdateKernel(1);
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
    this.dspUpdateKernel(numberOfChannels);
    this.outputs[0].setNumberOfChannels(numberOfChannels);
  }
}

Object.assign(IIRFilterNode.prototype, IIRFilterNodeDSP);

module.exports = IIRFilterNode;
