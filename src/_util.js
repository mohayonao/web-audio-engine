"use strict";

function clip(value, minValue, maxValue) {
  return Math.max(minValue, Math.min(value, maxValue));
}
module.exports.clip = clip;

function mixin(targetKlass, partialKlass) {
  const partialProto = partialKlass.prototype;
  const targetProto = targetKlass.prototype;

  Object.getOwnPropertyNames(partialProto).forEach((methodName) => {
    if (methodName !== "constructor") {
      const desc = Object.getOwnPropertyDescriptor(partialProto, methodName);

      Object.defineProperty(targetProto, methodName, desc);
    }
  });

  return targetKlass;
}
module.exports.mixin = mixin;

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

const MIN_PROCESSING_SIZE_IN_FRAMES = 8;
const MAX_PROCESSING_SIZE_IN_FRAMES = 1024;

function toValidProcessingSizeInFrames(value) {
  return clip(toPowerOfTwo(value), MIN_PROCESSING_SIZE_IN_FRAMES, MAX_PROCESSING_SIZE_IN_FRAMES);
}
module.exports.toValidProcessingSizeInFrames = toValidProcessingSizeInFrames;

const MAX_NUMBER_OF_CHANNELS = 32;

function toValidNumberOfChannels(value) {
  return clip(value|0, 1, MAX_NUMBER_OF_CHANNELS);
}
module.exports.toValidNumberOfChannels = toValidNumberOfChannels;
