"use strict";

/**
 * @param {*} value
 * @return {number}
 */
function toDecibel(value) {
  return 20 * Math.log10(value);
}

module.exports = toDecibel;
