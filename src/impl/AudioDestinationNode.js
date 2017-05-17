"use strict";

const AudioNode = require("./AudioNode");
const { toValidNumberOfChannels } = require("../utils");
const { EXPLICIT } = require("../constants/ChannelCountMode");

/**
 * @prop {AudioNodeOutput} output
 * @prop {AudioBus}        outputBus
 */
class AudioDestinationNode extends AudioNode {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.numberOfChannels
   */
  constructor(context, opts = {}) {
    let numberOfChannels = opts.numberOfChannels;

    numberOfChannels = toValidNumberOfChannels(numberOfChannels);

    super(context, opts, {
      inputs: [ numberOfChannels ],
      outputs: [],
      channelCount: numberOfChannels,
      channelCountMode: EXPLICIT,
      allowedMaxChannelCount: numberOfChannels
    });

    this._numberOfChannels = numberOfChannels|0;
    this._destinationChannelData = this.inputs[0].bus.getChannelData();
  }

  /**
   * @return {number}
   */
  getMaxChannelCount() {
    return this._numberOfChannels;
  }

  /**
   * @param {Float32Array[]} channelData
   * @param {number}         offset
   */
  process(channelData, offset) {
    const inputs = this.inputs;
    const destinationChannelData = this._destinationChannelData;
    const numberOfChannels = channelData.length;

    for (let i = 0, imax = inputs.length; i < imax; i++) {
      inputs[i].pull();
    }

    for (let ch = 0; ch < numberOfChannels; ch++) {
      channelData[ch].set(destinationChannelData[ch], offset);
    }
  }
}

module.exports = AudioDestinationNode;
