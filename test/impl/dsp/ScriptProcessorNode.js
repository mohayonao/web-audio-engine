"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const np = require("../../helpers/np");
const AudioContext = require("../../../src/impl/AudioContext");
const ScriptProcessorNode = require("../../../src/impl/ScriptProcessorNode");
const AudioNode = require("../../../src/impl/AudioNode");
const AudioBuffer = require("../../../src/api/AudioBuffer");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
const bufferSize = 256, numberOfInputChannels = 2, numberOfOutputChannels = 1;

describe("impl/dsp/ScriptProcessorNode", () => {
  const channelData = [ new Float32Array(16), new Float32Array(16) ];

  let node1, node2, onaudioprocess;
  let noise1, noise2, noise3;

  before(() => {
    context.resume();

    node1 = new AudioNode(context, { inputs: [], outputs: [ 2 ] });
    node2 = new ScriptProcessorNode(context, { bufferSize, numberOfInputChannels, numberOfOutputChannels });

    onaudioprocess = sinon.spy((e) => {
      e.outputBuffer.getChannelData(0).set(noise3);
    });

    node2.setEventItem({
      type: "audioprocess",
      playbackTime: 0,
      inputBuffer: new AudioBuffer(),
      outputBuffer: new AudioBuffer()
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
      node1.outputs[0].bus.getMutableData()[0].set(noise1.subarray(i * 16, i * 16 + 16));
      node1.outputs[0].bus.getMutableData()[1].set(noise2.subarray(i * 16, i * 16 + 16));
      context.process(channelData, 0);
    }

    assert(onaudioprocess.callCount === 1);

    const eventItem = onaudioprocess.args[0][0];

    assert(eventItem.playbackTime === 256/8000);
    assert.deepEqual(eventItem.inputBuffer.getChannelData(0), noise1);
    assert.deepEqual(eventItem.inputBuffer.getChannelData(1), noise2);
  });

  it("works [256-512]", () => {
    const actual = new Float32Array(256);

    for (let i = 0; i < 16; i++) {
      node1.outputs[0].bus.getMutableData()[0].set(noise2.subarray(i * 16, i * 16 + 16));
      node1.outputs[0].bus.getMutableData()[1].set(noise1.subarray(i * 16, i * 16 + 16));
      context.process(channelData, 0);
      actual.set(node2.outputs[0].bus.getChannelData()[0], i * 16);
    }
    assert.deepEqual(actual, noise3);
  });
});
