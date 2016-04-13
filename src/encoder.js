"use strict";

const WavEncoder = require("wav-encoder");
const encoderUtil = require("./util/encoderUtil");

let encodeFn = WavEncoder.encode;

function get() {
  return encodeFn;
}

function set(fn) {
  /* istanbul ignore else */
  if (typeof fn === "function") {
    encodeFn = fn;
  }
}

function encode(audioData, opts) {
  return encoderUtil.encode(encodeFn, audioData, opts);
}

module.exports = { get: get, set: set, encode: encode };
