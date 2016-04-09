"use strict";

const assert = require("power-assert");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const ChannelSplitterNode = require("../../src/impl/ChannelSplitterNode");
const AudioNode = require("../../src/impl/AudioNode");

const context = new AudioContext({ sampleRate: 8000, processingSizeInFrames: 16 });
const testSpec = {};

testSpec.numberOfInputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.numberOfOutputs = {
  testCase: [ { expected: 6 } ]
};

describe("ChannelSplitterNode", () => {
  describe("inherits", () => {
    it("ChannelSplitterNode < AudioNode", () => {
      const node = new ChannelSplitterNode(context, { numberOfOutputs: 6 });

      assert(node instanceof ChannelSplitterNode);
      assert(node instanceof AudioNode);
    });
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: ChannelSplitterNode,
      create: context => new ChannelSplitterNode(context, { numberOfOutputs: 6 }),
      testSpec
    });
  });

  describe("channel configuration", () => {
    it("should be kept by the initial configuration", () => {
      const node1 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 4 ] });
      const node2 = new ChannelSplitterNode(context, { numberOfOutputs: 6 });
      const node3 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });

      node1.getOutput(0).enable();
      node2.getOutput(0).enable();
      node2.connect(node3);

      assert(node2.getInput(0).getNumberOfChannels() === 1);
      assert(node3.getInput(0).getNumberOfChannels() === 1);

      node1.connect(node2);

      assert(node2.getInput(0).getNumberOfChannels() === 4);
      assert(node3.getInput(0).getNumberOfChannels() === 1);
    });
  });
});
