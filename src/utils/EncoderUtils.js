"use strict";

const AudioDataUtils = require("./AudioDataUtils");

/**
 * @param {function}  encodeFn
 * @param {AudioData} audioData
 * @param {object}    opts
 */
function encode(encodeFn, audioData, /* istanbul ignore next */ opts = {}) {
  if (!AudioDataUtils.isAudioData(audioData)) {
    audioData = AudioDataUtils.toAudioData(audioData);
  }
  return encodeFn(audioData, opts);
}

module.exports = { encode };
