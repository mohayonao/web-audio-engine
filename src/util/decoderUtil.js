"use strict";

const audioDataUtil = require("./audioDataUtil");
const resampler = require("./resampler");

/**
 * @param {function}    decodeFn
 * @param {ArrayBuffer} audioData
 * @param {object}      opts
 * @return {Promise<AudioData>}
 */
function decode(decodeFn, audioData, /* istanbul ignore next */ opts = {}) {
  return new Promise((resolve, reject) => {
    return decodeFn(audioData, opts).then((result) => {
      if (audioDataUtil.isAudioData(result)) {
        if (typeof opts.sampleRate === "number") {
          result = resampler.resample(result, opts.sampleRate);
        }
        return resolve(result);
      }
      return reject(new TypeError("Failed to decode audio data"));
    }, reject);
  });
}

module.exports = { decode };
