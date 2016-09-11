"use strict";

const util = require("../util");
const AudioNode = require("./AudioNode");
const AudioBuffer = require("./AudioBuffer");
const ConvolverNodeDSP = require("./dsp/ConvolverNode");
const { CLAMPED_MAX, EXPLICIT } = require("../constants/ChannelCountMode");

class ConvolverNode extends AudioNode {
  /**
   * @param {AudioContext} context
   */
  constructor(context) {
    super(context, {
      inputs: [ 1 ],
      outputs: [ 1 ],
      channelCount: 2,
      channelCountMode: CLAMPED_MAX,
      allowedMaxChannelCount: 2,
      allowedChannelCountMode: [ CLAMPED_MAX, EXPLICIT ]
    });
    this._buffer = null;
    this._audioData = null;
    this._normalize = true;
  }

  /**
   * @return {AudioBuffer}
   */
  getBuffer() {
    return this._buffer;
  }

  /**
   * @param {AudioBuffer} value
   */
  setBuffer(value) {
    value = util.toImpl(value);

    /* istanbul ignore else */
    if (value instanceof AudioBuffer) {
      this._buffer = value;
      this._audioData = this._buffer.audioData;
    }
  }

  /**
   * @return {boolean}
   */
  getNormalize() {
    return this._normalize;
  }

  /**
   * @param {boolean} value
   */
  setNormalize(value) {
    this._normalize = !!value;
  }

  /**
   * @param {number} numberOfChannels
   */
  channelDidUpdate(numberOfChannels) {
    numberOfChannels = Math.min(numberOfChannels, 2);

    this.outputs[0].setNumberOfChannels(numberOfChannels);
  }
}

Object.assign(ConvolverNode.prototype, ConvolverNodeDSP);

module.exports = ConvolverNode;
