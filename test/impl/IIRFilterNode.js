"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../src/impl/AudioContext");
const IIRFilterNode = require("../../src/impl/IIRFilterNode");
const AudioNode = require("../../src/impl/AudioNode");

const feedforward = new Float32Array(8);
const feedback = new Float32Array(8);

describe("impl/IIRFilterNode", () => {
  let context;

  beforeEach(() => {
    context = new AudioContext({ sampleRate: 8000, blockSize: 32 });
  });

  it("constructor", () => {
    const node = new IIRFilterNode(context, { feedforward, feedback });

    assert(node instanceof IIRFilterNode);
    assert(node instanceof AudioNode);
  });

  describe("attributes", () => {
    it(".numberOfInputs", () => {
      const node = new IIRFilterNode(context, { feedforward, feedback });

      assert(node.getNumberOfInputs() === 1);
    });

    it(".numberOfOutputs", () => {
      const node = new IIRFilterNode(context, { feedforward, feedback });

      assert(node.getNumberOfOutputs() === 1);
    });

    it(".feedforward", () => {
      const node = new IIRFilterNode(context, { feedforward, feedback });

      assert(node.getFeedforward() === feedforward);
    });

    it(".feedback", () => {
      const node = new IIRFilterNode(context, { feedforward, feedback });

      assert(node.getFeedback() === feedback);
    });
  });

  describe("channel configuration", () => {
    it("should synchronize with the input", () => {
      const node1 = new AudioNode(context, {}, { outputs: [ 4 ] });
      const node2 = new IIRFilterNode(context, { feedforward, feedback });
      const node3 = new AudioNode(context, {}, { inputs: [ 1 ] });

      node1.outputs[0].enable();
      node2.outputs[0].enable();

      // +-------+
      // | node1 |
      // +--(4)--+
      //
      // +--(1)--+
      // | node2 | IIRFilterNode
      // +--(1)--+
      //     |
      // +--(1)--+
      // | node3 |
      // +-------+
      node2.connect(node3);
      assert(node2.inputs[0].getNumberOfChannels() === 1);
      assert(node3.inputs[0].getNumberOfChannels() === 1);

      // +-------+
      // | node1 |
      // +--(4)--+
      //     |
      // +--(4)--+
      // | node2 | IIRFilterNode
      // +--(4)--+
      //     |
      // +--(4)--+
      // | node3 |
      // +-------+
      node1.connect(node2);
      assert(node2.inputs[0].getNumberOfChannels() === 4);
      assert(node3.inputs[0].getNumberOfChannels() === 4);
    });
  });

  describe("response data", () => {
    it.skip("works", () => {});
  });
});
