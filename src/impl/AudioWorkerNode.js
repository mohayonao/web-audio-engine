"use strict";

const util = require("../util");
const AudioNode = require("./AudioNode");

class AudioWorkerNode extends AudioNode {
  constructor(context, opts) {
    let worker = opts.worker;
    let numberOfInputs = opts.numberOfInputs;
    let numberOfOutputs = opts.numberOfOutputs;

    const inputs = util.toArrayIfNeeded(numberOfInputs).map(util.toValidNumberOfChannels);
    const outputs = util.toArrayIfNeeded(numberOfOutputs).map(util.toValidNumberOfChannels);

    super(context, {
      inputs,
      outputs,
      channelCount: 0,
      channelCountMode: "explicit"
    });
    this._maxChannelCount = inputs.reduce((maxValue, numberOfChannels) => Math.max(maxValue, numberOfChannels), 0);
    this._worker = worker;
    this._inputs.forEach((input, index) => {
      input.setChannelCount(inputs[index]);
    });
    this.enableOutputsIfNecessary();
  }

  getChannelCount() {
    return this._maxChannelCount;
  }

  setChannelCount() {
    // This node's channelCount cannot be changed.
  }

  getChannelCountMode() {
    return "explicit";
  }

  setChannelCountMode() {
    // This node's channelCountMode cannot be changed.
  }

  getChannelInterpretation() {
    return this._inputs[0].getChannelInterpretation();
  }

  setChannelInterpretation(value) {
    this._inputs.forEach((input) => {
      input.setChannelInterpretation(value);
    });
  }

  /* istanbul ignore next */
  postMessage() {
    throw new TypeError("NOT YET IMPLEMENTED");
  }

  getWorker() {
    return this._worker;
  }

  disableOutputsIfNecessary() {
    // This node cannot disable.
  }
}

module.exports = AudioWorkerNode;
