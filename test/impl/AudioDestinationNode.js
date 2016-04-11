"use strict";

const assert = require("power-assert");
const deepEqual = require("deep-equal");
const np = require("../helpers/np");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const AudioDestinationNode = require("../../src/impl/AudioDestinationNode");
const AudioNode = require("../../src/impl/AudioNode");

const context = new AudioContext({ sampleRate: 8000, processingSizeInFrames: 16 });
const testSpec = {};

testSpec.numberOfInputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.numberOfOutputs = {
  testCase: [ { expected: 0 } ]
};

testSpec.maxChannelCount = {
  testCase: [ { expected: 2 } ]
};

testSpec.channelCount = {
  testCase: [
    { value: 0, expected: 1 },
    { value: 1, expected: 1 },
    { value: 2, expected: 2 },
    { value: 4, expected: 2 }
  ]
};

describe("AudioDestinationNode", () => {
  describe("inherits", () => {
    it("AudioDestinationNode < AudioNode", () => {
      const node = new AudioDestinationNode(context, { numberOfChannels: 2 });

      assert(node instanceof AudioDestinationNode);
      assert(node instanceof AudioNode);
    });
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: AudioDestinationNode,
      create: context => new AudioDestinationNode(context, { numberOfChannels: 2 }),
      testSpec
    });
  });

  describe("channel configuration", () => {
    it("should synchronize with the input, but clamped by max channel count", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new AudioDestinationNode(context, { numberOfChannels: 2 });

      node1.getOutput(0).enable();
      assert(node2.getInput(0).getNumberOfChannels() === 2);

      node1.connect(node2);

      assert(node2.getInput(0).getNumberOfChannels() === 2);
    });
  });

  describe("processing", () => {
    it("silent", () => {
      const node1 = new AudioNode(context, { outputs: [ 2 ] });
      const node2 = new AudioDestinationNode(context, { numberOfChannels: 2 });
      const outputBus = node2.getOutput(0).getAudioBus();

      node1.getOutput(0).getAudioBus().zeros();
      node1.enableOutputsIfNecessary();
      node1.connect(node2);

      outputBus.getMutableData();

      node2.processIfNecessary({ currentTime: 0, nextCurrentTime: 16 / 8000 });

      assert(outputBus.isSilent() === true);
      assert(deepEqual(outputBus.getChannelData()[0], np.zeros(16)));
      assert(deepEqual(outputBus.getChannelData()[1], np.zeros(16)));
    });
    it("noise", () => {
      const node1 = new AudioNode(context, { outputs: [ 2 ] });
      const node2 = new AudioDestinationNode(context, { numberOfChannels: 2 });
      const noise1 = np.random_sample(16);
      const noise2 = np.random_sample(16);
      const outputBus = node2.getOutput(0).getAudioBus();

      node1.getOutput(0).getAudioBus().getMutableData()[0].set(noise1);
      node1.getOutput(0).getAudioBus().getMutableData()[1].set(noise2);
      node1.enableOutputsIfNecessary();
      node1.connect(node2);

      node2.processIfNecessary({ currentTime: 0, nextCurrentTime: 16 / 8000 });

      assert(outputBus.isSilent() === false);
      assert(deepEqual(outputBus.getChannelData()[0], noise1));
      assert(deepEqual(outputBus.getChannelData()[1], noise2));
    });
  });
});
