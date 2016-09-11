"use strict";

const AudioNode = require("./AudioNode");
const GainNodeDSP = require("./dsp/GainNode");
const { MAX } = require("../constants/ChannelCountMode");
const { AUDIO_RATE } = require("../constants/AudioParamRate");

class GainNode extends AudioNode {
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
    this._gain = this.addParam(AUDIO_RATE, 1);
  }

  /**
   * @return {AudioParam}
   */
  getGain() {
    return this._gain;
  }

  /**
   * @param {number} numberOfChannels
   */
  channelDidUpdate(numberOfChannels) {
    this.outputs[0].setNumberOfChannels(numberOfChannels);
  }
}

Object.assign(GainNode.prototype, GainNodeDSP);

module.exports = GainNode;
