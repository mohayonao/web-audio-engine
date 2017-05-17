"use strict";

const nmap = require("nmap");

/**
 * @param {*} data
 * @return {boolean}
 */
function isAudioData(data) {
  if (!data) {
    return false;
  }
  if (!Number.isFinite(data.sampleRate)) {
    return false;
  }
  if (!Array.isArray(data.channelData)) {
    return false;
  }
  if (!data.channelData.every(data => data instanceof Float32Array)) {
    return false;
  }
  return true;
}

/**
 * @param {object} data
 * @return {AudioData}
 */
function toAudioData(data) {
  if (isAudioData(data)) {
    const numberOfChannels = data.channelData.length;
    const length = numberOfChannels ? data.channelData[0].length : 0;
    const sampleRate = data.sampleRate;
    const channelData = data.channelData;

    return { numberOfChannels, length, sampleRate, channelData };
  }
  if (isAudioBuffer(data)) {
    const numberOfChannels = data.numberOfChannels;
    const sampleRate = data.sampleRate;
    const channelData = nmap(numberOfChannels, (_, ch) => data.getChannelData(ch));
    const length = numberOfChannels ? channelData[0].length : 0;

    return { numberOfChannels, length, sampleRate, channelData };
  }
  return { numberOfChannels: 0, length: 0, sampleRate: 0, channelData: [] };
}

/**
 * @param {*} data
 * @return {boolean}
 */
function isAudioBuffer(data) {
  if (!data) {
    return false;
  }
  if (typeof data.numberOfChannels !== "number") {
    return false;
  }
  if (typeof data.sampleRate !== "number") {
    return false;
  }
  if (typeof data.getChannelData !== "function") {
    return false;
  }
  return true;
}

/**
 * @param {object} data
 * @param {class}  AudioBuffer
 * @return {AudioBuffer}
 */
function toAudioBuffer(data, AudioBuffer) {
  data = toAudioData(data);

  const audioBuffer = new AudioBuffer({
    numberOfChannels: data.numberOfChannels,
    length: data.length,
    sampleRate: data.sampleRate,
  });
  const audioData = (audioBuffer._impl || audioBuffer).audioData;

  audioData.numberOfChannels = data.numberOfChannels;
  audioData.length = data.length;
  audioData.sampleRate = data.sampleRate;
  audioData.channelData = data.channelData;

  return audioBuffer;
}

module.exports = { isAudioData, toAudioData, isAudioBuffer, toAudioBuffer };
