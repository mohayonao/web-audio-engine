"use strict";

const clip = require("./clip");

/**
 * normalize - returns a number between 0 - 1
 * @param {number} value
 * @param {number} minValue
 * @param {number} maxValue
 */
function normalize(value, minValue, maxValue) {
  const val = (value - minValue) / (maxValue - minValue);
  return clip(val, 0, 1);
}

module.exports = normalize;
