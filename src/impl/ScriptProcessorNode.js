"use strict";

const AudioNode = require("./AudioNode");
const ScriptProcessorNodeDSP = require("./dsp/ScriptProcessorNode");
const { defaults, clamp } = require("../utils");
const { toPowerOfTwo, toValidNumberOfChannels } = require("../utils");
const { EXPLICIT } = require("../constants/ChannelCountMode");

const DEFAULT_BUFFER_SIZE = 1024;
const DEFAULT_NUMBER_OF_INPUT_CHANNELS = 1;
const DEFAULT_NUMBER_OF_OUTPUT_CHANNELS = 1;
const MIN_BUFFER_SIZE = 256;
const MAX_BUFFER_SIZE = 16384;

class ScriptProcessorNode extends AudioNode {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.bufferSize
   * @param {number}       opts.numberOfInputChannels
   * @param {number}       opts.numberOfOutputChannels
   */
  constructor(context, opts = {}) {
    let bufferSize = defaults(opts.bufferSize, DEFAULT_BUFFER_SIZE);
    let numberOfInputChannels = defaults(opts.numberOfInputChannels, DEFAULT_NUMBER_OF_INPUT_CHANNELS);
    let numberOfOutputChannels = defaults(opts.numberOfOutputChannels, DEFAULT_NUMBER_OF_OUTPUT_CHANNELS);

    bufferSize = clamp(bufferSize|0, MIN_BUFFER_SIZE, MAX_BUFFER_SIZE);
    bufferSize = toPowerOfTwo(bufferSize, Math.ceil);
    numberOfInputChannels = toValidNumberOfChannels(numberOfInputChannels);
    numberOfOutputChannels = toValidNumberOfChannels(numberOfOutputChannels);

    super(context, opts, {
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
