"use strict";

const util = require("../util");
const AudioNode = require("./AudioNode");
const ScriptProcessorNodeDSP = require("./dsp/ScriptProcessorNode");

class ScriptProcessorNode extends AudioNode {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.bufferSize
   * @param {number}       opts.numberOfInputChannels
   * @param {number}       opts.numberOfOutputChannels
   */
  constructor(context, opts) {
    opts = opts || /* istanbul ignore next */ {};

    let bufferSize = opts.bufferSize;
    let numberOfInputChannels = opts.numberOfInputChannels;
    let numberOfOutputChannels = opts.numberOfOutputChannels;

    bufferSize = Math.max(256, Math.min(bufferSize|0, 16384));
    bufferSize = util.toPowerOfTwo(bufferSize, Math.ceil);
    numberOfInputChannels = util.toValidNumberOfChannels(numberOfInputChannels);
    numberOfOutputChannels = util.toValidNumberOfChannels(numberOfOutputChannels);

    super(context, {
      inputs: [ numberOfInputChannels ],
      outputs: [ numberOfOutputChannels ],
      channelCount: numberOfInputChannels,
      channelCountMode: "explicit"
    });
    this._bufferSize = bufferSize;
    this.enableOutputsIfNecessary();
    this.dspInit();
  }

  /**
   * @return {number}
   */
  getBufferSize() {
    return this._bufferSize;
  }

  setChannelCount() {
    // This node's channelCount cannot be changed.
  }

  setChannelCountMode() {
    // This node's channelCountMode cannot be changed.
  }

  /**
   * @return {object} eventItem
   */
  setEventItem(eventItem) {
    this.dspSetEventItem(eventItem);
  }

  /**
   * @return {number}
   */
  getTailTime() {
    return Infinity;
  }
}

module.exports = util.mixin(ScriptProcessorNode, ScriptProcessorNodeDSP);
