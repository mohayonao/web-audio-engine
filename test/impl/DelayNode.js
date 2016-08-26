"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../src/impl/AudioContext");
const DelayNode = require("../../src/impl/DelayNode");
const AudioParam = require("../../src/impl/AudioParam");
const AudioNode = require("../../src/impl/AudioNode");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
const maxDelayTime = 1;

describe("impl/DelayNode", () => {
  it("constructor", () => {
    const node = new DelayNode(context, { maxDelayTime });

    assert(node instanceof DelayNode);
    assert(node instanceof AudioNode);
  });

  describe("attributes", () => {
    it(".numberOfInputs", () => {
      const node = new DelayNode(context, { maxDelayTime });

      assert(node.getNumberOfInputs() === 1);
    });

    it(".numberOfOutputs", () => {
      const node = new DelayNode(context, { maxDelayTime });

      assert(node.getNumberOfOutputs() === 1);
    });

    it(".delayTime", () => {
      const node = new DelayNode(context, { maxDelayTime });

      assert(node.getDelayTime() instanceof AudioParam);
      assert(node.getDelayTime().getValue() === 0);
    });

    it(".maxDelayTime", () => {
      const node = new DelayNode(context, { maxDelayTime });

      assert(node.getMaxDelayTime() === 1);
    });
  });

  describe("channel configuration", () => {
    it("should synchronize with the input", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new DelayNode(context, { maxDelayTime });
      const node3 = new AudioNode(context, { inputs: [ 1 ] });

      node1.outputs[0].enable();
      node2.outputs[0].enable();

      // +-------+
      // | node1 |
      // +--(4)--+
      //
      // +--(1)--+
      // | node2 | DelayNode
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
      // | node2 | DelayNode
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
});
