"use strict";

const WavDecoder = require("wav-decoder");
const decoderUtil = require("./util/decoderUtil");
const audioDataUtil = require("./util/audioDataUtil");
const AudioBuffer = require("./api/AudioBuffer");

let decodeFn = WavDecoder.decode;

function get() {
  return decodeFn;
}

function set(fn) {
  /* istanbul ignore else */
  if (typeof fn === "function") {
    decodeFn = fn;
  }
}

function decode(audioData, opts) {
  return decoderUtil.decode(decodeFn, audioData, opts).then((audioData) => {
    return audioDataUtil.toAudioBuffer(audioData, AudioBuffer);
  });
}

module.exports = { get: get, set: set, decode: decode };
