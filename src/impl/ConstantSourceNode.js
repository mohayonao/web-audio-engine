"use strict";

const AudioScheduledSourceNode = require("./AudioScheduledSourceNode");
const ConstantSourceNodeDSP = require("./dsp/ConstantSourceNode");
const { MAX } = require("../constants/ChannelCountMode");
const { AUDIO_RATE } = require("../constants/AudioParamRate");

class ConstantSourceNode extends AudioScheduledSourceNode {
  /**
   * @param {AudioContext} context
   */
  constructor(context) {
    super(context, {
      inputs: [ 1 ],
      outputs: [ 1 ],
      channelCount: 2,
      channelCountMode: MAX
    });
    this._offset = this.addParam(AUDIO_RATE, 1);
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
