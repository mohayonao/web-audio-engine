"use strict";

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
  const channelData = new Array(numberOfChannels).fill().map(() => new Float32Array(length));

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

module.exports = { resample };
