"use strict";

const WavDecoder = require("wav-decoder");
const decoderUtil = require("./util/decoderUtil");
const audioDataUtil = require("./util/audioDataUtil");
const AudioBuffer = require("./api/AudioBuffer");

let decodeFn = WavDecoder.decode;

/**
 * @return {function}
 */
function get() {
  return decodeFn;
}

/**
 * @param {function} fn
 */
function set(fn) {
  /* istanbul ignore else */
  if (typeof fn === "function") {
    decodeFn = fn;
  }
}

/**
 * @param {ArrayBuffer} AudioBuffer
 * @param {object}      opts
 * @return {Promise<AudioData>}
 */
function decode(audioData, opts) {
  return decoderUtil.decode(decodeFn, audioData, opts).then((audioData) => {
    return audioDataUtil.toAudioBuffer(audioData, AudioBuffer);
  });
}

module.exports = { get: get, set: set, decode: decode };
