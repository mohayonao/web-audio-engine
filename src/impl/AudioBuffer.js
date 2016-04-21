"use strict";

const util = require("../util");
const AudioData = require("./core/AudioData");

class AudioBuffer {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.numberOfChannels
   * @param {number}       opts.length
   * @param {number}       opts.sampleRate
   */
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

  /**
   * @return {number}
   */
  getSampleRate() {
    return this._audioData.sampleRate;
  }

  /**
   * @return {number}
   */
  getLength() {
    return this._audioData.length;
  }

  /**
   * @return {number}
   */
  getDuration() {
    return this._audioData.length / this._audioData.sampleRate;
  }

  /**
   * @return {number}
   */
  getNumberOfChannels() {
    return this._audioData.numberOfChannels;
  }

  /**
   * @return {AudioData}
   */
  getAudioData() {
    return this._audioData;
  }

  /**
   * @return {Float32Array}
   */
  getChannelData(channel) {
    return this._audioData.channelData[channel|0];
  }

  /**
   * @param {Float32Array} destination
   * @param {number}       channelNumber
   * @param {number}       startInChannel
   */
  copyFromChannel(destination, channelNumber, startInChannel) {
    const source = this._audioData.channelData[channelNumber|0];

    startInChannel = startInChannel|0;

    destination.set(source.subarray(startInChannel, startInChannel + destination.length));
  }

  /**
   * @param {Float32Array} source
   * @param {number}       channelNumber
   * @param {number}       startInChannel
   */
  copyToChannel(source, channelNumber, startInChannel) {
    const destination = this._audioData.channelData[channelNumber|0];

    startInChannel = startInChannel|0;

    destination.set(source, startInChannel);
  }
}

module.exports = AudioBuffer;
