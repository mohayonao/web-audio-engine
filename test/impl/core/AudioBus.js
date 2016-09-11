"use strict";

require("run-with-mocha");

const assert = require("assert");
const np = require("../../helpers/np");
const AudioBus = require("../../../src/impl/core/AudioBus");
const AudioData = require("../../../src/impl/core/AudioData");
const { DISCRETE, SPEAKERS } = require("../../../src/constants/ChannelInterpretation");

describe("impl/core/AudioBus", () => {
  it("constructor(numberOfChannels, length, sampleRate)", () => {
    const bus = new AudioBus(2, 128, 44100);

    assert(bus instanceof AudioBus);
  });

  describe("attributes", () => {
    it(".channelInterpretation=", () => {
      const bus = new AudioBus(2, 128, 44100);

      assert(bus.getChannelInterpretation() === DISCRETE);

      bus.setChannelInterpretation(SPEAKERS);
      assert(bus.getChannelInterpretation() === SPEAKERS);
    });

    it(".numberOfChannels=", () => {
      const bus = new AudioBus(2, 128, 44100);

      assert(bus.getNumberOfChannels() === 2);

      bus.setNumberOfChannels(4);
      assert(bus.getNumberOfChannels() === 4);
    });

    it(".length", () => {
      const bus = new AudioBus(2, 128, 44100);

      assert(bus.getLength() === 128);
    });

    it(".sampleRate", () => {
      const bus = new AudioBus(2, 128, 44100);

      assert(bus.getSampleRate() === 44100);
    });

    it(".audioData", () => {
      const bus = new AudioBus(2, 128, 44100);
      const data = bus.audioData;

      assert(data instanceof AudioData);
    });
  });

  describe("methods", () => {
    it(".getChannelData()", () => {
      const bus = new AudioBus(2, 128, 44100);
      const channelData = bus.getChannelData();

      assert(bus.isSilent === true);
      assert(channelData === bus.getChannelData());
    });

    it(".getMutableData()", () => {
      const bus = new AudioBus(2, 128, 44100);
      const mutableData = bus.getMutableData();

      assert(bus.isSilent === false);
      assert(mutableData === bus.getChannelData());
    });

    it(".zeros()", () => {
      const bus = new AudioBus(2, 128, 44100);

      bus.getMutableData()[0].set(np.random_sample(128));
      bus.getMutableData()[1].set(np.random_sample(128));

      bus.zeros();

      assert.deepEqual(bus.getChannelData()[0], np.zeros(128));
      assert.deepEqual(bus.getChannelData()[1], np.zeros(128));
      assert(bus.isSilent === true);
    });

    it(".copyFrom(bus)", () => {
      const bus1 = new AudioBus(1, 128, 44100);
      const bus2 = new AudioBus(1, 128, 44100)
      const noise1 = np.random_sample(128);
      const noise2 = np.random_sample(128);

      bus1.getMutableData()[0].set(noise1);
      bus2.getMutableData()[0].set(noise2);

      bus2.copyFrom(bus1);
      assert.deepEqual(bus2.getChannelData()[0], noise1);
      assert(bus2.isSilent === false);
    });

    it(".copyFrom(silentBus)", () => {
      const bus1 = new AudioBus(1, 128, 44100);
      const bus2 = new AudioBus(1, 128, 44100)
      const noise1 = np.random_sample(128);
      const noise2 = np.random_sample(128);

      bus1.getMutableData()[0].set(noise1);
      bus2.getMutableData()[0].set(noise2);

      bus1.zeros();
      bus2.copyFrom(bus1);
      assert.deepEqual(bus2.getChannelData()[0], np.zeros(128));
      assert(bus2.isSilent, true);
    });

    it(".copyFromWithOffset(bus, offset)", () => {
      const bus1 = new AudioBus(1, 128, 44100);
      const bus2 = new AudioBus(1, 128, 44100)
      const bus3 = new AudioBus(1, 256, 44100);
      const noise1 = np.random_sample(128);
      const noise2 = np.random_sample(128);
      const noise3 = np.random_sample(256);

      bus1.getMutableData()[0].set(noise1);
      bus2.getMutableData()[0].set(noise2);
      bus3.getMutableData()[0].set(noise3);

      bus3.copyFromWithOffset(bus1, 0);
      bus3.copyFromWithOffset(bus2, 128);
      assert.deepEqual(bus3.getChannelData()[0].subarray(0, 128), noise1);
      assert.deepEqual(bus3.getChannelData()[0].subarray(128, 256), noise2);
      assert(bus3.isSilent === false);
    });
  });
});
