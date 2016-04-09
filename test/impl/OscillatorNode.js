"use strict";

const assert = require("power-assert");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const OscillatorNode = require("../../src/impl/OscillatorNode");
const AudioNode = require("../../src/impl/AudioNode");
const AudioSourceNode = require("../../src/impl/AudioSourceNode");
const PeriodicWave = require("../../src/impl/PeriodicWave");
const AudioParam = require("../../src/impl/AudioParam");

const context = new AudioContext({ sampleRate: 8000, processingSizeInFrames: 16 });
const wave = new PeriodicWave(context, { real: [ 0, 0 ], imag: [ 0, 1 ] });
const testSpec = {};

testSpec.numberOfInputs = {
  testCase: [ { expected: 0 } ]
};

testSpec.numberOfOutputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.type = {
  testCase: [
    { value: "sine", expected: "sine" },
    { value: "sawtooth", expected: "sawtooth" },
    { value: "triangle", expected: "triangle" },
    { value: "square", expected: "square" },
    { value: "custom", expected: "square" }
  ]
};

testSpec.frequency = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.detune = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.periodicWave = {
  testCase: [
    { value: wave, expected: wave }
  ]
};

describe("OscillatorNode", () => {
  describe("inherits", () => {
    it("OscillatorNode < AudioSourceNode", () => {
      const node = new OscillatorNode(context);

      assert(node instanceof OscillatorNode);
      assert(node instanceof AudioSourceNode);
    });
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: OscillatorNode,
      testSpec
    });
  });

  describe("channel configuration", () => {
    it("should be mono output", () => {
      const node1 = new OscillatorNode(context);
      const node2 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });

      node1.connect(node2);

      assert(node2.getInput(0).getNumberOfChannels() === 1);
    });
  });
});
