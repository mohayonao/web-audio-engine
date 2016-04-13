"use strict";

const assert = require("power-assert");
const deepEqual = require("deep-equal");
const np = require("../helpers/np");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const AudioBuffer = require("../../src/impl/AudioBuffer");
const AudioData = require("../../src/impl/core/AudioData");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
const testSpec = {};

testSpec.sampleRate = {
  testCase: [ { expected: 8000 } ]
};

testSpec.length = {
  testCase: [ { expected: 32 } ]
};

testSpec.duration = {
  testCase: [ { expected: 32 / 8000 } ]
};

testSpec.numberOfChannels = {
  testCase: [ { expected: 2 } ]
};

describe("AudioBuffer", () => {
  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: AudioBuffer,
      create: context => new AudioBuffer(context, { numberOfChannels: 2, length: 32, sampleRate: 8000 }),
      testSpec
    });
  });

  describe("internal data", () => {
    it("audio data", () => {
      const buffer = new AudioBuffer(context, { numberOfChannels: 2, length: 32, sampleRate: 8000 });
      const audioData = buffer.getAudioData();

      assert(audioData instanceof AudioData);
      assert(audioData.sampleRate === buffer.getSampleRate());
      assert(audioData.length === buffer.getLength());
      assert(audioData.numberOfChannels === buffer.getNumberOfChannels());
    });
  });

  describe("buffer operations", () => {
    let buffer;

    beforeEach(() => {
      buffer = new AudioBuffer(context, { numberOfChannels: 2, length: 32, sampleRate: 8000 });

      buffer.getChannelData(0).set(np.random_sample(32));
      buffer.getChannelData(1).set(np.random_sample(32));
    });

    it("copy from", () => {
      const destination = new Float32Array(8);

      buffer.copyFromChannel(destination, 1, 4);
      assert(deepEqual(destination, buffer.getChannelData(1).subarray(4, 12)));
    });

    it("copy to", () => {
      const source = np.random_sample(8);

      buffer.copyToChannel(source, 0, 20);
      assert(deepEqual(source, buffer.getChannelData(0).subarray(20, 28)));
    });
  });
});
