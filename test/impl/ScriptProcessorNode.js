"use strict";

const assert = require("power-assert");
const sinon = require("sinon");
const deepEqual = require("deep-equal");
const np = require("../helpers/np");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const ScriptProcessorNode = require("../../src/impl/ScriptProcessorNode");
const AudioNode = require("../../src/impl/AudioNode");
const AudioBuffer = require("../../src/api/AudioBuffer");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
const testSpec = {};

testSpec.numberOfInputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.numberOfOutputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.channelCount = {
  defaultValue: 1,
  testCase: [
    { value: 1, expected: 1 },
    { value: 2, expected: 1 }
  ]
};

testSpec.channelCountMode = {
  defaultValue: "explicit",
  testCase: [
    { value: "max", expected: "explicit" },
    { value: "clamped-max", expected: "explicit" }
  ]
};

testSpec.bufferSize = {
  testCase: [ { expected: 256 } ]
};

describe("ScriptProcessorNode", () => {
  describe("inherits", () => {
    it("ScriptProcessorNode < AudioNode", () => {
      const node = new ScriptProcessorNode(context, { bufferSize: 256, numberOfInputChannels: 1, numberOfOutputChannels: 2 });

      assert(node instanceof ScriptProcessorNode);
      assert(node instanceof AudioNode);
    });
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: ScriptProcessorNode,
      create: context => new ScriptProcessorNode(context, { bufferSize: 256, numberOfInputChannels: 1, numberOfOutputChannels: 2 }),
      testSpec
    });
  });

  describe("channel configuration", () => {
    it("should be kept by the initial configuration", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new ScriptProcessorNode(context, { bufferSize: 256, numberOfInputChannels: 1, numberOfOutputChannels: 2 });
      const node3 = new AudioNode(context, { inputs: [ 1 ] });

      node1.outputs[0].enable();
      node2.outputs[0].enable();
      node2.connect(node3);

      assert(node2.inputs[0].getNumberOfChannels() === 1);
      assert(node3.inputs[0].getNumberOfChannels() === 2);

      node1.connect(node2);

      assert(node2.inputs[0].getNumberOfChannels() === 1);
      assert(node3.inputs[0].getNumberOfChannels() === 2);
    });
  });

  describe("processing", () => {
    let node1, node2, onaudioprocess;
    let noise1, noise2, noise3;

    before(() => {
      context.resume();

      node1 = new AudioNode(context, { inputs: [], outputs: [ 2 ] });
      node2 = new ScriptProcessorNode(context, { bufferSize: 256, numberOfInputChannels: 2, numberOfOutputChannels: 1 });

      onaudioprocess = sinon.spy((e) => {
        e.outputBuffer.getChannelData(0).set(noise3);
      });

      node2.setEventItem({
        type: "audioprocess",
        playbackTime: 0,
        inputBuffer: new AudioBuffer({ sampleRate: 8000 }),
        outputBuffer: new AudioBuffer({ sampleRate: 8000 })
      });

      node1.enableOutputsIfNecessary();
      node1.connect(node2);
      node2.connect(context.getDestination());
      node2.addEventListener("audioprocess", onaudioprocess);

      noise1 = np.random_sample(256);
      noise2 = np.random_sample(256);
      noise3 = np.random_sample(256);
    });

    beforeEach(() => {
      onaudioprocess.reset();
    });

    it("works [000-256]", () => {
      for (let i = 0; i < 16; i++) {
        node1.outputs[0].getAudioBus().getMutableData()[0].set(noise1.subarray(i * 16, i * 16 + 16));
        node1.outputs[0].getAudioBus().getMutableData()[1].set(noise2.subarray(i * 16, i * 16 + 16));
        context.process();
      }

      assert(onaudioprocess.callCount === 1);

      const eventItem = onaudioprocess.args[0][0];

      assert(eventItem.playbackTime === 256/8000);
      assert(deepEqual(eventItem.inputBuffer.getChannelData(0), noise1));
      assert(deepEqual(eventItem.inputBuffer.getChannelData(1), noise2));
    });
    it("works [256-512]", () => {
      const actual = new Float32Array(256);

      for (let i = 0; i < 16; i++) {
        node1.outputs[0].getAudioBus().getMutableData()[0].set(noise2.subarray(i * 16, i * 16 + 16));
        node1.outputs[0].getAudioBus().getMutableData()[1].set(noise1.subarray(i * 16, i * 16 + 16));
        context.process();
        actual.set(node2.outputs[0].getAudioBus().getChannelData()[0], i * 16);
      }
      assert(deepEqual(actual, noise3));
    });
  });
});
