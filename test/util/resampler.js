"use strict";

require("run-with-mocha");

const assert = require("power-assert");
const resampler = require("../../src/util/resampler");

describe("util/resampler", () => {
  describe("resample(audioData: AudioData, sampleRate: number): AudioData", () => {
    it("works", () => {
      const source = {
        sampleRate: 8000,
        channelData: [ new Float32Array(128) ]
      };
      const resampled = resampler.resample(source, 16000);

      assert(resampled.numberOfChannels === 1);
      assert(resampled.length === 256);
      assert(resampled.sampleRate === 16000);
      assert(resampled.channelData.length === resampled.numberOfChannels);
      assert(resampled.channelData[0].length === resampled.length);
    });
    it("nothing to do", () => {
      const source = {
        sampleRate: 8000,
        channelData: [ new Float32Array(128) ]
      };
      const resampled = resampler.resample(source, 8000);

      assert(resampled === source);
    });
  });
});
