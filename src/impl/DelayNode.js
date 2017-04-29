"use strict";

const util = require("../util");
const AudioNode = require("./AudioNode");
const DelayNodeDSP = require("./dsp/DelayNode");
const { MAX } = require("../constants/ChannelCountMode");
const { AUDIO_RATE } = require("../constants/AudioParamRate");

const DEFAULT_MAX_DELAY_TIME = 1;
const DEFAULT_DELAY_TIME = 0;

class DelayNode extends AudioNode {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.maxDelayTime
   * @param {number}       opts.delayTime
   */
  constructor(context, opts = {}) {
    let maxDelayTime = util.defaults(opts.maxDelayTime, DEFAULT_MAX_DELAY_TIME);
    let delayTime = util.defaults(opts.delayTime, DEFAULT_DELAY_TIME);

    maxDelayTime = Math.max(0, util.toNumber(maxDelayTime));
    delayTime = Math.min(delayTime, maxDelayTime);

    super(context, opts, {
      inputs: [ 1 ],
      outputs: [ 1 ],
      channelCount: 2,
      channelCountMode: MAX
    });

    this._maxDelayTime = maxDelayTime;
    this._delayTime = this.addParam(AUDIO_RATE, delayTime);

    this.dspInit(this._maxDelayTime);
    this.dspUpdateKernel(1);
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
    this.dspUpdateKernel(numberOfChannels);
    this.outputs[0].setNumberOfChannels(numberOfChannels);
  }

  /**
   * @return {number}
   */
  getTailTime() {
    return this._maxDelayTime;
  }
}

Object.assign(DelayNode.prototype, DelayNodeDSP);

module.exports = DelayNode;
