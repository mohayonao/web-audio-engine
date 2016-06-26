"use strict";

/**
 * @param {*} gainValue
 * @return {number}
 */
function toDecibel(gainValue) {
 return 20 * Math.log10(gainValue);
}

module.exports = toDecibel;
