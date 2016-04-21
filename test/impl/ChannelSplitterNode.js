"use strict";

const assert = require("power-assert");
const deepEqual = require("deep-equal");
const np = require("../helpers/np");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const ChannelSplitterNode = require("../../src/impl/ChannelSplitterNode");
const AudioNode = require("../../src/impl/AudioNode");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
const testSpec = {};

testSpec.numberOfInputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.numberOfOutputs = {
  testCase: [ { expected: 6 } ]
};

describe("ChannelSplitterNode", () => {
  describe("inherits", () => {
    it("ChannelSplitterNode < AudioNode", () => {
      const node = new ChannelSplitterNode(context, { numberOfOutputs: 6 });

      assert(node instanceof ChannelSplitterNode);
      assert(node instanceof AudioNode);
    });
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: ChannelSplitterNode,
      create: context => new ChannelSplitterNode(context, { numberOfOutputs: 6 }),
      testSpec
    });
  });

  describe("channel configuration", () => {
    it("should be kept by the initial configuration", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new ChannelSplitterNode(context, { numberOfOutputs: 6 });
      const node3 = new AudioNode(context, { inputs: [ 1 ] });

      node1.outputs[0].enable();
      node2.outputs[0].enable();
      node2.connect(node3);

      assert(node2.inputs[0].getNumberOfChannels() === 1);
      assert(node3.inputs[0].getNumberOfChannels() === 1);

      node1.connect(node2);

      assert(node2.inputs[0].getNumberOfChannels() === 4);
      assert(node3.inputs[0].getNumberOfChannels() === 1);
    });
  });

  describe("processing", () => {
    it("works", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new ChannelSplitterNode(context, { numberOfOutputs: 6 });
      const noise1 = np.random_sample(16);
      const noise2 = np.random_sample(16);

      context.resume();
      node1.connect(node2);
      node2.connect(context.getDestination());
      node1.enableOutputsIfNecessary();
      [ 0, 1, 2, 3, 4, 5 ].forEach((ch) => {
        node2.outputs[ch].bus.getMutableData()[0].set(np.random_sample(16));
      });
      node1.outputs[0].bus.getMutableData()[0].set(noise1);
      node1.outputs[0].bus.getMutableData()[1].set(noise2);
      node1.outputs[0].bus.getMutableData()[2].set(noise1);
      node1.outputs[0].bus.getMutableData()[3].set(noise2);

      context.process();

      const actual = [ 0, 1, 2, 3, 4, 5 ].map(ch => node2.outputs[ch].bus.getChannelData()[0]);
      const isSilent = [ 0, 1, 2, 3, 4, 5 ].map(ch => node2.outputs[ch].bus.isSilent);

      assert(isSilent[0] === false);
      assert(isSilent[1] === false);
      assert(isSilent[2] === false);
      assert(isSilent[3] === false);
      assert(isSilent[4] === true);
      assert(isSilent[5] === true);
      assert(deepEqual(actual[0], noise1));
      assert(deepEqual(actual[1], noise2));
      assert(deepEqual(actual[2], noise1));
      assert(deepEqual(actual[3], noise2));
      assert(deepEqual(actual[4], np.zeros(16)));
      assert(deepEqual(actual[5], np.zeros(16)));
    });
    it("works - silent", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new ChannelSplitterNode(context, { numberOfOutputs: 6 });

      context.resume();
      node1.connect(node2);
      node2.connect(context.getDestination());
      node1.enableOutputsIfNecessary();
      [ 0, 1, 2, 3, 4, 5 ].forEach((ch) => {
        node2.outputs[ch].bus.getMutableData()[0].set(np.random_sample(16));
      });

      context.process();

      const actual = [ 0, 1, 2, 3, 4, 5 ].map(ch => node2.outputs[ch].bus.getChannelData()[0]);
      const isSilent = [ 0, 1, 2, 3, 4, 5 ].map(ch => node2.outputs[ch].bus.isSilent);

      assert(isSilent[0] === true);
      assert(isSilent[1] === true);
      assert(isSilent[2] === true);
      assert(isSilent[3] === true);
      assert(isSilent[4] === true);
      assert(isSilent[5] === true);
      assert(deepEqual(actual[0], np.zeros(16)));
      assert(deepEqual(actual[1], np.zeros(16)));
      assert(deepEqual(actual[2], np.zeros(16)));
      assert(deepEqual(actual[3], np.zeros(16)));
      assert(deepEqual(actual[4], np.zeros(16)));
      assert(deepEqual(actual[5], np.zeros(16)));
    });
  });
});
