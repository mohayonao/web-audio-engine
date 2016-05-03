"use strict";

const assert = require("power-assert");
const sinon = require("sinon");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const AudioDestinationNode = require("../../src/impl/AudioDestinationNode");
const AudioListener = require("../../src/impl/AudioListener");

const contextOpts = { sampleRate: 8000, blockSize: 16 };
const testSpec = {};

testSpec.destination = {
  testCase: [ { expected: value => value instanceof AudioDestinationNode } ]
};

testSpec.sampleRate = {
  testCase: [ { expected: 8000 } ]
};

testSpec.currentTime = {
  testCase: [ { expected: 0 } ]
};

testSpec.listener = {
  testCase: [ { expected: value => value instanceof AudioListener } ]
};

describe("AudioContext", () => {
  describe("basic attributes", () => {
    attrTester.makeTests(null, {
      class: AudioContext,
      create: () => new AudioContext(contextOpts),
      testSpec
    });
  });

  describe("state", () => {
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

  describe("processing", () => {
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

  describe("reset", () => {
    it("works", () => {
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
});
