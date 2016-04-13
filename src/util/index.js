"use strict";

module.exports.mixin = require("./mixin");
module.exports.defineProp = require("./defineProp");
module.exports.toAudioTime = require("./toAudioTime");

function clip(value, minValue, maxValue) {
  return Math.max(minValue, Math.min(value, maxValue));
}
module.exports.clip = clip;

function defaults(value, defaultValue) {
  return typeof value !== "undefined" ? value : defaultValue;
}
module.exports.defaults = defaults;

function toArrayIfNeeded(value) {
  return Array.isArray(value) ? value : [ value ];
}
module.exports.toArrayIfNeeded = toArrayIfNeeded;

function toImpl(value) {
  return value._impl || value;
}
module.exports.toImpl = toImpl;

function toNumber(value) {
  return +value || 0;
}
module.exports.toNumber = toNumber;

function toPowerOfTwo(value, round) {
  round = round || Math.round;
  return 1 << round(Math.log(value) / Math.log(2));
}
module.exports.toPowerOfTwo = toPowerOfTwo;

const MIN_SAMPLERATE = 3000;
const MAX_SAMPLERATE = 192000;

function toValidSampleRate(value) {
  return clip(toNumber(value), MIN_SAMPLERATE, MAX_SAMPLERATE);
}
module.exports.toValidSampleRate = toValidSampleRate;

const MIN_BLOCK_SIZE = 8;
const MAX_BLOCK_SIZE = 1024;

function toValidBlockSize(value) {
  return clip(toPowerOfTwo(value), MIN_BLOCK_SIZE, MAX_BLOCK_SIZE);
}
module.exports.toValidBlockSize = toValidBlockSize;

const MAX_NUMBER_OF_CHANNELS = 32;

function toValidNumberOfChannels(value) {
  return clip(value|0, 1, MAX_NUMBER_OF_CHANNELS);
}
module.exports.toValidNumberOfChannels = toValidNumberOfChannels;
