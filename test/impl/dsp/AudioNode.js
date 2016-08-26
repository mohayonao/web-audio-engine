"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const AudioContext = require("../../../src/impl/AudioContext");
const GainNode = require("../../../src/impl/GainNode");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });

describe("impl/dsp/AudioNode", () => {
  it("propagation", () => {
    const node1 = new GainNode(context);
    const node2 = new GainNode(context);
    const node3 = new GainNode(context);
    const param = node1.getGain();

    node1.outputs[0].enable();
    node2.outputs[0].enable();
    node1.connect(node2);
    node2.connect(node3);

    node1.dspProcess = sinon.spy();
    param.dspProcess = sinon.spy();

    node3.processIfNecessary();

    assert(param.dspProcess.callCount === 1);
  });

  it("feedback loop", () => {
    const node1 = new GainNode(context);
    const node2 = new GainNode(context);
    const node3 = new GainNode(context);

    node1.outputs[0].enable();
    node2.outputs[0].enable();
    node1.connect(node2);
    node2.connect(node3);
    node3.connect(node1);

    node1.dspProcess = sinon.spy();

    node3.processIfNecessary();

    assert(node1.dspProcess.callCount === 1);
  });
});
