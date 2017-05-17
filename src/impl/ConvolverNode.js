"use strict";

const AudioNode = require("./AudioNode");
const AudioBuffer = require("./AudioBuffer");
const ConvolverNodeDSP = require("./dsp/ConvolverNode");
const { defaults } = require("../utils");
const { toImpl } = require("../utils");
const { CLAMPED_MAX, EXPLICIT } = require("../constants/ChannelCountMode");

const DEFAULT_DISABLE_NORMALIZATION = false;

class ConvolverNode extends AudioNode {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {boolean}      opts.disableNormalization
   */
  constructor(context, opts = {}) {
    let disableNormalization = defaults(opts.disableNormalization, DEFAULT_DISABLE_NORMALIZATION);

    super(context, opts, {
      inputs: [ 1 ],
      outputs: [ 1 ],
      channelCount: 2,
      channelCountMode: CLAMPED_MAX,
      allowedMaxChannelCount: 2,
      allowedChannelCountMode: [ CLAMPED_MAX, EXPLICIT ]
    });

    this._buffer = null;
    this._audioData = null;
    this._normalize = !disableNormalization;
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
    value = toImpl(value);

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
