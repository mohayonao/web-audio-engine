"use strict";

const AudioNode = require("./AudioNode");
const GainNodeDSP = require("./dsp/GainNode");
const { defaults } = require("../utils");
const { MAX } = require("../constants/ChannelCountMode");
const { AUDIO_RATE } = require("../constants/AudioParamRate");

const DEFAULT_GAIN = 1;

class GainNode extends AudioNode {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.gain
   */
  constructor(context, opts = {}) {
    let gain = defaults(opts.gain, DEFAULT_GAIN);

    super(context, opts, {
      inputs: [ 1 ],
      outputs: [ 1 ],
      channelCount: 2,
      channelCountMode: MAX
    });

    this._gain = this.addParam(AUDIO_RATE, gain);
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
