"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const AudioContext = require("../../src/impl/AudioContext");
const AudioDestinationNode = require("../../src/impl/AudioDestinationNode");
const AudioListener = require("../../src/impl/AudioListener");

const contextOpts = { sampleRate: 8000, blockSize: 16 };

describe("impl/AudioContext", () => {
  it("constructor", () => {
    const context = new AudioContext(contextOpts);

    assert(context instanceof AudioContext);
  });

  describe("attributes", () => {
    it(".destination", () => {
      const context = new AudioContext(contextOpts);

      assert(context.getDestination() instanceof AudioDestinationNode);
    });

    it(".sampleRate", () => {
      const context = new AudioContext(contextOpts);

      assert(context.getSampleRate() === contextOpts.sampleRate);
    });

    it(".currentTime", () => {
      const context = new AudioContext(contextOpts);

      assert(context.getCurrentTime() === 0);
    });

    it(".listener", () => {
      const context = new AudioContext(contextOpts);

      assert(context.getListener() instanceof AudioListener);
    });
  });

  describe("methods", () => {
    it(".reset()", () => {
      const context = new AudioContext(contextOpts);
      const channelData = [ new Float32Array(16), new Float32Array(16) ];

      context.resume();
      context.process(channelData, 0);

      assert(context.getState() === "running");
      assert(context.currentTime !== 0);

      context.reset();
      assert(context.getState() === "suspended");
      assert(context.currentTime === 0);
    });
  });

  describe("state change", () => {
    let context, stateChangeSpy;

    before(() => {
      context = new AudioContext(contextOpts);
      stateChangeSpy = sinon.spy();

      context.addEventListener("statechange", stateChangeSpy);
    });

    beforeEach(() => {
      stateChangeSpy.reset();
    });

    it("resume", () => {
      assert(context.getState() === "suspended");

      context.resume();
      assert(context.getState() === "running");
      assert(stateChangeSpy.callCount === 1);

      // resume() in state 'running'
      context.resume();
      assert(context.getState() === "running");
      assert(stateChangeSpy.callCount === 1);
    });

    it("suspend", () => {
      assert(context.getState() === "running");

      context.suspend();
      assert(context.getState() === "suspended");
      assert(stateChangeSpy.callCount === 1);

      // suspend() in state 'suspended'
      context.suspend();
      assert(context.getState() === "suspended");
      assert(stateChangeSpy.callCount === 1);
    });

    it("close", () => {
      assert(context.getState() === "suspended");

      context.close();
      assert(context.getState() === "closed");
      assert(stateChangeSpy.callCount === 1);

      // close() in state 'closed'
      context.close();
      assert(context.getState() === "closed");
      assert(stateChangeSpy.callCount === 1);
    });
  });
});
