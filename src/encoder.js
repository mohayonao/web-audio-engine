"use strict";

const WavEncoder = require("wav-encoder");
const encoderUtil = require("./util/encoderUtil");

let encodeFn = WavEncoder.encode;

/**
 * @return {function}
 */
function get() {
  return encodeFn;
}

/**
 * @param {function} fn
 */
function set(fn) {
  /* istanbul ignore else */
  if (typeof fn === "function") {
    encodeFn = fn;
  }
}

/**
 * @param {AudioData} audioData
 * @param {object}    opts
 * @return {Promise<ArrayBuffer>}
 */
function encode(audioData, opts) {
  return encoderUtil.encode(encodeFn, audioData, opts);
}

module.exports = { get: get, set: set, encode: encode };
