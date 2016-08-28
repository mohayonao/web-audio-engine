"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../src/impl/AudioContext");
const AudioWorkerNode = require("../../src/impl/AudioWorkerNode");
const AudioNode = require("../../src/impl/AudioNode");

const worker = {};
const numberOfInputs = [ 4, 4 ];
const numberOfOutputs = [ 2, 2 ];

describe("impl/AudioWorkerNode", () => {
  let context;

  beforeEach(() => {
    context = new AudioContext({ sampleRate: 8000, blockSize: 32 });
  });

  it("constructor", () => {
    const node = new AudioWorkerNode(context, { worker, numberOfInputs, numberOfOutputs });

    assert(node instanceof AudioWorkerNode);
    assert(node instanceof AudioNode);
  });

  describe("attributes", () => {
    it(".numberOfInputs", () => {
      const node = new AudioWorkerNode(context, { worker, numberOfInputs, numberOfOutputs });

      assert(node.getNumberOfInputs() === 2);
    });

    it(".numberOfOutputs", () => {
      const node = new AudioWorkerNode(context, { worker, numberOfInputs, numberOfOutputs });

      assert(node.getNumberOfOutputs() === 2);
    });

    it(".channelCount=", () => {
      const node = new AudioWorkerNode(context, { worker, numberOfInputs, numberOfOutputs });

      assert(node.getChannelCount() === 4);

      node.setChannelCount(2);
      assert(node.getChannelCount() === 4);
    });

    it(".channelCountMode=", () => {
      const node = new AudioWorkerNode(context, { worker, numberOfInputs, numberOfOutputs });

      assert(node.getChannelCountMode() === "explicit");

      node.setChannelCountMode("max");
      assert(node.getChannelCountMode() === "explicit");
    });

    it(".channelInterpretation=", () => {
      const node = new AudioWorkerNode(context, { worker, numberOfInputs, numberOfOutputs });

      assert(node.getChannelInterpretation() === "speakers");
      assert(node.inputs[0].getChannelInterpretation() === "speakers");
      assert(node.inputs[1].getChannelInterpretation() === "speakers");

      node.setChannelInterpretation("discrete");
      assert(node.getChannelInterpretation() === "discrete");
      assert(node.inputs[0].getChannelInterpretation() === "discrete");
      assert(node.inputs[1].getChannelInterpretation() === "discrete");
    });

    it(".worker", () => {
      const node = new AudioWorkerNode(context, { worker, numberOfInputs, numberOfOutputs });

      assert(node.getWorker() === worker);
    });
  });

  describe("channel configuration", () => {
    it("should be kept by the initial configuration", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new AudioWorkerNode(context, { worker, numberOfInputs, numberOfOutputs });
      const node3 = new AudioNode(context, { inputs: [ 1 ] });
      const node4 = new AudioNode(context, { inputs: [ 1 ] });

      node1.outputs[0].enable();
      node2.outputs[0].enable();

      //     +-------+
      //     | node1 |
      //     +--(2)--+
      //
      //       +(4)-(4)+
      //       | node2 | AudioWorkerNode
      //       +(2)-(2)+
      //           |
      //     +-----+------+
      //     |            |
      // +--(2)--+   +---(2)--+
      // | node3 |   | node 4 |
      // +-------+   +--------+
      node2.connect(node3, 0);
      node2.connect(node4, 1);
      assert(node2.inputs[0].getNumberOfChannels() === 4);
      assert(node2.inputs[1].getNumberOfChannels() === 4);
      assert(node3.inputs[0].getNumberOfChannels() === 2);
      assert(node4.inputs[0].getNumberOfChannels() === 2);

      //      +-------+
      //      | node1 |
      //      +--(2)--+
      //          |
      //       +-(4)-(4)-+
      //       |  node2  | AudioWorkerNode
      //       +-(2)-(2)-+
      //          |   |
      //     +----+   +---+
      //     |            |
      // +--(2)--+   +---(2)--+
      // | node3 |   | node 4 |
      // +-------+   +--------+
      node1.connect(node2);
      assert(node2.inputs[0].getNumberOfChannels() === 4);
      assert(node2.inputs[1].getNumberOfChannels() === 4);
      assert(node3.inputs[0].getNumberOfChannels() === 2);
      assert(node4.inputs[0].getNumberOfChannels() === 2);
    });
  });

  describe("enable/disable", () => {
    it("always enabled", () => {
      const node = new AudioWorkerNode(context, { worker, numberOfInputs, numberOfOutputs });

      assert(node.isEnabled() === true);

      node.disableOutputsIfNecessary();

      assert(node.isEnabled() === true);
    });
  });
});
