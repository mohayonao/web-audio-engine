"use strict";

const util = require("../util");
const AudioNode = require("./AudioNode");

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
  constructor(context, opts) {
    opts = opts || /* istanbul ignore next */ {};

    let numberOfChannels = opts.numberOfChannels;

    numberOfChannels = util.toValidNumberOfChannels(numberOfChannels);

    super(context, {
      inputs: [ numberOfChannels ],
      outputs: [],
      channelCount: numberOfChannels,
      channelCountMode: "explicit"
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
   * @param {number} value
   */
  setChannelCount(value) {
    value = util.clip(value|0, 1, this.getMaxChannelCount());
    super.setChannelCount(value);
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
