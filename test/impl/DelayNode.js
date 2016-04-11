"use strict";

const assert = require("power-assert");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const DelayNode = require("../../src/impl/DelayNode");
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

testSpec.delayTime = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.maxDelayTime = {
  testCase: [ { expected: 1 } ]
};

describe("DelayNode", () => {
  describe("inherits", () => {
    it("DelayNode < AudioNode", () => {
      const node = new DelayNode(context, { maxDelayTime: 1 });

      assert(node instanceof DelayNode);
      assert(node instanceof AudioNode);
    });
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: DelayNode,
      create: context => new DelayNode(context, { maxDelayTime: 1 }),
      testSpec
    });
  });

  describe("channel configuration", () => {
    it("should synchronize with the input", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new DelayNode(context, { maxDelayTime: 1 });
      const node3 = new AudioNode(context, { inputs: [ 1 ] });

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
