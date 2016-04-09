"use strict";

const assert = require("power-assert");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const GainNode = require("../../src/impl/GainNode");
const AudioParam = require("../../src/impl/AudioParam");
const AudioNode = require("../../src/impl/AudioNode");

const context = new AudioContext({ sampleRate: 8000, processingSizeInFrames: 16 });
const testSpec = {};

testSpec.numberOfInputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.numberOfOutputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.gain = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

describe("GainNode", () => {
  describe("inherits", () => {
    it("GainNode < AudioNode", () => {
      const node = new GainNode(context);

      assert(node instanceof GainNode);
      assert(node instanceof AudioNode);
    });
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: GainNode,
      testSpec
    });
  });

  describe("channel configuration", () => {
    it("should synchronize with the input", () => {
      const node1 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 4 ] });
      const node2 = new GainNode(context);
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
