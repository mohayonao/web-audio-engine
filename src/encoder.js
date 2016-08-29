"use strict";

const WavEncoder = require("wav-encoder");
const encoderUtil = require("./util/encoderUtil");

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
function encode(audioData, opts) {
  opts = opts || /* istanbul ignore next */ {};
  const type = opts.type || "wav";
  const encodeFn = encoders[type];

  if (typeof encodeFn !== "function") {
    return Promise.reject(
      new TypeError(`Encoder does not support the audio format: ${ type }`)
    );
  }

  return encoderUtil.encode(encodeFn, audioData, opts);
}

set("wav", WavEncoder.encode);

module.exports = { get, set, encode };
