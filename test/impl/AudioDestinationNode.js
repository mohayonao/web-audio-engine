"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../src/impl/AudioContext");
const AudioDestinationNode = require("../../src/impl/AudioDestinationNode");
const AudioNode = require("../../src/impl/AudioNode");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });

describe("impl/AudioDestinationNode", () => {
  it("constructor", () => {
    const node = new AudioDestinationNode(context, { numberOfChannels: 2 });

    assert(node instanceof AudioDestinationNode);
    assert(node instanceof AudioNode);
  });

  describe("attributes", () => {
    it(".numberOfInputs", () => {
      const node = new AudioDestinationNode(context, { numberOfChannels: 2 });

      assert(node.getNumberOfInputs() === 1);
    });

    it(".numberOfOutputs", () => {
      const node = new AudioDestinationNode(context, { numberOfChannels: 2 });

      assert(node.getNumberOfOutputs() === 0);
    });

    it(".maxChannelCount", () => {
      const node = new AudioDestinationNode(context, { numberOfChannels: 2 });

      assert(node.getMaxChannelCount() === 2);
    });

    it(".channelCount=", () => {
      const node = new AudioDestinationNode(context, { numberOfChannels: 2 });

      node.setChannelCount(0);
      assert(node.getChannelCount() === 1);

      node.setChannelCount(1);
      assert(node.getChannelCount() === 1);

      node.setChannelCount(2);
      assert(node.getChannelCount() === 2);

      node.setChannelCount(4);
      assert(node.getChannelCount() === 2);
    });
  });

  describe("channel configuration", () => {
    it("should synchronize with the input, but clamped by max channel count", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new AudioDestinationNode(context, { numberOfChannels: 2 });

      node1.outputs[0].enable();

      // +-------+
      // | node1 |
      // +--(4)--+
      //
      // +--(2)--+
      // | node2 | AudioDestinationNode
      // +-------+
      assert(node2.inputs[0].getNumberOfChannels() === 2);

      // +-------+
      // | node1 |
      // +--(4)--+
      //     |
      // +--(2)--+
      // | node2 | AudioDestinationNode
      // +-------+
      node1.connect(node2);
      assert(node2.inputs[0].getNumberOfChannels() === 2);
    });
  });
});
