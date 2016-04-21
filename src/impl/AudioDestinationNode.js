"use strict";

const util = require("../util");
const AudioNode = require("./AudioNode");
const AudioNodeOutput = require("./core/AudioNodeOutput");
const AudioDestinationNodeDSP = require("./dsp/AudioDestinationNode");

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

    this._numberOfChannels = numberOfChannels;
    this.output = new AudioNodeOutput({ node: this, index: 0, numberOfChannels: numberOfChannels });
    this.outputBus = this.output.bus;
    this.outputBus.setChannelInterpretation("speakers");
    this.output.enable();
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
   * @return {AudioNodeOutput}
   */
  getOutput() {
    return this.output;
  }
}

module.exports = util.mixin(AudioDestinationNode, AudioDestinationNodeDSP);
