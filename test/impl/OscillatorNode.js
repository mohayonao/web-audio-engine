"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../src/impl/AudioContext");
const OscillatorNode = require("../../src/impl/OscillatorNode");
const AudioNode = require("../../src/impl/AudioNode");
const AudioSourceNode = require("../../src/impl/AudioSourceNode");
const PeriodicWave = require("../../src/impl/PeriodicWave");
const AudioParam = require("../../src/impl/AudioParam");

describe("impl/OscillatorNode", () => {
  let context;

  beforeEach(() => {
    context = new AudioContext({ sampleRate: 8000, blockSize: 32 });
  });

  it("constructor", () => {
    const node = new OscillatorNode(context);

    assert(node instanceof OscillatorNode);
    assert(node instanceof AudioSourceNode);
  });

  describe("attributes", () => {
    it(".numberOfInputs", () => {
      const node = new OscillatorNode(context);

      assert(node.getNumberOfInputs() === 0);
    });

    it(".numberOfOutputs", () => {
      const node = new OscillatorNode(context);

      assert(node.getNumberOfOutputs() === 1);
    });

    it(".type=", () => {
      const node = new OscillatorNode(context);

      assert(node.getType() === "sine");

      [
        "sine", "square", "sawtooth", "triangle"
      ].forEach((type) => {
        node.setType(type);
        assert(node.getType() === type);
      });
    });

    it(".frequency", () => {
      const node = new OscillatorNode(context);

      assert(node.getFrequency() instanceof AudioParam);
      assert(node.getFrequency().getValue() === 440);
    });

    it(".detune", () => {
      const node = new OscillatorNode(context);

      assert(node.getDetune() instanceof AudioParam);
      assert(node.getDetune().getValue() === 0);
    });

    it("periodicWave=", () => {
      const node = new OscillatorNode(context);
      const periodicWave = new PeriodicWave(context, { real: [ 0, 0 ], imag: [ 0, 1 ] });

      node.setPeriodicWave(periodicWave);
      assert(node.getPeriodicWave() === periodicWave);
      assert(node.getType() === "custom");
    });
  });

  // TODO: should rewrite test or source code
  // Private variables should not be used in test.
  describe("methods", () => {
    it(".start(when)", () => {
      const node = new OscillatorNode(context);

      node.start(1);
      assert(node._startTime === 1);
    });

    it(".stop(when)", () => {
      const node = new OscillatorNode(context);

      node.stop(0);
      assert(node._stopTime === Infinity);

      node.start(0);
      node.stop(1);

      assert(node._stopTime === 1);
    });
  });

  describe("channel configuration", () => {
    it("should be mono output", () => {
      const node1 = new OscillatorNode(context);
      const node2 = new AudioNode(context, { inputs: [ 1 ] });

      // +-------+
      // | node1 | OscillatorNode
      // +--(1)--+
      //     |
      // +--(1)--+
      // | node2 |
      // +-------+
      node1.connect(node2);
      assert(node2.inputs[0].getNumberOfChannels() === 1);
    });
  });
});
