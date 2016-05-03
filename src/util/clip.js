"use strict";

/**
 * @param {number} value
 * @param {number} minValue
 * @param {number} maxValue
 */
function clip(value, minValue, maxValue) {
  return Math.max(minValue, Math.min(value, maxValue));
}

module.exports = clip;
