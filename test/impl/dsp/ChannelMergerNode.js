"use strict";

require("run-with-mocha");

const assert = require("assert");
const np = require("../../helpers/np");
const AudioContext = require("../../../src/impl/AudioContext");
const ChannelMergerNode = require("../../../src/impl/ChannelMergerNode");
const AudioNode = require("../../../src/impl/AudioNode");

describe("impl/dsp/ChannelMergerNode", () => {
  it("works", () => {
    const channelData = [ new Float32Array(16), new Float32Array(16) ];
    const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
    const node1 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });
    const node2 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });
    const node3 = new ChannelMergerNode(context, { numberOfInputs: 4 });
    const noise1 = np.random_sample(16);
    const noise2 = np.random_sample(16);

    context.resume();
    node1.connect(node3, 0, 0);
    node2.connect(node3, 0, 1);
    node3.connect(context.getDestination());
    node1.enableOutputsIfNecessary();
    node2.enableOutputsIfNecessary();
    node1.outputs[0].bus.getMutableData()[0].set(noise1);
    node2.outputs[0].bus.getMutableData()[0].set(noise2);

    context.process(channelData, 0);

    const actual = node3.outputs[0].bus.getChannelData();
    const expected = [ noise1, noise2, np.zeros(16), np.zeros(16) ];

    assert.deepEqual(actual, expected);
  });
});
