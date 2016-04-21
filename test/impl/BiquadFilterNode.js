"use strict";

const assert = require("power-assert");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const BiquadFilterNode = require("../../src/impl/BiquadFilterNode");
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

testSpec.frequency = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.detune = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.Q = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.gain = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.type = {
  defaultValue: "lowpass",
  testCase: [
    { value: "lowpass", expected: "lowpass" },
    { value: "highpass", expected: "highpass" },
    { value: "bandpass", expected: "bandpass" },
    { value: "lowshelf", expected: "lowshelf" },
    { value: "highshelf", expected: "highshelf" },
    { value: "peaking", expected: "peaking" },
    { value: "notch", expected: "notch" },
    { value: "allpass", expected: "allpass" },
    { value: "unknown", expected: "allpass" }
  ]
};

describe("BiquadFilterNode", () => {
  describe("inherits", () => {
    it("BiquadFilterNode < AudioNode", () => {
      const node = new BiquadFilterNode(context);

      assert(node instanceof BiquadFilterNode);
      assert(node instanceof AudioNode);
    });
  });

  describe("basci attributes", () => {
    attrTester.makeTests(context, {
      class: BiquadFilterNode,
      testSpec
    });
  });

  describe("channel configuration", () => {
    it("should synchronize with the input", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new BiquadFilterNode(context);
      const node3 = new AudioNode(context, { inputs: [ 1 ] });

      node1.getOutput(0).enable();
      node2.getOutput(0).enable();
      node2.connect(node3);

      assert(node2.inputs[0].getNumberOfChannels() === 1);
      assert(node3.inputs[0].getNumberOfChannels() === 1);

      node1.connect(node2);

      assert(node2.inputs[0].getNumberOfChannels() === 4);
      assert(node3.inputs[0].getNumberOfChannels() === 4);
    });
  });

  describe.skip("response data", () => {});
});
