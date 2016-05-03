"use strict";

const toNumber = require("./toNumber");
const clip = require("./clip");
const MIN_SAMPLERATE = 3000;
const MAX_SAMPLERATE = 192000;

/**
 * @param {number} value
 * @return {number}
 */
function toValidSampleRate(value) {
  return clip(toNumber(value), MIN_SAMPLERATE, MAX_SAMPLERATE)|0;
}

module.exports = toValidSampleRate;
