"use strict";

const toNumber = require("./toNumber");
const clamp = require("./clamp");
const MAX_NUMBER_OF_CHANNELS = 32;

/**
 * @param {number} value
 * @return {number}
 */
function toValidNumberOfChannels(value) {
  return clamp(toNumber(value), 1, MAX_NUMBER_OF_CHANNELS)|0;
}

module.exports = toValidNumberOfChannels;
