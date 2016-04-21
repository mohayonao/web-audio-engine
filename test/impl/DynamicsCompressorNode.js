"use strict";

const assert = require("power-assert");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const DynamicsCompressorNode = require("../../src/impl/DynamicsCompressorNode");
const AudioParam = require("../../src/impl/AudioParam");
const AudioNode = require("../../src/impl/AudioNode");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
const testSpec = {};

testSpec.numberOfInputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.numberOfOutputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.threshold = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.knee = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.ratio = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.attack = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.release = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

describe("DynamicsCompressorNode", () => {
  describe("inherits", () => {
    it("DynamicsCompressorNode < AudioNode", () => {
      const node = new DynamicsCompressorNode(context);

      assert(node instanceof DynamicsCompressorNode);
      assert(node instanceof AudioNode);
    });
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: DynamicsCompressorNode,
      testSpec
    });
  });

  describe("channel configuration", () => {
    it("should synchronize with the input, but clamped by 2", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new DynamicsCompressorNode(context);
      const node3 = new AudioNode(context, { inputs: [ 1 ] });

      node1.getOutput(0).enable();
      node2.getOutput(0).enable();
      node2.connect(node3);

      assert(node2.inputs[0].getNumberOfChannels() === 1);
      assert(node3.inputs[0].getNumberOfChannels() === 2);

      node1.connect(node2);

      assert(node2.inputs[0].getNumberOfChannels() === 2);
      assert(node3.inputs[0].getNumberOfChannels() === 2);
    });
  });
});
