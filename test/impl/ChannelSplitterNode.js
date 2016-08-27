"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../src/impl/AudioContext");
const ChannelSplitterNode = require("../../src/impl/ChannelSplitterNode");
const AudioNode = require("../../src/impl/AudioNode");

describe("impl/ChannelSplitterNode", () => {
  let context;

  beforeEach(() => {
    context = new AudioContext({ sampleRate: 8000, blockSize: 32 });
  });

  it("constructor", () => {
    const node = new ChannelSplitterNode(context, { numberOfOutputs: 6 });

    assert(node instanceof ChannelSplitterNode);
    assert(node instanceof AudioNode);
  });

  describe("attributes", () => {
    it(".numberOfInputs", () => {
      const node = new ChannelSplitterNode(context, { numberOfOutputs: 6 });

      assert(node.getNumberOfInputs() === 1);
    });

    it(".numberOfOutputs", () => {
      const node = new ChannelSplitterNode(context, { numberOfOutputs: 6 });

      assert(node.getNumberOfOutputs() === 6);
    });
  });

  describe("channel configuration", () => {
    it("should be kept by the initial configuration", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new ChannelSplitterNode(context, { numberOfOutputs: 6 });
      const node3 = new AudioNode(context, { inputs: [ 1 ] });

      node1.outputs[0].enable();
      node2.outputs[0].enable();

      //           +-------+
      //           | node1 |
      //           +--(4)--+
      //
      //  +-----------(1)-----------+
      //  |          node2          | ChannelMergerNode
      //  +-(1)-(1)-(1)-(1)-(1)-(1)-+
      //     |
      // +--(1)--+
      // | node3 |
      // +-------+
      node2.connect(node3);
      assert(node2.inputs[0].getNumberOfChannels() === 1);
      assert(node3.inputs[0].getNumberOfChannels() === 1);

      //           +-------+
      //           | node1 |
      //           +--(4)--+
      //               |
      //  +-----------(4)-----------+
      //  |          node2          | ChannelMergerNode
      //  +-(1)-(1)-(1)-(1)-(1)-(1)-+
      //     |
      // +--(1)--+
      // | node3 |
      // +-------+
      node1.connect(node2);
      assert(node2.inputs[0].getNumberOfChannels() === 4);
      assert(node3.inputs[0].getNumberOfChannels() === 1);
    });
  });
});
