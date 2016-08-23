"use strict";

require("run-with-mocha");

const assert = require("power-assert");
const deepEqual = require("deep-equal");
const np = require("../../helpers/np");
const AudioData = require("../../../src/impl/core/AudioData");

describe("AudioData", () => {
  describe("basic attributes", () => {
    it("works", () => {
      const data = new AudioData(2, 128, 44100);

      assert(data instanceof AudioData);
      assert(data.numberOfChannels === 2);
      assert(data.length === 128);
      assert(data.sampleRate === 44100);
      assert(data.channelData.length === 2);
      assert(deepEqual(data.channelData[0], np.zeros(128)));
      assert(deepEqual(data.channelData[1], np.zeros(128)));
    });
  });
});
