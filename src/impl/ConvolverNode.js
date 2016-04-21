"use strict";

const util = require("../util");
const AudioNode = require("./AudioNode");
const AudioBuffer = require("./AudioBuffer");
const ConvolverNodeDSP = require("./dsp/ConvolverNode");

class ConvolverNode extends AudioNode {
  /**
   * @param {AudioContext} context
   */
  constructor(context) {
    super(context, {
      inputs: [ 1 ],
      outputs: [ 1 ],
      channelCount: 2,
      channelCountMode: "clamped-max"
    });
    this._buffer = null;
    this._audioData = null;
    this._normalize = true;
  }

  /**
   * @param {number} value
   */
  setChannelCount(value) {
    value = util.clip(value|0, 1, 2);
    super.setChannelCount(value);
  }

  /**
   * @param {string} value
   */
  setChannelCountMode(value) {
    /* istanbul ignore else */
    if (value === "clamped-max" || value === "explicit") {
      super.setChannelCountMode(value);
    }
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
      this._audioData = this._buffer.getAudioData();
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

module.exports = util.mixin(ConvolverNode, ConvolverNodeDSP);
