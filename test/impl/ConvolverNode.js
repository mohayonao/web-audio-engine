"use strict";

const assert = require("power-assert");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const ConvolverNode = require("../../src/impl/ConvolverNode");
const AudioBuffer = require("../../src/impl/AudioBuffer");
const AudioNode = require("../../src/impl/AudioNode");

const context = new AudioContext({ sampleRate: 8000, processingSizeInFrames: 16 });
const buffer = new AudioBuffer(2, 32, context.sampleRate);
const testSpec = {};

testSpec.numberOfInputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.numberOfOutputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.channelCount = {
  defaultValue: 2,
  testCase: [
    { value: 1, expected: 1 },
    { value: 2, expected: 2 },
    { value: 4, expected: 2 }
  ]
};

testSpec.channelCountMode = {
  defaultValue: "clamped-max",
  testCase: [
    { value: "max", expected: "clamped-max" },
    { value: "clamped-max", expected: "clamped-max" },
    { value: "explicit", expected: "explicit" },
    { value: "unknown", expected: "explicit" }
  ]
};

testSpec.buffer = {
  defaultValue: null,
  testCase: [
    { value: buffer, expected: buffer }
  ]
};

testSpec.normalize = {
  defaultValue: true,
  testCase: [
    { value: true, expected: true },
    { value: null, expected: false }
  ]
};

describe("ConvolverNode", () => {
  describe("inherits", () => {
    it("ConvolverNode < AudioNode", () => {
      const node = new ConvolverNode(context);

      assert(node instanceof ConvolverNode);
      assert(node instanceof AudioNode);
    });
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: ConvolverNode,
      testSpec
    });
  });

  describe("channel configuration", () => {
    it("should synchronize with the input, but clamped by 2", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new ConvolverNode(context);
      const node3 = new AudioNode(context, { inputs: [ 1 ] });

      node1.getOutput(0).enable();
      node2.getOutput(0).enable();
      node2.connect(node3);

      assert(node2.getInput(0).getNumberOfChannels() === 1);
      assert(node3.getInput(0).getNumberOfChannels() === 1);

      node1.connect(node2);

      assert(node2.getInput(0).getNumberOfChannels() === 2);
      assert(node3.getInput(0).getNumberOfChannels() === 2);
    });
  });
});
