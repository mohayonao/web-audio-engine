"use strict";

/**
 * @param {*} decibelValue
 * @return {number}
 */
function toGain(decibelValue) {
  return Math.sqrt(Math.pow(10, (decibelValue / 10)));
}

module.exports = toGain;
