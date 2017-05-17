"use strict";

const WavEncoder = require("wav-encoder");
const EncoderUtils = require("./utils/EncoderUtils");

const encoders = {};

/**
 * @param {string}    type
 * @return {function}
 */
function get(type) {
  return encoders[type] || null;
}

/**
 * @param {string}   type
 * @param {function} fn
 */
function set(type, fn) {
  /* istanbul ignore else */
  if (typeof fn === "function") {
    encoders[type] = fn;
  }
}

/**
 * @param {AudioData} audioData
 * @param {object}    opts
 * @return {Promise<ArrayBuffer>}
 */
function encode(audioData, /* istanbul ignore next */ opts = {}) {
  const type = opts.type || "wav";
  const encodeFn = encoders[type];

  if (typeof encodeFn !== "function") {
    return Promise.reject(
      new TypeError(`Encoder does not support the audio format: ${ type }`)
    );
  }

  return EncoderUtils.encode(encodeFn, audioData, opts);
}

set("wav", WavEncoder.encode);

module.exports = { get, set, encode };
