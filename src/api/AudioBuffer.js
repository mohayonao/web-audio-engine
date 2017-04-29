"use strict";

const util = require("../util");
const impl = require("../impl");

class AudioBuffer {
  constructor(opts) {
    util.defineProp(this, "_impl", new impl.AudioBuffer(opts));
  }

  get sampleRate() {
    return this._impl.getSampleRate();
  }

  get length() {
    return this._impl.getLength();
  }

  get duration() {
    return this._impl.getDuration();
  }

  get numberOfChannels() {
    return this._impl.getNumberOfChannels();
  }

  getChannelData(channel) {
    return this._impl.getChannelData(channel);
  }

  copyFromChannel(destination, channelNumber, startInChannel) {
    this._impl.copyFromChannel(destination, channelNumber, startInChannel);
  }

  copyToChannel(source, channelNumber, startInChannel) {
    this._impl.copyToChannel(source, channelNumber, startInChannel);
  }
}

module.exports = AudioBuffer;
