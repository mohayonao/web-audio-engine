"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../src/impl/AudioContext");
const BiquadFilterNode = require("../../src/impl/BiquadFilterNode");
const AudioParam = require("../../src/impl/AudioParam");
const AudioNode = require("../../src/impl/AudioNode");

describe("impl/BiquadFilterNode", () => {
  let context;

  beforeEach(() => {
    context = new AudioContext({ sampleRate: 8000, blockSize: 32 });
  });

  it("constructor", () => {
    const node = new BiquadFilterNode(context);

    assert(node instanceof BiquadFilterNode);
    assert(node instanceof AudioNode);
  });

  describe("attributes", () => {
    it(".numberOfInputs", () => {
      const node = new BiquadFilterNode(context);

      assert(node.getNumberOfInputs() === 1);
    });

    it(".numberOfOutputs", () => {
      const node = new BiquadFilterNode(context);

      assert(node.getNumberOfOutputs() === 1);
    });

    it(".type=", () => {
      const node = new BiquadFilterNode(context);

      assert(node.getType() === "lowpass");

      [
        "lowpass", "highpass", "bandpass", "lowshelf",
        "highshelf", "peaking", "notch", "allpass"
      ].forEach((type) => {
        node.setType(type);
        assert(node.getType() === type);
      });
    });

    it(".frequency", () => {
      const node = new BiquadFilterNode(context);

      assert(node.getFrequency() instanceof AudioParam);
      assert(node.getFrequency().getValue() === 350);
    });

    it(".detune", () => {
      const node = new BiquadFilterNode(context);

      assert(node.getDetune() instanceof AudioParam);
      assert(node.getDetune().getValue() === 0);
    });

    it(".Q", () => {
      const node = new BiquadFilterNode(context);

      assert(node.getQ() instanceof AudioParam);
      assert(node.getQ().getValue() === 1);
    });

    it(".gain", () => {
      const node = new BiquadFilterNode(context);

      assert(node.getGain() instanceof AudioParam);
      assert(node.getGain().getValue() === 0);
    });
  });

  describe("channel configuration", () => {
    it("should synchronize with the input", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new BiquadFilterNode(context);
      const node3 = new AudioNode(context, { inputs: [ 1 ] });

      node1.outputs[0].enable();
      node2.outputs[0].enable();

      // +-------+
      // | node1 |
      // +--(4)--+
      //
      // +--(1)--+
      // | node2 | BiquadFilterNode
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
      // | node2 | BiquadFilterNode
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
    it.skip("work", () => {});
  });
});
