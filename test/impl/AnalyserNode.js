"use strict";

const assert = require("power-assert");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const AnalyserNode = require("../../src/impl/AnalyserNode");
const AudioNode = require("../../src/impl/AudioNode");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
const testSpec = {};

testSpec.numberOfInputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.numberOfOutputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.fftSize = {
  defaultValue: 2048,
  testCase: [
    { value: 16, expected: 32 },
    { value: 1024, expected: 1024 },
    { value: 2000, expected: 2048 },
    { value: 65536, expected: 32768 }
  ]
};

testSpec.frequencyBinCount = {
  testCase: [
    { expected: 1024 }
  ]
};

testSpec.minDecibels = {
  defaultValue: -100,
  testCase: [
    { value:  -40, expected:  -40 },
    { value: -120, expected: -120 },
    { value:  -20, expected: -120, message: "should be ignored if less 'maxDecibels'" },
    { value: -Infinity, expected: -120, message: "should be a finite number" }
  ]
};

testSpec.maxDecibels = {
  defaultValue: -30,
  testCase: [
    { value: -10, expected: -10 },
    { value: -90, expected: -90 },
    { value: -120, expected: -90, message: "should be ignored if greater 'minDecibels'" },
    { value: Infinity, expected: -90, message: "should be a finite number" }
  ]
};

testSpec.smoothingTimeConstant = {
  defaultValue: 0.8,
  testCase: [
    { value: 0.4, expected: 0.4 },
    { value: -0.1, expected: 0.0 },
    { value: +1.2, expected: 1.0 }
  ]
};

describe("AnalyserNode", () => {
  describe("inherits", () => {
    it("AnalyserNode < AudioNode", () => {
      const node = new AnalyserNode(context);

      assert(node instanceof AudioNode);
      assert(node instanceof AnalyserNode);
    });
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: AnalyserNode,
      testSpec
    });
  });

  describe("channel configuration", () => {
    it("should synchronize with the input", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new AnalyserNode(context);
      const node3 = new AudioNode(context, { inputs: [ 1 ] });

      node1.outputs[0].enable();
      node2.outputs[0].enable();
      node2.connect(node3);

      assert(node2.inputs[0].getNumberOfChannels() === 1);
      assert(node3.inputs[0].getNumberOfChannels() === 1);

      node1.connect(node2);

      assert(node2.inputs[0].getNumberOfChannels() === 4);
      assert(node3.inputs[0].getNumberOfChannels() === 4);
    });
  });

  describe.skip("get frequency data", () => {});
  describe.skip("get time domain data", () => {});
});
