"use strict";

const assert = require("power-assert");
const deepEqual = require("deep-equal");
const np = require("../helpers/np");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const ChannelMergerNode = require("../../src/impl/ChannelMergerNode");
const AudioNode = require("../../src/impl/AudioNode");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
const testSpec = {};

testSpec.numberOfInputs = {
  testCase: [ { expected: 6 } ]
};

testSpec.numberOfOutputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.channelCount = {
  defaultValue: 1,
  testCase: [
    { value: 1, expected: 1 },
    { value: 2, expected: 1 }
  ]
};

testSpec.channelCountMode = {
  defaultValue: "explicit",
  testCase: [
    { value: "max", expected: "explicit" },
    { value: "clamped-max", expected: "explicit" }
  ]
};

describe("ChannelMergerNode", () => {
  describe("inherits", () => {
    it("ChannelMergerNode < AudioNode", () => {
      const node = new ChannelMergerNode(context, { numberOfInputs: 0 });

      assert(node instanceof ChannelMergerNode);
      assert(node instanceof AudioNode);
    });
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: ChannelMergerNode,
      create: context => new ChannelMergerNode(context, { numberOfInputs: 6 }),
      testSpec
    });

    it(".channelInterpretation=", () => {
      const node = new ChannelMergerNode(context, { numberOfInputs: 2 });

      assert(node.getChannelInterpretation() === "speakers");
      assert(node.getInput(0).getChannelInterpretation() === "speakers");
      assert(node.getInput(1).getChannelInterpretation() === "speakers");

      node.setChannelInterpretation("discrete");

      assert(node.getChannelInterpretation() === "discrete");
      assert(node.getInput(0).getChannelInterpretation() === "discrete");
      assert(node.getInput(1).getChannelInterpretation() === "discrete");
    });
  });

  describe("channel configuration", () => {
    it("should be kept by the initial configuration", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new ChannelMergerNode(context, { numberOfInputs: 6 });
      const node3 = new AudioNode(context, { inputs: [ 1 ] });

      node1.getOutput(0).enable();
      node2.getOutput(0).enable();
      node2.connect(node3);

      assert(node2.getInput(0).getNumberOfChannels() === 1);
      assert(node3.getInput(0).getNumberOfChannels() === 6);

      node1.connect(node2);

      assert(node2.getInput(0).getNumberOfChannels() === 1);
      assert(node3.getInput(0).getNumberOfChannels() === 6);
    });
  });

  describe("enable/disable", () => {
    it("always enabled", () => {
      const node1 = new AudioNode(context, { outputs: [ 1 ] });
      const node2 = new AudioNode(context, { outputs: [ 1 ] });
      const node3 = new ChannelMergerNode(context, { numberOfInputs: 4 });

      node1.connect(node3, 0, 0);
      node2.connect(node3, 0, 1);

      assert(node3.isEnabled() === false);

      node1.enableOutputsIfNecessary();
      assert(node3.isEnabled() === true);

      node2.enableOutputsIfNecessary();
      assert(node3.isEnabled() === true);

      node1.disableOutputsIfNecessary();
      assert(node3.isEnabled() === true);

      node2.disableOutputsIfNecessary();
      assert(node3.isEnabled() === false);
    });
  });

  describe("processing", () => {
    it("works", () => {
      const node1 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });
      const node2 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });
      const node3 = new ChannelMergerNode(context, { numberOfInputs: 4 });
      const noise1 = np.random_sample(16);
      const noise2 = np.random_sample(16);

      context.resume();
      node1.connect(node3, 0, 0);
      node2.connect(node3, 0, 1);
      node3.connect(context.getDestination());
      node1.enableOutputsIfNecessary();
      node2.enableOutputsIfNecessary();
      node1.getOutput(0).getAudioBus().getMutableData()[0].set(noise1);
      node2.getOutput(0).getAudioBus().getMutableData()[0].set(noise2);

      context.process();

      const actual = node3.getOutput(0).getAudioBus().getChannelData();
      const expected = [ noise1, noise2, np.zeros(16), np.zeros(16) ];

      assert(deepEqual(actual, expected));
    });
  });
});
