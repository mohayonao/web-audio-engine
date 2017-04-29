"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../src/impl/AudioContext");
const WaveShaperNode = require("../../src/impl/WaveShaperNode");
const AudioNode = require("../../src/impl/AudioNode");

describe("impl/WaveShaperNode", () => {
  let context;

  beforeEach(() => {
    context = new AudioContext({ sampleRate: 8000, blockSize: 32 });
  });

  it("constructor", () => {
    const node = new WaveShaperNode(context);

    assert(node instanceof WaveShaperNode);
    assert(node instanceof AudioNode);
  });

  describe("attributes", () => {
    it(".numberOfInputs", () => {
      const node = new WaveShaperNode(context);

      assert(node.getNumberOfInputs() === 1);
    });

    it(".numberOfOutputs", () => {
      const node = new WaveShaperNode(context);

      assert(node.getNumberOfOutputs() === 1);
    });

    it(".curve=", () => {
      const node = new WaveShaperNode(context);
      const curve = new Float32Array(128);

      assert(node.getCurve() === null);

      node.setCurve(curve);
      assert(node.getCurve() === curve);
    });

    it(".oversample=", () => {
      const node = new WaveShaperNode(context);

      assert(node.getOversample() === "none");

      [
        "none", "2x", "4x"
      ].forEach((oversample) => {
        node.setOversample(oversample);
        assert(node.getOversample() === oversample);
      });
    });
  });

  describe("channel configuration", () => {
    it("should synchronize with the input", () => {
      const node1 = new AudioNode(context, {}, { outputs: [ 4 ] });
      const node2 = new WaveShaperNode(context);
      const node3 = new AudioNode(context, {}, { inputs: [ 1 ] });

      node1.outputs[0].enable();
      node2.outputs[0].enable();

      // +-------+
      // | node1 |
      // +--(4)--+
      //
      // +--(1)--+
      // | node2 | WaveShaperNode
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
      // | node2 | WaveShaperNode
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
