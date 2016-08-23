"use strict";

require("run-with-mocha");

const assert = require("power-assert");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const AudioBufferSourceNode = require("../../src/impl/AudioBufferSourceNode");
const AudioNode = require("../../src/impl/AudioNode");
const AudioSourceNode = require("../../src/impl/AudioSourceNode");
const AudioBuffer = require("../../src/impl/AudioBuffer");
const AudioParam = require("../../src/impl/AudioParam");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
const testSpec = {};

testSpec.numberOfInputs = {
  testCase: [ { expected: 0 } ]
};

testSpec.numberOfOutputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.playbackRate = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.detune = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.loop = {
  defaultValue: false,
  testCase: [
    { value: true, expected: true },
    { value: false, expected: false }
  ]
};

testSpec.loopStart = {
  defaultValue: 0,
  testCase: [
    { value: 1, expected: 1 },
    { value: -1, expected: 0 }
  ]
};

testSpec.loopEnd = {
  defaultValue: 0,
  testCase: [
    { value: 1, expected : 1 },
    { value: -1, expected: 0 }
  ]
};

describe("AudioBufferSourceNode", () => {
  describe("inherits", () => {
    it("AudioBufferSourceNode < AudioSourceNode", () => {
      const node = new AudioBufferSourceNode(context);

      assert(node instanceof AudioBufferSourceNode);
      assert(node instanceof AudioSourceNode);
    });
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: AudioBufferSourceNode,
      testSpec
    });

    it(".buffer=", () => {
      const node = new AudioBufferSourceNode(context);
      const buffer = new AudioBuffer(context, { numberOfChannels: 2, length: 32, sampleRate: context.sampleRate });

      assert(node.getBuffer() === null);

      node.setBuffer(buffer);
      assert(node.getBuffer() === buffer);
    });
  });

  describe("channel configuration", () => {
    it("should synchronize with the buffer if set", () => {
      const node1 = new AudioBufferSourceNode(context);
      const node2 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });
      const buffer = new AudioBuffer(context, { numberOfChannels: 2, length: 32, sampleRate: context.sampleRate });

      node1.outputs[0].enable();
      node1.connect(node2);

      assert(node2.inputs[0].getNumberOfChannels() === 1);

      node1.setBuffer(buffer);

      assert(node2.inputs[0].getNumberOfChannels() === buffer.getNumberOfChannels());
    });
  });
});
