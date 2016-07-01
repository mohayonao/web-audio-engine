"use strict";

const clamp = require("./clamp");
const toPowerOfTwo = require("./toPowerOfTwo");
const MIN_BLOCK_SIZE = 8;
const MAX_BLOCK_SIZE = 1024;

/**
 * @param {number} value
 * @return {number}
 */
function toValidBlockSize(value) {
  return clamp(toPowerOfTwo(value), MIN_BLOCK_SIZE, MAX_BLOCK_SIZE);
}

module.exports = toValidBlockSize;
