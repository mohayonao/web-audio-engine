"use strict";

const audioType = require("audio-type");
const WavDecoder = require("wav-decoder");
const decoderUtil = require("./util/decoderUtil");
const audioDataUtil = require("./util/audioDataUtil");
const AudioBuffer = require("./api/AudioBuffer");

const decoders = {};

/**
 * @param {string}    type
 * @return {function}
 */
function get(type) {
  return decoders[type] || null;
}

/**
 * @param {string}   type
 * @param {function} fn
 */
function set(type, fn) {
  /* istanbul ignore else */
  if (typeof fn === "function") {
    decoders[type] = fn;
  }
}

/**
 * @param {ArrayBuffer} AudioBuffer
 * @param {object}      opts
 * @return {Promise<AudioData>}
 */
function decode(audioData, opts) {
  const type = toAudioType(audioData);
  const decodeFn = decoders[type];

  if (typeof decodeFn !== "function") {
    return Promise.reject(
      new TypeError(`Decoder does not support the audio format: ${ type || "unknown" }`)
    );
  }

  return decoderUtil.decode(decodeFn, audioData, opts).then((audioData) => {
    return audioDataUtil.toAudioBuffer(audioData, AudioBuffer);
  });
}

function toAudioType(audioData) {
  if (audioData instanceof ArrayBuffer) {
    audioData = new Uint8Array(audioData, 0, 16);
  }
  return audioType(audioData) || "";
}

set("wav", WavDecoder.decode);

module.exports = { get, set, decode };
