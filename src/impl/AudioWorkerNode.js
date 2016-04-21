"use strict";

const util = require("../util");
const AudioNode = require("./AudioNode");

class AudioWorkerNode extends AudioNode {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.numberOfInputs
   * @param {number}       opts.numberOfOutputs
   */
  constructor(context, opts) {
    opts = opts || /* istanbul ignore next */ {};

    let worker = opts.worker;
    let numberOfInputs = util.defaults(opts.numberOfInputs, 0);
    let numberOfOutputs = util.defaults(opts.numberOfOutputs, 0);

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
    this.inputs.forEach((input, index) => {
      input.setChannelCount(inputs[index]);
    });
    this.enableOutputsIfNecessary();
  }

  /**
   * @return {number}
   */
  getChannelCount() {
    return this._maxChannelCount;
  }

  setChannelCount() {
    // This node's channelCount cannot be changed.
  }

  /**
   * @return {string}
   */
  getChannelCountMode() {
    return "explicit";
  }

  setChannelCountMode() {
    // This node's channelCountMode cannot be changed.
  }

  /**
   * @return {string}
   */
  getChannelInterpretation() {
    return this.inputs[0].getChannelInterpretation();
  }

  /**
   * @param {string} value
   */
  setChannelInterpretation(value) {
    this.inputs.forEach((input) => {
      input.setChannelInterpretation(value);
    });
  }

  /**
   * @param {*} message
   */
  /* istanbul ignore next */
  postMessage() {
    throw new TypeError("NOT YET IMPLEMENTED");
  }

  /**
   * @return {AudioWorker}
   */
  getWorker() {
    return this._worker;
  }

  /**
   * @return {number}
   */
  getTailTime() {
    return Infinity;
  }
}

module.exports = AudioWorkerNode;
