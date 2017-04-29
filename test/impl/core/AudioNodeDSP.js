"use strict";

require("run-with-mocha");

const assert = require("assert");
const np = require("../../helpers/np");
const AudioContext = require("../../../src/impl/AudioContext");
const AudioNode = require("../../../src/impl/AudioNode");

describe("impl/core/AudioNode - DSP", () => {
  let context;

  beforeEach(() => {
    context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
  });

  it("pull from the single connection", () => {
    const node1 = new AudioNode(context, {}, { inputs: [ 1 ], outputs: [ 1 ] });
    const node2 = new AudioNode(context, {}, { inputs: [ 1 ], outputs: [ 1 ] });
    const noise1 = np.random_sample(16);
    const noise2 = np.random_sample(16);

    // +-------+
    // | node1 |
    // +-------+
    //     |
    // +-------+
    // | node2 |
    // +-------+
    node1.outputs[0].enable();
    node1.connect(node2);
    node1.outputs[0].bus.getMutableData()[0].set(noise1);
    node2.inputs[0].bus.getMutableData()[0].set(noise2);

    node2.inputs[0].pull();

    const actual = node2.inputs[0].bus.getChannelData()[0];
    const expected = noise1;

    assert.deepEqual(actual, expected);
  });

  it("pull from some connections", () => {
    const node1 = new AudioNode(context, {}, { inputs: [ 1 ], outputs: [ 1 ] });
    const node2 = new AudioNode(context, {}, { inputs: [ 1 ], outputs: [ 1 ] });
    const node3 = new AudioNode(context, {}, { inputs: [ 1 ], outputs: [ 1 ] });
    const noise1 = np.random_sample(16);
    const noise2 = np.random_sample(16);
    const noise3 = np.random_sample(16);

    // +-------+   +-------+
    // | node1 |   | node2 |
    // +-------+   +-------+
    //     |           |
    //     +-----+-----+
    //           |
    //       +-------+
    //       | node3 |
    //       +-------+
    node1.outputs[0].enable();
    node2.outputs[0].enable();
    node1.connect(node3);
    node2.connect(node3);
    node1.outputs[0].bus.getMutableData()[0].set(noise1);
    node2.outputs[0].bus.getMutableData()[0].set(noise2);
    node3.inputs[0].bus.getMutableData()[0].set(noise3);

    node3.inputs[0].pull();

    const actual = node3.inputs[0].bus.getChannelData()[0];
    const expected = noise1.map((_, i) => noise1[i] + noise2[i]);

    assert.deepEqual(actual, expected);
  });
});
