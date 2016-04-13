"use strict";

const audioDataUtil = require("./audioDataUtil");

function encode(encodeFn, audioData, opts) {
  opts = opts || /* istanbul ignore next */ {};
  if (!audioDataUtil.isAudioData(audioData)) {
    audioData = audioDataUtil.toAudioData(audioData);
  }
  return encodeFn(audioData, opts);
}

module.exports = { encode };
