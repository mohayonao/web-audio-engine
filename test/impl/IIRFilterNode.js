"use strict";

require("run-with-mocha");

const assert = require("power-assert");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const IIRFilterNode = require("../../src/impl/IIRFilterNode");
const AudioNode = require("../../src/impl/AudioNode");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
const feedforward = new Float32Array(8);
const feedback = new Float32Array(8);
const testSpec = {};

testSpec.numberOfInputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.numberOfOutputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.feedforward = {
  testCase: [ { expected: feedforward } ]
};

testSpec.feedback = {
  testCase: [ { expected: feedback } ]
};

describe("IIRFilterNode", () => {
  describe("inherits", () => {
    it("IIRFilterNode < AudioNode", () => {
      const node = new IIRFilterNode(context, { feedforward, feedback });

      assert(node instanceof IIRFilterNode);
      assert(node instanceof AudioNode);
    });
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: IIRFilterNode,
      create: context => new IIRFilterNode(context, { feedforward, feedback }),
      testSpec
    });
  });

  describe("channel configuration", () => {
    it("should synchronize with the input", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new IIRFilterNode(context, { feedforward, feedback });
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

  describe.skip("response data", () => {});
});
