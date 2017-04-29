"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioNodeInput = require("../../../src/impl/core/AudioNodeInput");
const AudioBus = require("../../../src/impl/core/AudioBus");
const AudioContext = require("../../../src/impl/AudioContext");
const AudioNode = require("../../../src/impl/AudioNode");
const { MAX, CLAMPED_MAX, EXPLICIT } = require("../../../src/constants/ChannelCountMode");
const { DISCRETE, SPEAKERS } = require("../../../src/constants/ChannelInterpretation");

describe("impl/core/AudioNodeInput", () => {
  let context;

  beforeEach(() => {
    context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
  });

  it("AudioNode().inputs[0]", () => {
    const node = new AudioNode(context, {}, { inputs: [ 1 ], outputs: [ 1 ] });

    assert(node.inputs[0] instanceof AudioNodeInput);
  });

  describe("attributes", () => {
    it(".node", () => {
      const node = new AudioNode(context, {}, { inputs: [ 1, 1 ] });

      assert(node.inputs[0].node === node);
      assert(node.inputs[1].node === node);
    });

    it(".index", () => {
      const node = new AudioNode(context, {}, { inputs: [ 1, 1 ] });

      assert(node.inputs[0].index === 0);
      assert(node.inputs[1].index === 1);
    });

    it(".bus", () => {
      const node = new AudioNode(context, {}, { inputs: [ 1, 1 ] });

      assert(node.inputs[0].bus instanceof AudioBus);
      assert(node.inputs[1].bus instanceof AudioBus);
    });

    it(".outputs", () => {
      const node = new AudioNode(context, {}, { inputs: [ 1, 1 ] });

      assert.deepEqual(node.inputs[0].outputs, []);
      assert.deepEqual(node.inputs[1].outputs, []);
    });

    it(".channelCount=", () => {
      const node = new AudioNode(context, {}, { inputs: [ 1 ], outputs: [ 1 ] });

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
      const node = new AudioNode(context, {}, { inputs: [ 1 ], outputs: [ 1 ] });

      assert(node.inputs[0].getChannelCountMode() === MAX);

      node.inputs[0].setChannelCountMode(EXPLICIT);
      assert(node.inputs[0].getChannelCountMode() === EXPLICIT);

      node.inputs[0].setChannelCountMode(CLAMPED_MAX);
      assert(node.inputs[0].getChannelCountMode() === CLAMPED_MAX);

      node.inputs[0].setChannelCountMode(MAX);
      assert(node.inputs[0].getChannelCountMode() === MAX);
    });

    it(".channelInterpretation=", () => {
      const node = new AudioNode(context, {}, { inputs: [ 1 ], outputs: [ 1 ] });

      assert(node.inputs[0].getChannelInterpretation() === SPEAKERS);

      node.inputs[0].setChannelInterpretation(DISCRETE);
      assert(node.inputs[0].getChannelInterpretation() === DISCRETE);

      node.inputs[0].setChannelInterpretation(SPEAKERS);
      assert(node.inputs[0].getChannelInterpretation() === SPEAKERS);
    })
  });
});
