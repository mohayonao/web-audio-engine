"use strict";

const assert = require("power-assert");
const deepEqual = require("deep-equal");
const np = require("../helpers/np");
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
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new WaveShaperNode(context);
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

  describe("processing", () => {
    it("works", () => {
      const node1 = new AudioNode(context, { outputs: [ 2 ] });
      const node2 = new WaveShaperNode(context);
      const curve = new Float32Array([ 1, 0, 1 ]);
      const noise1 = np.random_sample(16).map(x => (x - 0.5) * 2);
      const noise2 = np.random_sample(16).map(x => (x - 0.5) * 2);

      context.resume();
      node1.connect(node2);
      node2.connect(context.getDestination());
      node1.enableOutputsIfNecessary();
      node1.getOutput(0).getAudioBus().getMutableData()[0].set(noise1);
      node1.getOutput(0).getAudioBus().getMutableData()[1].set(noise2);

      node2.setCurve(curve);

      context.process();

      const actual = node2.getOutput(0).getAudioBus().getChannelData();
      const expected = [ noise1.map(Math.abs), noise2.map(Math.abs) ];

      assert(deepEqual(actual[0], expected[0]));
      assert(deepEqual(actual[1], expected[1]));
    });

    it("works - without curve", () => {
      const node1 = new AudioNode(context, { outputs: [ 2 ] });
      const node2 = new WaveShaperNode(context);
      const noise1 = np.random_sample(16).map(x => (x - 0.5) * 2);
      const noise2 = np.random_sample(16).map(x => (x - 0.5) * 2);

      context.resume();
      node1.connect(node2);
      node2.connect(context.getDestination());
      node1.enableOutputsIfNecessary();
      node1.getOutput(0).getAudioBus().getMutableData()[0].set(noise1);
      node1.getOutput(0).getAudioBus().getMutableData()[1].set(noise2);

      context.process();

      const actual = node2.getOutput(0).getAudioBus().getChannelData();
      const expected = [ noise1, noise2 ];

      assert(deepEqual(actual[0], expected[0]));
      assert(deepEqual(actual[1], expected[1]));
    });
  });
});
