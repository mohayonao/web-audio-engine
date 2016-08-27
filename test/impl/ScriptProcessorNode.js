"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../src/impl/AudioContext");
const ScriptProcessorNode = require("../../src/impl/ScriptProcessorNode");
const AudioNode = require("../../src/impl/AudioNode");

const bufferSize = 256, numberOfInputChannels = 1, numberOfOutputChannels = 2;

describe("impl/ScriptProcessorNode", () => {
  let context;

  beforeEach(() => {
    context = new AudioContext({ sampleRate: 8000, blockSize: 32 });
  });

  it("constructor", () => {
    const node = new ScriptProcessorNode(context, { bufferSize, numberOfInputChannels, numberOfOutputChannels });

    assert(node instanceof ScriptProcessorNode);
    assert(node instanceof AudioNode);
  });

  describe("attributes", () => {
    it(".numberOfInputs", () => {
      const node = new ScriptProcessorNode(context, { bufferSize, numberOfInputChannels, numberOfOutputChannels });

      assert(node.getNumberOfInputs() === 1);
    });

    it(".numberOfOutputs", () => {
      const node = new ScriptProcessorNode(context, { bufferSize, numberOfInputChannels, numberOfOutputChannels });

      assert(node.getNumberOfOutputs() === 1);
    });

    it(".channelCountMode=", () => {
      const node = new ScriptProcessorNode(context, { bufferSize, numberOfInputChannels, numberOfOutputChannels });

      assert(node.getChannelCountMode() === "explicit");
      assert(node.inputs[0].getChannelCountMode() === "explicit");

      node.setChannelCountMode("max");
      assert(node.getChannelCountMode() === "explicit");
      assert(node.inputs[0].getChannelCountMode() === "explicit");
    });

    it(".channelCount=", () => {
      const node = new ScriptProcessorNode(context, { bufferSize, numberOfInputChannels, numberOfOutputChannels });

      assert(node.getChannelCount() === 1);

      node.setChannelCount(2);
      assert(node.getChannelCount() === 1);
    });

    it(".bufferSize", () => {
      const node = new ScriptProcessorNode(context, { bufferSize, numberOfInputChannels, numberOfOutputChannels });

      assert(node.getBufferSize() === bufferSize);
    });
  });

  describe("channel configuration", () => {
    it("should be kept by the initial configuration", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new ScriptProcessorNode(context, { bufferSize, numberOfInputChannels, numberOfOutputChannels });
      const node3 = new AudioNode(context, { inputs: [ 1 ] });

      node1.outputs[0].enable();
      node2.outputs[0].enable();

      // +-------+
      // | node1 |
      // +--(4)--+
      //
      // +--(1)--+
      // | node2 | ScriptProcessorNode
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
      // +--(1)--+
      // | node2 | ScriptProcessorNode
      // +--(2)--+
      //     |
      // +--(2)--+
      // | node3 |
      // +-------+
      node1.connect(node2);
      assert(node2.inputs[0].getNumberOfChannels() === 1);
      assert(node3.inputs[0].getNumberOfChannels() === 2);
    });
  });
});
