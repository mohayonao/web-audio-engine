"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../../src/impl/AudioContext");
const AudioNode = require("../../../src/impl/AudioNode");
const GainNode = require("../../../src/impl/GainNode");

describe("impl/core/AudioNode - ChannelPropagation", () => {
  let context;

  beforeEach(() => {
    context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
  });

  it("numberOfChannels", () => {
    const node1 = new GainNode(context);
    const node2 = new GainNode(context);
    const node3 = new GainNode(context);

    // +-------+
    // | node1 |
    // +-------+
    //     |
    // +-------+
    // | node2 |
    // +-------+
    //     |
    // +-------+
    // | node3 |
    // +-------+
    node1.outputs[0].enable();
    node2.outputs[0].enable();
    node1.connect(node2);
    node2.connect(node3);

    assert(node1.outputs[0].getNumberOfChannels() === 1);
    assert(node2.inputs[0].getNumberOfChannels() === 1);
    assert(node2.outputs[0].getNumberOfChannels() === 1);
    assert(node3.inputs[0].getNumberOfChannels() === 1);

    node1.outputs[0].setNumberOfChannels(4);
    assert(node1.outputs[0].getNumberOfChannels() === 4);
    assert(node2.inputs[0].getNumberOfChannels() === 4);
    assert(node2.outputs[0].getNumberOfChannels() === 4);
    assert(node3.inputs[0].getNumberOfChannels() === 4);
  });

  it("computedNumberOfChannels", () => {
    const node1 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });
    const node2 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });

    node1.connect(node2);
    node1.outputs[0].enable();

    node1.outputs[0].setNumberOfChannels(1);

    node2.setChannelCount(4);
    [
      [ "max", 1 ], [ "clamped-max", 1 ], [ "explicit", 4 ]
    ].forEach(([ countMode, expected ]) => {
      node2.setChannelCountMode(countMode);
      assert(node2.inputs[0].computeNumberOfChannels() === expected);
    });

    node1.outputs[0].setNumberOfChannels(8);
    [
      [ "max", 8 ], [ "clamped-max", 4 ], [ "explicit", 4 ]
    ].forEach(([ countMode, expected ]) => {
      node2.setChannelCountMode(countMode);
      assert(node2.inputs[0].computeNumberOfChannels() === expected);
    });
  });
});
