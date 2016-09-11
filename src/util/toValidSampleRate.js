"use strict";

const toNumber = require("./toNumber");
const clamp = require("./clamp");
const { MIN_SAMPLERATE, MAX_SAMPLERATE } = require("../constants");

/**
 * @param {number} value
 * @return {number}
 */
function toValidSampleRate(value) {
  return clamp(toNumber(value), MIN_SAMPLERATE, MAX_SAMPLERATE)|0;
}

module.exports = toValidSampleRate;
