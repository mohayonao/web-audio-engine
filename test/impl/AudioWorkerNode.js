"use strict";

require("run-with-mocha");

const assert = require("power-assert");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const AudioWorkerNode = require("../../src/impl/AudioWorkerNode");
const AudioNode = require("../../src/impl/AudioNode");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
const worker = {};
const testSpec = {};

testSpec.numberOfInputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.numberOfOutputs = {
  testCase: [ { expected: 2 } ]
};

testSpec.channelCount = {
  defaultValue: 4,
  testCase: [
    { value: 1, expected: 4 },
    { value: 2, expected: 4 },
    { value: 4, expected: 4 }
  ]
};

testSpec.channelCountMode = {
  defaultValue: "explicit",
  testCase: [
    { value: "max", expected: "explicit" },
    { value: "clamped-max", expected: "explicit" }
  ]
};

testSpec.worker = {
  testCase: [ { expected: worker } ]
};

describe("AudioWorkerNode", () => {
  describe("inherits", () => {
    it("AudioWorkerNode < AudioNode", () => {
      const node = new AudioWorkerNode(context, { worker, numberOfInputs: 4, numberOfOutputs: [ 1, 2 ] });

      assert(node instanceof AudioWorkerNode);
      assert(node instanceof AudioNode);
    });
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: AudioWorkerNode,
      create: context => new AudioWorkerNode(context, { worker, numberOfInputs: 4, numberOfOutputs: [ 1, 2 ] }),
      testSpec
    });

    it(".channelInterpretation=", () => {
      const node = new AudioWorkerNode(context, { worker, numberOfInputs: [ 1, 1 ], numberOfOutputs: [ 1, 2 ] });

      assert(node.getChannelInterpretation() === "speakers");
      assert(node.inputs[0].getChannelInterpretation() === "speakers");
      assert(node.inputs[1].getChannelInterpretation() === "speakers");

      node.setChannelInterpretation("discrete");

      assert(node.getChannelInterpretation() === "discrete");
      assert(node.inputs[0].getChannelInterpretation() === "discrete");
      assert(node.inputs[1].getChannelInterpretation() === "discrete");
    });
  });

  describe("channel configuration", () => {
    it("should be kept by the initial configuration", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new AudioWorkerNode(context, { worker, numberOfInputs: 4, numberOfOutputs: [ 1, 2 ] });
      const node3 = new AudioNode(context, { inputs: [ 1 ] });
      const node4 = new AudioNode(context, { inputs: [ 1 ] });

      node1.outputs[0].enable();
      node2.outputs[0].enable();
      node2.connect(node3, 0);
      node2.connect(node4, 1);

      assert(node2.inputs[0].getNumberOfChannels() === 4);
      assert(node3.inputs[0].getNumberOfChannels() === 1);
      assert(node4.inputs[0].getNumberOfChannels() === 2);

      node1.connect(node2);

      assert(node2.inputs[0].getNumberOfChannels() === 4);
      assert(node3.inputs[0].getNumberOfChannels() === 1);
      assert(node4.inputs[0].getNumberOfChannels() === 2);
    });
  });

  describe("enable/disable", () => {
    it("always enabled", () => {
      const node = new AudioWorkerNode(context, { worker, numberOfInputs: 4, numberOfOutputs: [ 1, 2 ] });

      assert(node.isEnabled() === true);

      node.disableOutputsIfNecessary();

      assert(node.isEnabled() === true);
    });
  });
});
