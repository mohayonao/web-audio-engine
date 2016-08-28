"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../src/impl/AudioContext");
const AnalyserNode = require("../../src/impl/AnalyserNode");
const AudioNode = require("../../src/impl/AudioNode");

describe("impl/AnalyserNode", () => {
  let context;

  beforeEach(() => {
    context = new AudioContext({ sampleRate: 8000, blockSize: 32 });
  });

  it("constructor", () => {
    const node = new AnalyserNode(context);

    assert(node instanceof AudioNode);
    assert(node instanceof AnalyserNode);
  });

  describe("attributes", () => {
    it(".numberOfInputs", () => {
      const node = new AnalyserNode(context);

      assert(node.getNumberOfInputs() === 1);
    });

    it(".numberOfOutputs", () => {
      const node = new AnalyserNode(context);

      assert(node.getNumberOfOutputs() === 1);
    });

    it(".fftSize=", () => {
      const node = new AnalyserNode(context);

      assert(node.getFftSize() === 2048);

      node.setFftSize(512);
      assert(node.getFftSize() === 512);
    });

    it(".frequencyBinCount", () => {
      const node = new AnalyserNode(context);

      assert(node.getFrequencyBinCount() === 1024);

      node.setFftSize(512);
      assert(node.getFrequencyBinCount() === 256);
    });

    it(".minDecibels=", () => {
      const node = new AnalyserNode(context);

      assert(node.getMinDecibels() === -100);

      node.setMinDecibels(-120);
      assert(node.getMinDecibels() === -120);
    });

    it(".maxDecibels=", () => {
      const node = new AnalyserNode(context);

      assert(node.getMaxDecibels() === -30);

      node.setMaxDecibels(-20);
      assert(node.getMaxDecibels() === -20);
    });

    it(".smoothingTimeConstant=", () => {
      const node = new AnalyserNode(context);

      assert(node.getSmoothingTimeConstant() === 0.8);

      node.setSmoothingTimeConstant(0.6);
      assert(node.getSmoothingTimeConstant() === 0.6);
    });
  })

  describe("channel configuration", () => {
    it("should synchronize with the input", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new AnalyserNode(context);
      const node3 = new AudioNode(context, { inputs: [ 1 ] });

      node1.outputs[0].enable();
      node2.outputs[0].enable();

      // +-------+
      // | node1 |
      // +--(4)--+
      //
      // +--(1)--+
      // | node2 | AnalyserNode
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
      // | node2 | AnalyserNode
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
