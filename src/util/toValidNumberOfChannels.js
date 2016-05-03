"use strict";

const toNumber = require("./toNumber");
const clip = require("./clip");
const MAX_NUMBER_OF_CHANNELS = 32;

/**
 * @param {number} value
 * @return {number}
 */
function toValidNumberOfChannels(value) {
  return clip(toNumber(value), 1, MAX_NUMBER_OF_CHANNELS)|0;
}

module.exports = toValidNumberOfChannels;
