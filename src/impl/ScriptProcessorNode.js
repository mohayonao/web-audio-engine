"use strict";

const util = require("../util");
const AudioNode = require("./AudioNode");
const ScriptProcessorNodeDSP = require("./dsp/ScriptProcessorNode");
const { EXPLICIT } = require("../constants/ChannelCountMode");

class ScriptProcessorNode extends AudioNode {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.bufferSize
   * @param {number}       opts.numberOfInputChannels
   * @param {number}       opts.numberOfOutputChannels
   */
  constructor(context, /* istanbul ignore next */ opts = {}) {
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
      channelCountMode: EXPLICIT,
      allowedMaxChannelCount: numberOfInputChannels,
      allowedMinChannelCount: numberOfInputChannels,
      allowedChannelCountMode: [ EXPLICIT ]
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

Object.assign(ScriptProcessorNode.prototype, ScriptProcessorNodeDSP);

module.exports = ScriptProcessorNode;
