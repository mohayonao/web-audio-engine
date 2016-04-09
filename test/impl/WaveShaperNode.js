"use strict";

const assert = require("power-assert");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const WaveShaperNode = require("../../src/impl/WaveShaperNode");
const AudioNode = require("../../src/impl/AudioNode");

const context = new AudioContext({ sampleRate: 8000, processingSizeInFrames: 16 });
const curve = new Float32Array(128);
const testSpec = {};

testSpec.numberOfInputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.numberOfOutputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.curve = {
  defaultValue: null,
  testCase: [
    { value: curve, expected: curve },
    { value: null, expected: null }
  ]
};

testSpec.oversample = {
  defaultValue: "none",
  testCase: [
    { value: "4x", expected: "4x" },
    { value: "2x", expected: "2x" },
    { value: "none", expected: "none" },
    { value: "unknown", expected: "none" }
  ]
};

describe("WaveShaperNode", () => {
  describe("inherits", () => {
    it("WaveShaperNode < AudioNode", () => {
      const node = new WaveShaperNode(context);

      assert(node instanceof WaveShaperNode);
      assert(node instanceof AudioNode);
    });
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: WaveShaperNode,
      testSpec
    });
  });

  describe("channel configuration", () => {
    it("should synchronize with the input", () => {
      const node1 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 4 ] });
      const node2 = new WaveShaperNode(context);
      const node3 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });

      node1.getOutput(0).enable();
      node2.getOutput(0).enable();
      node2.connect(node3);

      assert(node2.getInput(0).getNumberOfChannels() === 1);
      assert(node3.getInput(0).getNumberOfChannels() === 1);

      node1.connect(node2);

      assert(node2.getInput(0).getNumberOfChannels() === 4);
      assert(node3.getInput(0).getNumberOfChannels() === 4);
    });
  });
});
