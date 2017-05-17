"use strict";

/**
 * @param {*} value
 * @return {number}
 */
function toGain(value) {
  return Math.sqrt(Math.pow(10, (value / 10)));
}

module.exports = toGain;
