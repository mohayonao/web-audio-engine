"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../src/impl/AudioContext");
const DynamicsCompressorNode = require("../../src/impl/DynamicsCompressorNode");
const AudioParam = require("../../src/impl/AudioParam");
const AudioNode = require("../../src/impl/AudioNode");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });

describe("impl/DynamicsCompressorNode", () => {
  it("constructor", () => {
    const node = new DynamicsCompressorNode(context);

    assert(node instanceof DynamicsCompressorNode);
    assert(node instanceof AudioNode);
  });

  describe("attributes", () => {
    it(".numberOfInputs", () => {
      const node = new DynamicsCompressorNode(context);

      assert(node.getNumberOfInputs() === 1);
    });

    it(".numberOfOutputs", () => {
      const node = new DynamicsCompressorNode(context);

      assert(node.getNumberOfOutputs() === 1);
    });

    it(".threshold", () => {
      const node = new DynamicsCompressorNode(context);

      assert(node.getThreshold() instanceof AudioParam);
      assert(node.getThreshold().getValue() === -24);
    });

    it(".knee", () => {
      const node = new DynamicsCompressorNode(context);

      assert(node.getKnee() instanceof AudioParam);
      assert(node.getKnee().getValue() === 30);
    });

    it(".ratio", () => {
      const node = new DynamicsCompressorNode(context);

      assert(node.getRatio() instanceof AudioParam);
      assert(node.getRatio().getValue() === 12);
    });

    it(".attack", () => {
      const node = new DynamicsCompressorNode(context);

      assert(node.getAttack() instanceof AudioParam);
      assert(node.getAttack().getValue() === 0.003);
    });

    it(".release", () => {
      const node = new DynamicsCompressorNode(context);

      assert(node.getRelease() instanceof AudioParam);
      assert(node.getRelease().getValue() === 0.250);
    });
  });

  describe("channel configuration", () => {
    it("should synchronize with the input, but clamped by 2", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new DynamicsCompressorNode(context);
      const node3 = new AudioNode(context, { inputs: [ 1 ] });

      node1.outputs[0].enable();
      node2.outputs[0].enable();

      // +-------+
      // | node1 |
      // +--(4)--+
      //
      // +--(1)--+
      // | node2 | DynamicsCompressorNode
      // +--(2)--+
      //     |
      // +--(2)--+
      // | node3 |
      // +-------+
      node2.connect(node3);
      assert(node2.inputs[0].getNumberOfChannels() === 1);
      assert(node3.inputs[0].getNumberOfChannels() === 2);

      // +-------+
      // | node1 |
      // +--(4)--+
      //     |
      // +--(2)--+
      // | node2 | DynamicsCompressorNode
      // +--(2)--+
      //     |
      // +--(2)--+
      // | node3 |
      // +-------+
      node1.connect(node2);
      assert(node2.inputs[0].getNumberOfChannels() === 2);
      assert(node3.inputs[0].getNumberOfChannels() === 2);
    });
  });
});
