"use strict";

const util = require("../util");
const AudioNode = require("./AudioNode");
const DelayNodeDSP = require("./dsp/DelayNode");

class DelayNode extends AudioNode {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.maxDelayTime
   */
  constructor(context, opts) {
    opts = opts || /* istanbul ignore next */ {};

    let maxDelayTime = util.defaults(opts.maxDelayTime, 1);

    super(context, {
      inputs: [ 1 ],
      outputs: [ 1 ],
      channelCount: 2,
      channelCountMode: "max"
    });
    this._maxDelayTime = Math.max(0, util.toNumber(maxDelayTime));
    this._delayTime = this.addParam("audio", 0);

    this.dspInit(this._maxDelayTime);
  }

  /**
   * @return {number}
   */
  getDelayTime() {
    return this._delayTime;
  }

  /**
   * @return {number}
   */
  getMaxDelayTime() {
    return this._maxDelayTime;
  }

  /**
   * @param {number} numberOfChannels
   */
  channelDidUpdate(numberOfChannels) {
    this.dspSetNumberOfChannels(numberOfChannels);
    this.outputs[0].setNumberOfChannels(numberOfChannels);
  }

  /**
   * @return {number}
   */
  getTailTime() {
    return this._maxDelayTime;
  }
}

module.exports = util.mixin(DelayNode, DelayNodeDSP);
