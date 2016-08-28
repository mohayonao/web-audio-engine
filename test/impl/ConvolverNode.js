"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../src/impl/AudioContext");
const ConvolverNode = require("../../src/impl/ConvolverNode");
const AudioBuffer = require("../../src/impl/AudioBuffer");
const AudioNode = require("../../src/impl/AudioNode");

describe("impl/ConvolverNode", () => {
  let context;

  beforeEach(() => {
    context = new AudioContext({ sampleRate: 8000, blockSize: 32 });
  });

  it("constructor", () => {
    const node = new ConvolverNode(context);

    assert(node instanceof ConvolverNode);
    assert(node instanceof AudioNode);
  });

  describe("attributes", () => {
    it(".numberOfInputs", () => {
      const node = new ConvolverNode(context);

      assert(node.getNumberOfInputs() === 1);
    });

    it(".numberOfOutputs", () => {
      const node = new ConvolverNode(context);

      assert(node.getNumberOfOutputs() === 1);
    });

    it(".channelCount=", () => {
      const node = new ConvolverNode(context);

      assert(node.getChannelCount() === 2);

      node.setChannelCount(1);
      assert(node.getChannelCount() === 1);

      node.setChannelCount(2);
      assert(node.getChannelCount() === 2);

      node.setChannelCount(4);
      assert(node.getChannelCount() === 2);
    });

    it(".channelCountMode=", () => {
      const node = new ConvolverNode(context);

      assert(node.getChannelCountMode() === "clamped-max");

      node.setChannelCountMode("max");
      assert(node.getChannelCountMode() === "clamped-max");
      assert(node.inputs[0].getChannelCountMode() === "clamped-max");

      node.setChannelCountMode("explicit");
      assert(node.getChannelCountMode() === "explicit");
      assert(node.inputs[0].getChannelCountMode() === "explicit");

      node.setChannelCountMode("clamped-max");
      assert(node.getChannelCountMode() === "clamped-max");
      assert(node.inputs[0].getChannelCountMode() === "clamped-max");
    });

    it(".buffer=", () => {
      const node = new ConvolverNode(context);
      const buffer = new AudioBuffer(2, 32, context.sampleRate);

      assert(node.getBuffer() === null);

      node.setBuffer(buffer);
      assert(node.getBuffer() === buffer);
    });

    it(".normalize=", () => {
      const node = new ConvolverNode(context);

      assert(node.getNormalize() === true);

      node.setNormalize(false);
      assert(node.getNormalize() === false);
    });
  });

  describe("channel configuration", () => {
    it("should synchronize with the input, but clamped by 2", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new ConvolverNode(context);
      const node3 = new AudioNode(context, { inputs: [ 1 ] });

      node1.outputs[0].enable();
      node2.outputs[0].enable();

      // +-------+
      // | node1 |
      // +--(4)--+
      //
      // +--(1)--+
      // | node2 | ConvolverNode
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
      // +--(2)--+
      // | node2 | ConvolverNode
      // +--(2)--+
      //     |
      // +--(2)--+
      // | node3 |
      // +-------+
      node1.connect(node2);
      assert(node2.inputs[0].getNumberOfChannels() === 2);
      assert(node3.inputs[0].getNumberOfChannels() === 2);
    });
  });
});
