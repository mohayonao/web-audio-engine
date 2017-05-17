"use strict";

const AudioData = require("./core/AudioData");
const { toValidNumberOfChannels, toNumber, toValidSampleRate } = require("../utils");

/**
 * @prop {AudioData} audioData
 */
class AudioBuffer {
  /**
   * @param {object}       opts
   * @param {number}       opts.numberOfChannels
   * @param {number}       opts.length
   * @param {number}       opts.sampleRate
   */
  constructor(opts = {}) {
    let numberOfChannels = opts.numberOfChannels;
    let length = opts.length;
    let sampleRate = opts.sampleRate;

    numberOfChannels = toValidNumberOfChannels(numberOfChannels);
    length = Math.max(0, toNumber(length));
    sampleRate = toValidSampleRate(sampleRate);

    this.audioData = new AudioData(numberOfChannels, length, sampleRate);
  }

  /**
   * @return {number}
   */
  getSampleRate() {
    return this.audioData.sampleRate;
  }

  /**
   * @return {number}
   */
  getLength() {
    return this.audioData.length;
  }

  /**
   * @return {number}
   */
  getDuration() {
    return this.audioData.length / this.audioData.sampleRate;
  }

  /**
   * @return {number}
   */
  getNumberOfChannels() {
    return this.audioData.numberOfChannels;
  }

  /**
   * @return {Float32Array}
   */
  getChannelData(channel) {
    return this.audioData.channelData[channel|0];
  }

  /**
   * @param {Float32Array} destination
   * @param {number}       channelNumber
   * @param {number}       startInChannel
   */
  copyFromChannel(destination, channelNumber, startInChannel) {
    const source = this.audioData.channelData[channelNumber|0];

    startInChannel = startInChannel|0;

    destination.set(source.subarray(startInChannel, startInChannel + destination.length));
  }

  /**
   * @param {Float32Array} source
   * @param {number}       channelNumber
   * @param {number}       startInChannel
   */
  copyToChannel(source, channelNumber, startInChannel) {
    const destination = this.audioData.channelData[channelNumber|0];

    startInChannel = startInChannel|0;

    destination.set(source, startInChannel);
  }
}

module.exports = AudioBuffer;
