"use strict";

require("run-with-mocha");

const assert = require("assert");
const np = require("../../helpers/np");
const AudioContext = require("../../../src/impl/AudioContext");
const WaveShaperNode = require("../../../src/impl/WaveShaperNode");
const AudioNode = require("../../../src/impl/AudioNode");

describe("impl/dsp/WaveShaperNode", () => {
  it("works", () => {
    const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
    const channelData = [ new Float32Array(16), new Float32Array(16) ];
    const node1 = new AudioNode(context, {}, { outputs: [ 2 ] });
    const node2 = new WaveShaperNode(context);
    const curve = new Float32Array([ 1, 0, 1 ]);
    const noise1 = np.random_sample(16).map(x => (x - 0.5) * 2);
    const noise2 = np.random_sample(16).map(x => (x - 0.5) * 2);

    context.resume();
    node1.connect(node2);
    node2.connect(context.getDestination());
    node1.enableOutputsIfNecessary();
    node1.outputs[0].bus.getMutableData()[0].set(noise1);
    node1.outputs[0].bus.getMutableData()[1].set(noise2);

    node2.setCurve(curve);

    context.process(channelData, 0);

    const actual = node2.outputs[0].bus.getChannelData();
    const expected = [ noise1.map(Math.abs), noise2.map(Math.abs) ];

    assert.deepEqual(actual[0], expected[0]);
    assert.deepEqual(actual[1], expected[1]);
  });

  it("works - without curve", () => {
    const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
    const channelData = [ new Float32Array(16), new Float32Array(16) ];
    const node1 = new AudioNode(context, {}, { outputs: [ 2 ] });
    const node2 = new WaveShaperNode(context);
    const noise1 = np.random_sample(16).map(x => (x - 0.5) * 2);
    const noise2 = np.random_sample(16).map(x => (x - 0.5) * 2);

    context.resume();
    node1.connect(node2);
    node2.connect(context.getDestination());
    node1.enableOutputsIfNecessary();
    node1.outputs[0].bus.getMutableData()[0].set(noise1);
    node1.outputs[0].bus.getMutableData()[1].set(noise2);

    context.process(channelData, 0);

    const actual = node2.outputs[0].bus.getChannelData();
    const expected = [ noise1, noise2 ];

    assert.deepEqual(actual[0], expected[0]);
    assert.deepEqual(actual[1], expected[1]);
  });
});
