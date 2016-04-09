"use strict";

const assert = require("power-assert");
const deepEqual = require("deep-equal");
const np = require("../../helpers/np");
const attrTester = require("../../helpers/attrTester");
const AudioNodeInput = require("../../../src/impl/core/AudioNodeInput");
const AudioBus = require("../../../src/impl/core/AudioBus");
const AudioContext = require("../../../src/impl/AudioContext");
const AudioNode = require("../../../src/impl/AudioNode");

const context = new AudioContext({ sampleRate: 8000, processingSizeInFrames: 16 });
const testSpec = {};

testSpec.audioBus = {
  testCase: [ { expected: value => value instanceof AudioBus } ]
};

testSpec.channelCount = {
  defaultValue: 1,
  testCase: [
    { value: 2, expected: 2 },
    { value: 4, expected: 4 },
    { value: 100, expected: 32 },
    { value: 0, expected: 1 }
  ]
};

testSpec.channelCountMode = {
  defaultValue: "max",
  testCase: [
    { value: "explicit", expected: "explicit" },
    { value: "clamped-max", expected: "clamped-max" },
    { value: "max", expected: "max" },
    { value: "unknown", expected: "max" }
  ]
};

testSpec.channelInterpretation = {
  defaultValue: "speakers",
  testCase: [
    { value: "speakers", expected: "speakers" },
    { value: "discrete", expected: "discrete" },
    { value: "unknown", expected: "discrete" }
  ]
};

describe("AudioNodeInput", () => {
  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: AudioNodeInput,
      create: context => new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] }).getInput(0),
      testSpec
    });
  });

  describe("channel configuration", () => {
    let node1, node2, input;

    beforeEach(() => {
      node1 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });
      node2 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });
      input = node2.getInput(0);
      node1.connect(node2);
      node1.getOutput(0).enable();
    });

    it("input 1ch", () => {
      node1.getOutput(0).setNumberOfChannels(1);
      node2.setChannelCount(4);

      node2.setChannelCountMode("max");
      assert(input.computeNumberOfChannels() === 1);

      node2.setChannelCountMode("clamped-max");
      assert(input.computeNumberOfChannels() === 1);

      node2.setChannelCountMode("explicit");
      assert(input.computeNumberOfChannels() === 4);
    });
    it("input 8ch", () => {
      node1.getOutput(0).setNumberOfChannels(8);
      node2.setChannelCount(4);

      node2.setChannelCountMode("max");
      assert(input.computeNumberOfChannels("max") === 8);

      node2.setChannelCountMode("clamped-max");
      assert(input.computeNumberOfChannels("clamped-max") === 4);

      node2.setChannelCountMode("explicit");
      assert(input.computeNumberOfChannels("explicit") === 4);
    });
  });

  describe("connection", () => {
    it("connect", () => {
      const node1 = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ] });
      const node2 = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ] });
      const input = node2.getInput(0);

      assert(input.getNumberOfConnections() === 0);

      node1.connect(node2);
      assert(input.isConnectedFrom(node1) === true);
      assert(input.getNumberOfConnections() === 1);

      node1.connect(node2);
      assert(input.isConnectedFrom(node1) === true);
      assert(input.getNumberOfConnections() === 1);
    });

    it("disconnect", () => {
      const node1 = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ] });
      const node2 = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ] });
      const input = node2.getInput(0);

      node1.connect(node2);
      assert(input.isConnectedFrom(node1) === true);
      assert(input.getNumberOfConnections() === 1);

      node1.disconnect();
      assert(input.isConnectedFrom(node1) === false);
      assert(input.getNumberOfConnections() === 0);
    });

    it("disconnect - destination", () => {
      const node1 = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ] });
      const node2 = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ] });
      const node3 = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ] });
      const input = node2.getInput(0);

      node1.connect(node2);
      assert(input.isConnectedFrom(node1) === true);
      assert(input.isConnectedFrom(node2) === false);
      assert(input.getNumberOfConnections() === 1);

      node1.disconnect(node3);
      assert(input.isConnectedFrom(node1) === true);
      assert(input.isConnectedFrom(node2) === false);
      assert(input.getNumberOfConnections() === 1);

      node1.disconnect(node2);
      assert(input.isConnectedFrom(node1) === false);
      assert(input.isConnectedFrom(node2) === false);
      assert(input.getNumberOfConnections() === 0);
    });

    it("disconnect - destination / input", () => {
      const node1 = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ] });
      const node2 = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ] });
      const node3 = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ] });
      const input = node2.getInput(0);

      node1.connect(node2);
      assert(input.isConnectedFrom(node1, 0) === true);
      assert(input.isConnectedFrom(node1, 1) === false);
      assert(input.getNumberOfConnections() === 1);

      node1.disconnect(node3, 0);
      assert(input.isConnectedFrom(node1, 0) === true);
      assert(input.isConnectedFrom(node1, 1) === false);
      assert(input.getNumberOfConnections() === 1);

      node1.disconnect(node2, 1);
      assert(input.isConnectedFrom(node1, 0) === true);
      assert(input.isConnectedFrom(node1, 1) === false);
      assert(input.getNumberOfConnections() === 1);

      node1.disconnect(node2, 0);
      assert(input.isConnectedFrom(node1, 0) === false);
      assert(input.isConnectedFrom(node1, 1) === false);
      assert(input.getNumberOfConnections() === 0);
    });

    it("fanout", () => {
      // +-------+
      // | node1 |
      // +-------+
      //   |
      // +-------+  +-------+
      // | node2 |  | node3 |
      // +-------+  +-------+
      //   |          |
      //   +----------+
      //   |
      // +-O-----+
      // | node4 |
      // +-------+
      const node1 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });
      const node2 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });
      const node3 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });
      const node4 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });
      const input = node4.getInput(0);

      node1.connect(node2);
      node2.connect(node4);
      node3.connect(node4);

      assert(input.getNumberOfConnections() === 2);
      assert(input.getNumberOfFanOuts() === 0);
      assert(input.isEnabled() === false);

      node1.getOutput(0).enable();
      assert(input.getNumberOfFanOuts() === 1);
      assert(input.isEnabled() === true);

      node3.getOutput(0).enable();
      assert(input.getNumberOfFanOuts() === 2);
      assert(input.isEnabled() === true);

      node1.disconnect();
      assert(input.getNumberOfConnections() === 2);
      assert(input.getNumberOfFanOuts() === 1);
      assert(input.isEnabled() === true);

      node3.getOutput(0).disable();
      assert(input.getNumberOfConnections() === 2);
      assert(input.getNumberOfFanOuts() === 0);
      assert(input.isEnabled() === false);

      node2.disconnect();
      assert(input.getNumberOfConnections() === 1);

      node3.disconnect();
      assert(input.getNumberOfConnections() === 0);
    });

    it("misc", () => {
      const node = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });
      const input = node.getInput(0);

      assert(input.isConnectedFrom() === false);
    });
  });

  describe("processing", () => {
    it("pull from the single connection", () => {
      const node1 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });
      const node2 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });
      const noise1 = np.random_sample(16);
      const noise2 = np.random_sample(16);
      const e = {};

      node1.getOutput(0).enable();
      node1.connect(node2);

      node1.getOutput(0).getAudioBus().getMutableData()[0].set(noise1);
      node2.getInput(0).getAudioBus().getMutableData()[0].set(noise2);

      const input = node2.getInput(0);

      input.pull(e);

      const actual = input.getAudioBus().getChannelData()[0];
      const expected = noise1;

      assert(deepEqual(actual, expected));
    });
    it("pull from some connections", () => {
      const node1 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });
      const node2 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });
      const node3 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });
      const noise1 = np.random_sample(16);
      const noise2 = np.random_sample(16);
      const noise3 = np.random_sample(16);
      const e = {};

      node1.getOutput(0).enable();
      node2.getOutput(0).enable();
      node1.connect(node3);
      node2.connect(node3);

      node1.getOutput(0).getAudioBus().getMutableData()[0].set(noise1);
      node2.getOutput(0).getAudioBus().getMutableData()[0].set(noise2);
      node3.getInput(0).getAudioBus().getMutableData()[0].set(noise3);

      const input = node3.getInput(0);

      input.pull(e);

      const actual = input.getAudioBus().getChannelData()[0];
      const expected = noise1.map((_, i) => noise1[i] + noise2[i]);

      assert(deepEqual(actual, expected));
    });
  });
});
