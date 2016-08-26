"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../src/impl/AudioContext");
const AudioBufferSourceNode = require("../../src/impl/AudioBufferSourceNode");
const AudioNode = require("../../src/impl/AudioNode");
const AudioSourceNode = require("../../src/impl/AudioSourceNode");
const AudioBuffer = require("../../src/impl/AudioBuffer");
const AudioParam = require("../../src/impl/AudioParam");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });

describe("impl/AudioBufferSourceNode", () => {
  it("constructor", () => {
    const node = new AudioBufferSourceNode(context);

    assert(node instanceof AudioBufferSourceNode);
    assert(node instanceof AudioSourceNode);
  });

  describe("attributes", () => {
    it(".numberOfInputs", () => {
      const node = new AudioBufferSourceNode(context);

      assert(node.getNumberOfInputs() === 0);
    });

    it(".numberOfOutputs", () => {
      const node = new AudioBufferSourceNode(context);

      assert(node.getNumberOfOutputs() === 1);
    });

    it(".buffer=", () => {
      const node = new AudioBufferSourceNode(context);
      const buffer = new AudioBuffer(context, { numberOfChannels: 2, length: 32, sampleRate: 8000 });

      assert(node.getBuffer() === null);

      node.setBuffer(buffer);
      assert(node.getBuffer() === buffer);
    });

    it(".playbackRate", () => {
      const node = new AudioBufferSourceNode(context);

      assert(node.getPlaybackRate() instanceof AudioParam);
      assert(node.getPlaybackRate().getValue() === 1);
    });

    it(".detune", () => {
      const node = new AudioBufferSourceNode(context);

      assert(node.getDetune() instanceof AudioParam);
      assert(node.getDetune().getValue() === 0);
    });

    it("loop=", () => {
      const node = new AudioBufferSourceNode(context);

      assert(node.getLoop() === false);

      node.setLoop(true);
      assert(node.getLoop() === true);
    });

    it("loopStart=", () => {
      const node = new AudioBufferSourceNode(context);

      assert(node.getLoopStart() === 0);

      node.setLoopStart(1);
      assert(node.getLoopStart() === 1);
    });

    it("loopEnd=", () => {
      const node = new AudioBufferSourceNode(context);

      assert(node.getLoopEnd() === 0);

      node.setLoopEnd(1);
      assert(node.getLoopEnd() === 1);
    });
  });

  // TODO: should rewrite test or source code
  // Private variables should not be used in test.
  describe("methods", () => {
    it(".start(when)", () => {
      const node = new AudioBufferSourceNode(context);
      const buffer = new AudioBuffer(context, { numberOfChannels: 2, length: 32, sampleRate: 8000 });

      node.setBuffer(buffer);

      node.start(1);
      assert(node._startTime === 1);
    });

    it(".stop(when, offset, duration)", () => {
      const node = new AudioBufferSourceNode(context);
      const buffer = new AudioBuffer(context, { numberOfChannels: 2, length: 32, sampleRate: 8000 });

      node.setBuffer(buffer);

      node.stop(0);
      assert(node._stopTime === Infinity);

      node.start(0);
      node.stop(1);

      assert(node._stopTime === 1);
    });
  });

  describe("channel configuration", () => {
    it("should synchronize with the buffer if set", () => {
      const node1 = new AudioBufferSourceNode(context);
      const node2 = new AudioNode(context, { inputs: [ 1 ] });
      const buffer = new AudioBuffer(context, { numberOfChannels: 2, length: 32, sampleRate: 8000 });

      node1.outputs[0].enable();

      // +-------+
      // | node1 | AudioBufferSourceNode (buffer=null)
      // +--(1)--+
      //     |
      // +--(1)--+
      // | node2 |
      // +-------+
      node1.connect(node2);
      assert(node2.inputs[0].getNumberOfChannels() === 1);

      // +-------+
      // | node1 | AudioBufferSourceNode (buffer=ch[2])
      // +--(2)--+
      //     |
      // +--(2)--+
      // | node2 |
      // +-------+
      node1.setBuffer(buffer);
      assert(node2.inputs[0].getNumberOfChannels() === buffer.getNumberOfChannels());
    });
  });
});
