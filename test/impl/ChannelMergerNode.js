"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../src/impl/AudioContext");
const ChannelMergerNode = require("../../src/impl/ChannelMergerNode");
const AudioNode = require("../../src/impl/AudioNode");

describe("impl/ChannelMergerNode", () => {
  let context;

  beforeEach(() => {
    context = new AudioContext({ sampleRate: 8000, blockSize: 32 });
  });

  it("constructor", () => {
    const node = new ChannelMergerNode(context, { numberOfInputs: 6 });

    assert(node instanceof ChannelMergerNode);
    assert(node instanceof AudioNode);
  });

  describe("attributes", () => {
    it(".numberOfInputs", () => {
      const node = new ChannelMergerNode(context, { numberOfInputs: 6 });

      assert(node.getNumberOfInputs() === 6);
    });

    it(".numberOfOutputs", () => {
      const node = new ChannelMergerNode(context, { numberOfInputs: 6 });

      assert(node.getNumberOfOutputs() === 1);
    });

    it(".channelCount=", () => {
      const node = new ChannelMergerNode(context, { numberOfInputs: 6 });

      assert(node.getChannelCount() === 1);

      node.setChannelCount(2);
      assert(node.getChannelCount() === 1);
    });

    it(".channelCountMode=", () => {
      const node = new ChannelMergerNode(context, { numberOfInputs: 2 });

      assert(node.getChannelCountMode() === "explicit");

      node.setChannelCountMode("max");
      assert(node.getChannelCountMode() === "explicit");
    });

    it(".channelInterpretation=", () => {
      const node = new ChannelMergerNode(context, { numberOfInputs: 2 });

      assert(node.getChannelInterpretation() === "speakers");

      node.setChannelInterpretation("discrete");

      assert(node.getChannelInterpretation() === "discrete");
    });
  });

  describe("channel configuration", () => {
    it("should be kept by the initial configuration", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new ChannelMergerNode(context, { numberOfInputs: 6 });
      const node3 = new AudioNode(context, { inputs: [ 1 ] });

      node1.outputs[0].enable();
      node2.outputs[0].enable();

      // +-------+
      // | node1 |
      // +--(4)--+
      //
      //  +-(1)-(1)-(1)-(1)-(1)-(1)-+
      //  |          node2          | ChannelMergerNode
      //  +-----------(6)-----------+
      //               |
      //           +--(6)--+
      //           | node3 |
      //           +-------+
      node2.connect(node3);
      assert(node2.inputs[0].getNumberOfChannels() === 1);
      assert(node2.inputs[1].getNumberOfChannels() === 1);
      assert(node2.inputs[2].getNumberOfChannels() === 1);
      assert(node2.inputs[3].getNumberOfChannels() === 1);
      assert(node2.inputs[4].getNumberOfChannels() === 1);
      assert(node2.inputs[5].getNumberOfChannels() === 1);
      assert(node3.inputs[0].getNumberOfChannels() === 6);

      // +-------+
      // | node1 |
      // +--(4)--+
      //     |
      //  +-(1)-(1)-(1)-(1)-(1)-(1)-+
      //  |          node2          | ChannelMergerNode
      //  +-----------(6)-----------+
      //               |
      //           +--(6)--+
      //           | node3 |
      //           +-------+
      node1.connect(node2);
      assert(node2.inputs[0].getNumberOfChannels() === 1);
      assert(node2.inputs[1].getNumberOfChannels() === 1);
      assert(node2.inputs[2].getNumberOfChannels() === 1);
      assert(node2.inputs[3].getNumberOfChannels() === 1);
      assert(node2.inputs[4].getNumberOfChannels() === 1);
      assert(node2.inputs[5].getNumberOfChannels() === 1);
      assert(node3.inputs[0].getNumberOfChannels() === 6);
    });
  });

  describe("enable/disable", () => {
    it("always enabled", () => {
      const node1 = new AudioNode(context, { outputs: [ 1 ] });
      const node2 = new AudioNode(context, { outputs: [ 1 ] });
      const node3 = new ChannelMergerNode(context, { numberOfInputs: 4 });

      node1.connect(node3, 0, 0);
      node2.connect(node3, 0, 1);

      assert(node3.isEnabled() === false);

      node1.enableOutputsIfNecessary();
      assert(node3.isEnabled() === true);

      node2.enableOutputsIfNecessary();
      assert(node3.isEnabled() === true);

      node1.disableOutputsIfNecessary();
      assert(node3.isEnabled() === true);

      node2.disableOutputsIfNecessary();
      assert(node3.isEnabled() === false);
    });
  });
});
