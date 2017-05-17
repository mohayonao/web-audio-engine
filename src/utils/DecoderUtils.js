"use strict";

const nmap = require("nmap");
const AudioDataUtils = require("./AudioDataUtils");

/**
 * @param {function}    decodeFn
 * @param {ArrayBuffer} audioData
 * @param {object}      opts
 * @return {Promise<AudioData>}
 */
function decode(decodeFn, audioData, /* istanbul ignore next */ opts = {}) {
  return new Promise((resolve, reject) => {
    return decodeFn(audioData, opts).then((result) => {
      if (AudioDataUtils.isAudioData(result)) {
        if (typeof opts.sampleRate === "number") {
          result = resample(result, opts.sampleRate);
        }
        return resolve(result);
      }
      return reject(new TypeError("Failed to decode audio data"));
    }, reject);
  });
}

/**
 * @param {AudioData} audioData
 * @param {number}    sampleRate
 */
function resample(audioData, sampleRate) {
  if (audioData.sampleRate === sampleRate) {
    return audioData;
  }

  const rate = audioData.sampleRate / sampleRate;
  const numberOfChannels = audioData.channelData.length;
  const length = Math.round(audioData.channelData[0].length / rate);
  const channelData = nmap(numberOfChannels, () => new Float32Array(length));

  for (let i = 0; i < length; i++) {
    const ix = i * rate;
    const i0 = ix | 0;
    const i1 = i0 + 1;
    const ia = ix % 1;

    for (let ch = 0; ch < numberOfChannels; ch++) {
      const v0 = audioData.channelData[ch][i0];
      const v1 = audioData.channelData[ch][i1];

      channelData[ch][i] = v0 + ia * (v1 - v0);
    }
  }

  return { numberOfChannels, length, sampleRate, channelData };
}

module.exports = { decode, resample };
