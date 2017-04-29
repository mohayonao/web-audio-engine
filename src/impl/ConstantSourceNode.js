"use strict";

const util = require("../util");
const AudioScheduledSourceNode = require("./AudioScheduledSourceNode");
const ConstantSourceNodeDSP = require("./dsp/ConstantSourceNode");
const { MAX } = require("../constants/ChannelCountMode");
const { AUDIO_RATE } = require("../constants/AudioParamRate");

const DEFAULT_OFFSET = 1;

class ConstantSourceNode extends AudioScheduledSourceNode {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.offset
   */
  constructor(context, opts = {}) {
    let offset = util.defaults(opts.offset, DEFAULT_OFFSET);

    super(context, opts, {
      inputs: [ 1 ],
      outputs: [ 1 ],
      channelCount: 2,
      channelCountMode: MAX
    });

    this._offset = this.addParam(AUDIO_RATE, offset);
  }

  /**
   * @return {AudioParam}
   */
  getOffset() {
    return this._offset;
  }
}

Object.assign(ConstantSourceNode.prototype, ConstantSourceNodeDSP);

module.exports = ConstantSourceNode;
