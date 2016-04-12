"use strict";

const AudioNode = require("./AudioNode");

class IIRFilterNode extends AudioNode {
  constructor(context, opts) {
    opts = opts || /* istanbul ignore next */ {};

    let feedforward = opts.feedforward;
    let feedback = opts.feedback;

    super(context, {
      inputs: [ 1 ],
      outputs: [ 1 ],
      channelCount: 2,
      channelCountMode: "max"
    });
    this._feedforward = feedforward;
    this._feedback = feedback;
  }

  /* istanbul ignore next */
  getFrequencyResponse() {
    throw new TypeError("NOT YET IMPLEMENTED");
  }

  getFeedforward() {
    return this._feedforward;
  }

  getFeedback() {
    return this._feedback;
  }

  channelDidUpdate(numberOfChannels) {
    this.getOutput(0).setNumberOfChannels(numberOfChannels);
  }

  dspProcess() {
    const inputBus = this.getInput(0).getAudioBus();
    const outputBus = this.getOutput(0).getAudioBus();

    outputBus.copyFrom(inputBus);
  }
}

module.exports = IIRFilterNode;
