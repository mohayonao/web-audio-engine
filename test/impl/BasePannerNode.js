"use strict";

const assert = require("power-assert");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const BasePannerNode = require("../../src/impl/BasePannerNode");
const AudioNode = require("../../src/impl/AudioNode");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
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
    { value: "explicit", expected: "explicit" }
  ]
};

testSpec.panningModel = {
  defaultValue: "equalpower",
  testCase: [
    { value: "HRTF", expected: "HRTF" },
    { value: "equalpower", expected: "equalpower" },
    { value: "unknown", expected: "equalpower" }
  ]
};

testSpec.distanceModel = {
  defaultValue: "inverse",
  testCase: [
    { value: "linear", expected: "linear" },
    { value: "exponential", expected: "exponential" },
    { value: "inverse", expected: "inverse" },
    { value: "unknwon", expected: "inverse" }
  ]
};

testSpec.refDistance = {
  defaultValue: 1,
  testCase: [
    { value: 2, expected: 2 }
  ]
};

testSpec.maxDistance = {
  defaultValue: 10000,
  testCase: [
    { value: 11000, expected: 11000 }
  ]
};

testSpec.rolloffFactor = {
  defaultValue: 1,
  testCase: [
    { value: 0.8, expected: 0.8 }
  ]
};

testSpec.coneInnerAngle = {
  defaultValue: 360,
  testCase: [
    { value: 180, expected: 180 }
  ]
};

testSpec.coneOuterAngle = {
  defaultValue: 360,
  testCase: [
    { value: 180, expected: 180 }
  ]
};

testSpec.coneOuterGain = {
  defaultValue: 0,
  testCase: [
    { value: 0.2, expected: 0.2 }
  ]
};

describe("BasePannerNode", () => {
  describe("inherits", () => {
    it("BasePannerNode < AudioNode", () => {
      const node = new BasePannerNode(context);

      assert(node instanceof BasePannerNode);
      assert(node instanceof AudioNode);
    });
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: BasePannerNode,
      testSpec
    });
  });

  describe("channel configuration", () => {
    it("should be always 2ch", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new BasePannerNode(context);
      const node3 = new AudioNode(context, { inputs: [ 1 ] });

      node1.getOutput(0).enable();
      node2.getOutput(0).enable();
      node2.connect(node3);

      assert(node2.getInput(0).getNumberOfChannels() === 1);
      assert(node3.getInput(0).getNumberOfChannels() === 2);

      node1.connect(node2);

      assert(node2.getInput(0).getNumberOfChannels() === 2);
      assert(node3.getInput(0).getNumberOfChannels() === 2);
    });
  });
});
