"use strict";

require("run-with-mocha");

const assert = require("assert");
const np = require("../../helpers/np");
const AudioData = require("../../../src/impl/core/AudioData");

describe("impl/core/AudioData", () => {
  it("constructor(numberOfChannels, length, sampleRate)", () => {
    const data = new AudioData(2, 128, 44100);

    assert(data instanceof AudioData);
  });

  describe("attributes", () => {
    it(".numberOfChannels", () => {
      const data = new AudioData(2, 128, 44100);

      assert(data.numberOfChannels === 2);
    });

    it(".length", () => {
      const data = new AudioData(2, 128, 44100);

      assert(data.length === 128);
    });

    it(".sampleRate", () => {
      const data = new AudioData(2, 128, 44100);

      assert(data.sampleRate === 44100);
    });

    it(".channelData", () => {
      const data = new AudioData(2, 128, 44100);

      assert(data.channelData.length === 2);
      assert.deepEqual(data.channelData[0], np.zeros(128));
      assert.deepEqual(data.channelData[1], np.zeros(128));
    });
  });
});
