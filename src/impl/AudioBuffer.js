"use strict";

const util = require("../util");
const AudioData = require("./core/AudioData");

class AudioBuffer {
  constructor(context, opts) {
    opts = opts || /* istanbul ignore next */ {};

    let numberOfChannels = opts.numberOfChannels;
    let length = opts.length;
    let sampleRate = opts.sampleRate;

    numberOfChannels = util.toValidNumberOfChannels(numberOfChannels);
    length = Math.max(0, util.toNumber(length));
    sampleRate = util.toValidSampleRate(sampleRate);

    this._audioData = new AudioData(numberOfChannels, length, sampleRate);
  }

  getSampleRate() {
    return this._audioData.sampleRate;
  }

  getLength() {
    return this._audioData.length;
  }

  getDuration() {
    return this._audioData.length / this._audioData.sampleRate;
  }

  getNumberOfChannels() {
    return this._audioData.numberOfChannels;
  }

  getAudioData() {
    return this._audioData;
  }

  getChannelData(channel) {
    return this._audioData.channelData[channel|0];
  }

  copyFromChannel(destination, channelNumber, startInChannel) {
    const source = this._audioData.channelData[channelNumber|0];

    startInChannel = startInChannel|0;

    destination.set(source.subarray(startInChannel, startInChannel + destination.length));
  }

  copyToChannel(source, channelNumber, startInChannel) {
    const destination = this._audioData.channelData[channelNumber|0];

    startInChannel = startInChannel|0;

    destination.set(source, startInChannel);
  }
}

module.exports = AudioBuffer;
