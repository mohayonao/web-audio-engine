"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioNodeInput = require("../../../src/impl/core/AudioNodeInput");
const AudioBus = require("../../../src/impl/core/AudioBus");
const AudioContext = require("../../../src/impl/AudioContext");
const AudioNode = require("../../../src/impl/AudioNode");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });

describe("impl/core/AudioNodeInput", () => {
  it("AudioNode().inputs[0]", () => {
    const node = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });

    assert(node.inputs[0] instanceof AudioNodeInput);
  });

  describe("attributes", () => {
    it(".node", () => {
      const node = new AudioNode(context, { inputs: [ 1, 1 ] });

      assert(node.inputs[0].node === node);
      assert(node.inputs[1].node === node);
    });

    it(".index", () => {
      const node = new AudioNode(context, { inputs: [ 1, 1 ] });

      assert(node.inputs[0].index === 0);
      assert(node.inputs[1].index === 1);
    });

    it(".bus", () => {
      const node = new AudioNode(context, { inputs: [ 1, 1 ] });

      assert(node.inputs[0].bus instanceof AudioBus);
      assert(node.inputs[1].bus instanceof AudioBus);
    });

    it(".outputs", () => {
      const node = new AudioNode(context, { inputs: [ 1, 1 ] });

      assert.deepEqual(node.inputs[0].outputs, []);
      assert.deepEqual(node.inputs[1].outputs, []);
    });

    it(".channelCount=", () => {
      const node = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });

      assert(node.inputs[0].getChannelCount() === 1);

      node.inputs[0].setChannelCount(2);
      assert(node.inputs[0].getChannelCount() === 2);

      node.inputs[0].setChannelCount(4);
      assert(node.inputs[0].getChannelCount() === 4);

      node.inputs[0].setChannelCount(100);
      assert(node.inputs[0].getChannelCount() === 32);

      node.inputs[0].setChannelCount(0);
      assert(node.inputs[0].getChannelCount() === 1);
    });

    it(".channelCountMode=", () => {
      const node = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });

      assert(node.inputs[0].getChannelCountMode() === "max");

      node.inputs[0].setChannelCountMode("explicit");
      assert(node.inputs[0].getChannelCountMode() === "explicit");

      node.inputs[0].setChannelCountMode("clamped-max");
      assert(node.inputs[0].getChannelCountMode() === "clamped-max");

      node.inputs[0].setChannelCountMode("max");
      assert(node.inputs[0].getChannelCountMode() === "max");

      node.inputs[0].setChannelCountMode("unkown");
      assert(node.inputs[0].getChannelCountMode() === "max");
    });

    it(".channelInterpretation=", () => {
      const node = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });

      assert(node.inputs[0].getChannelInterpretation() === "speakers");

      node.inputs[0].setChannelInterpretation("discrete");
      assert(node.inputs[0].getChannelInterpretation() === "discrete");

      node.inputs[0].setChannelInterpretation("speakers");
      assert(node.inputs[0].getChannelInterpretation() === "speakers");

      node.inputs[0].setChannelInterpretation("unkown");
      assert(node.inputs[0].getChannelInterpretation() === "speakers");
    })
  });
});
