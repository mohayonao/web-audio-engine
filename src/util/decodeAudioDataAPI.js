"use strict";

const WavDecoder = require("wav-decoder");
const resampler = require("./resampler");

let _decodeAudioData = WavDecoder.decode;

function getDecodeAudioData() {
  return _decodeAudioData;
}

function setDecodeAudioData(fn) {
  /* istanbul ignore else */
  if (typeof fn === "function") {
    _decodeAudioData = fn;
  }
}

function decodeAudioData(audioData, sampleRate) {
  return new Promise((resolve, reject) => {
    return _decodeAudioData(audioData).then((result) => {
      if (hasAudioDataInterface(result)) {
        return resolve(resampler.resample(result, sampleRate));
      }
      return reject(new TypeError("Failed to decodeAudioData"));
    }, reject);
  });
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

module.exports = { getDecodeAudioData, setDecodeAudioData, decodeAudioData };
