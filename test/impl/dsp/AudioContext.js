"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const AudioContext = require("../../../src/impl/AudioContext");

const contextOpts = { sampleRate: 8000, blockSize: 16 };

describe("impl/dsp/AudioContext", () => {
  let context, destination;

  before(() => {
    context = new AudioContext(contextOpts);
    destination = context.getDestination();

    context.resume();
  });

  it("1: time advances", () => {
    const channelData = [new Float32Array(16), new Float32Array(16) ];

    assert(context.getCurrentTime() === 0);
    destination.process = sinon.spy();

    context.process(channelData, 0);

    assert(destination.process.callCount === 1);
    assert(destination.process.calledWith(channelData, 0));
    assert(context.getCurrentTime() === 16 / 8000);
  });

  it("2: do post process and reserve pre process (for next process)", () => {
    const channelData = [ new Float32Array(16), new Float32Array(16) ];
    const immediateSpy = sinon.spy();

    assert(context.getCurrentTime() === 16 / 8000);
    destination.process = sinon.spy(() => {
      context.addPostProcess(immediateSpy);
    });

    context.process(channelData, 0);

    assert(destination.process.callCount === 1);
    assert(destination.process.calledWith(channelData, 0));
    assert(context.getCurrentTime() === 32 / 8000);
    assert(immediateSpy.callCount === 1);
    assert(immediateSpy.calledAfter(destination.process));
  });
});
