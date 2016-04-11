"use strict";

const WavEncoder = require("wav-encoder");

let _encodeAudioData = WavEncoder.encode;

function getEncodeAudioData() {
  return _encodeAudioData;
}

function setEncodeAudioData(fn) {
  /* istanbul ignore else */
  if (typeof fn === "function") {
    _encodeAudioData = fn;
  }
}

function encodeAudioData(audioData) {
  if (hasAudioDataInterface(audioData)) {
    return _encodeAudioData(audioData);
  }
  return Promise.reject(new TypeError("Failed )to encodeAudioData"));
}

/* istanbul ignore next */
function hasAudioDataInterface(data) {
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

module.exports = { getEncodeAudioData, setEncodeAudioData, encodeAudioData };
