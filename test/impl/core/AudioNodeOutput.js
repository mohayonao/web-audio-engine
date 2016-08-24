"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const AudioNodeOutput = require("../../../src/impl/core/AudioNodeOutput");
const AudioBus = require("../../../src/impl/core/AudioBus");
const AudioContext = require("../../../src/impl/AudioContext");
const AudioNode = require("../../../src/impl/AudioNode");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });

describe("impl/core/AudioNodeOutput", () => {
  it("AudioNode().outputs[0]", () => {
    const node = new AudioNode(context, { outputs: [ 1 ] });

    assert(node.outputs[0] instanceof AudioNodeOutput);
  });

  describe("atrributes", () => {
    it(".node", () => {
      const node = new AudioNode(context, { outputs: [ 1, 1 ] });

      assert(node.outputs[0].node === node);
      assert(node.outputs[1].node === node);
    });

    it(".index", () => {
      const node = new AudioNode(context, { outputs: [ 1, 1 ] });

      assert(node.outputs[0].index === 0);
      assert(node.outputs[1].index === 1);
    });

    it(".bus", () => {
      const node = new AudioNode(context, { outputs: [ 1, 1 ] });

      assert(node.outputs[0].bus instanceof AudioBus);
      assert(node.outputs[1].bus instanceof AudioBus);
    });

    it(".inputs", () => {
      const node = new AudioNode(context, { outputs: [ 1, 1 ] });

      assert.deepEqual(node.outputs[0].inputs, []);
      assert.deepEqual(node.outputs[1].inputs, []);
    });

    it(".numberOfChannels=", () => {
      const node = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1, 1 ] });

      assert(node.outputs[0].getNumberOfChannels() === 1);
      assert(node.outputs[1].getNumberOfChannels() === 1);

      node.outputs[0].setNumberOfChannels(2);
      assert(node.outputs[0].getNumberOfChannels() === 2);
      assert(node.outputs[1].getNumberOfChannels() === 1);
    });
  });

  describe("methods", () => {
    it(".zeros()", () => {
      const node = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ] });

      node.outputs[0].bus.getMutableData();
      node.outputs[1].bus.getMutableData();
      assert(node.outputs[0].bus.isSilent === false);
      assert(node.outputs[1].bus.isSilent === false);

      node.outputs[0].zeros();
      assert(node.outputs[0].bus.isSilent === true);
      assert(node.outputs[1].bus.isSilent === false);
    });

    it(".pull()", () => {
      const node = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ] });

      node.dspProcess = sinon.spy();

      const retVal = node.outputs[0].pull();

      assert(node.dspProcess.callCount === 1);
      assert(retVal instanceof AudioBus);
    });
  });
});
