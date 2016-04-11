"use strict";

const util = require("../util");
const AudioNode = require("./AudioNode");
const AudioNodeOutput = require("./core/AudioNodeOutput");

class AudioDestinationNode extends AudioNode {
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
    this._output = new AudioNodeOutput({ node: this, index: 0, numberOfChannels: numberOfChannels });
    this._outputBus = this._output.getAudioBus();
    this._outputBus.setChannelInterpretation("speakers");
    this._output.enable();
  }

  getMaxChannelCount() {
    return this._numberOfChannels;
  }

  setChannelCount(value) {
    value = util.clip(value|0, 1, this.getMaxChannelCount());
    super.setChannelCount(value);
  }

  getOutput() {
    return this._output;
  }

  dspProcess() {
    const inputBus = this.getInput(0).getAudioBus();
    const outputBus = this._outputBus;

    outputBus.copyFrom(inputBus);
  }
}

module.exports = AudioDestinationNode;
