"use strict";

require("run-with-mocha");

const assert = require("assert");
const np = require("../helpers/np");
const AudioBuffer = require("../../src/impl/AudioBuffer");
const AudioData = require("../../src/impl/core/AudioData");

const numberOfChannels = 2, length = 32, sampleRate = 8000;

describe("impl/AudioBuffer", () => {
  it("constructor", () => {
    const node = new AudioBuffer({ numberOfChannels, length, sampleRate });

    assert(node instanceof AudioBuffer);
  });

  describe("attributes", () => {
    it(".numberOfChannels", () => {
      const node = new AudioBuffer({ numberOfChannels, length, sampleRate });

      assert(node.getNumberOfChannels() === numberOfChannels);
    });

    it(".length", () => {
      const node = new AudioBuffer({ numberOfChannels, length, sampleRate });

      assert(node.getLength() === length);
    });

    it(".sampleRate", () => {
      const node = new AudioBuffer({ numberOfChannels, length, sampleRate });

      assert(node.getSampleRate() === sampleRate);
    });

    it(".duration", () => {
      const node = new AudioBuffer({ numberOfChannels, length, sampleRate });

      assert(node.getDuration() === length / sampleRate);
    });

    it(".audioData", () => {
      const buffer = new AudioBuffer({ numberOfChannels, length, sampleRate });

      assert(buffer.audioData instanceof AudioData);
      assert(buffer.audioData.sampleRate === buffer.getSampleRate());
      assert(buffer.audioData.length === buffer.getLength());
      assert(buffer.audioData.numberOfChannels === buffer.getNumberOfChannels());
    });
  });

  describe("methods", () => {
    it(".copyFromChannel(destination, channelNumber, startInChannel)", () => {
      const buffer = new AudioBuffer({ numberOfChannels, length, sampleRate });
      const destination = new Float32Array(8);

      buffer.getChannelData(0).set(np.random_sample(32));
      buffer.getChannelData(1).set(np.random_sample(32));

      buffer.copyFromChannel(destination, 1, 4);
      assert.deepEqual(destination, buffer.getChannelData(1).subarray(4, 12));
    });

    it(".copyToChannel(source, channelNumber, startInChannel)", () => {
      const buffer = new AudioBuffer({ numberOfChannels, length, sampleRate });
      const source = np.random_sample(8);

      buffer.getChannelData(0).set(np.random_sample(32));
      buffer.getChannelData(1).set(np.random_sample(32));

      buffer.copyToChannel(source, 0, 20);
      assert.deepEqual(source, buffer.getChannelData(0).subarray(20, 28));
    });
  });
});
