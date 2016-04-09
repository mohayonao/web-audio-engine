"use strict";

const assert = require("power-assert");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const ScriptProcessorNode = require("../../src/impl/ScriptProcessorNode");
const AudioNode = require("../../src/impl/AudioNode");

const context = new AudioContext({ sampleRate: 8000, processingSizeInFrames: 16 });
const testSpec = {};

testSpec.numberOfInputs = {
  testCase: [ { expected: 1 } ]
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

testSpec.bufferSize = {
  testCase: [ { expected: 256 } ]
};

describe("ScriptProcessorNode", () => {
  describe("inherits", () => {
    it("ScriptProcessorNode < AudioNode", () => {
      const node = new ScriptProcessorNode(context, { bufferSize: 256, numberOfInputChannels: 1, numberOfOutputChannels: 2 });

      assert(node instanceof ScriptProcessorNode);
      assert(node instanceof AudioNode);
    });
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: ScriptProcessorNode,
      create: context => new ScriptProcessorNode(context, { bufferSize: 256, numberOfInputChannels: 1, numberOfOutputChannels: 2 }),
      testSpec
    });
  });

  describe("channel configuration", () => {
    it("should be kept by the initial configuration", () => {
      const node1 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 4 ] });
      const node2 = new ScriptProcessorNode(context, { bufferSize: 256, numberOfInputChannels: 1, numberOfOutputChannels: 2 });
      const node3 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });

      node1.getOutput(0).enable();
      node2.getOutput(0).enable();
      node2.connect(node3);

      assert(node2.getInput(0).getNumberOfChannels() === 1);
      assert(node3.getInput(0).getNumberOfChannels() === 2);

      node1.connect(node2);

      assert(node2.getInput(0).getNumberOfChannels() === 1);
      assert(node3.getInput(0).getNumberOfChannels() === 2);
    });
  });
});
