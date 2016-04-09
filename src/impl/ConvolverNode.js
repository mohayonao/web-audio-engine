"use strict";

const util = require("../_util");
const AudioNode = require("./AudioNode");
const AudioBuffer = require("./AudioBuffer");

class ConvolverNode extends AudioNode {
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

  setChannelCount(value) {
    value = util.clip(value|0, 1, 2);
    super.setChannelCount(value);
  }

  setChannelCountMode(value) {
    /* istanbul ignore else */
    if (value === "clamped-max" || value === "explicit") {
      super.setChannelCountMode(value);
    }
  }

  getBuffer() {
    return this._buffer;
  }

  setBuffer(value) {
    value = util.toImpl(value);

    /* istanbul ignore else */
    if (value instanceof AudioBuffer) {
      this._buffer = value;
      this._audioData = this._buffer.getAudioData();
    }
  }

  getNormalize() {
    return this._normalize;
  }

  setNormalize(value) {
    this._normalize = !!value;
  }

  channelDidUpdate(numberOfChannels) {
    numberOfChannels = Math.min(numberOfChannels, 2);

    this.getOutput(0).setNumberOfChannels(numberOfChannels);
  }
}

module.exports = ConvolverNode;
