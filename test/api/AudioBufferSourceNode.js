"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const api = require("../../src/api");
const AudioContext = require("../../src/api/BaseAudioContext");
const AudioParam = require("../../src/api/AudioParam");

describe("api/AudioBufferSourceNode", () => {
  it("context.createBufferSource()", () => {
    const context = new AudioContext();
    const target = context.createBufferSource();

    assert(target instanceof api.AudioBufferSourceNode);
    assert(target instanceof api.AudioScheduledSourceNode);
  });

  describe("attributes", () => {
    it(".buffer=", () => {
      const context = new AudioContext();
      const target = context.createBufferSource();
      const buffer = context.createBuffer(1, 16, 8000);

      target._impl.setBuffer = sinon.spy();

      target.buffer = buffer;
      assert(target.buffer === buffer);
      assert(target._impl.setBuffer.callCount === 1);
      assert(target._impl.setBuffer.args[0][0] === buffer);
    });

    it(".playbackRate", () => {
      const context = new AudioContext();
      const target = context.createBufferSource();

      assert(target.playbackRate instanceof AudioParam);
      assert(target.playbackRate === target._impl.$playbackRate);
    });

    it(".detune", () => {
      const context = new AudioContext();
      const target = context.createBufferSource();

      assert(target.detune instanceof AudioParam);
      assert(target.detune === target._impl.$detune);
    });

    it(".loop=", () => {
      const context = new AudioContext();
      const target = context.createBufferSource();
      const loop1 = false;
      const loop2 = true;

      target._impl.getLoop = sinon.spy(() => loop1);
      target._impl.setLoop = sinon.spy();

      assert(target.loop === loop1);
      assert(target._impl.getLoop.callCount === 1);

      target.loop = loop2;
      assert(target._impl.setLoop.callCount === 1);
      assert(target._impl.setLoop.args[0][0] === loop2);
    });

    it(".loopStart=", () => {
      const context = new AudioContext();
      const target = context.createBufferSource();
      const loopStart1 = 0;
      const loopStart2 = 1;

      target._impl.getLoopStart = sinon.spy(() => loopStart1);
      target._impl.setLoopStart = sinon.spy();

      assert(target.loopStart === loopStart1);
      assert(target._impl.getLoopStart.callCount === 1);

      target.loopStart = loopStart2;
      assert(target._impl.setLoopStart.callCount === 1);
      assert(target._impl.setLoopStart.args[0][0] === loopStart2);
    });

    it(".loopEnd=", () => {
      const context = new AudioContext();
      const target = context.createBufferSource();
      const loopEnd1 = 0;
      const loopEnd2 = 1;

      target._impl.getLoopEnd = sinon.spy(() => loopEnd1);
      target._impl.setLoopEnd = sinon.spy();

      assert(target.loopEnd === loopEnd1);
      assert(target._impl.getLoopEnd.callCount === 1);

      target.loopEnd = loopEnd2;
      assert(target._impl.setLoopEnd.callCount === 1);
      assert(target._impl.setLoopEnd.args[0][0] === loopEnd2);
    });

    it(".onended=", () => {
      const context = new AudioContext();
      const target = context.createBufferSource();
      const callback1 = sinon.spy();
      const callback2 = sinon.spy();
      const callback3 = sinon.spy();
      const event = { type: "ended" };

      target.onended = callback1;
      target.onended = callback2;
      target.addEventListener("ended", callback3);
      target._impl.dispatchEvent(event);

      assert(target.onended === callback2);
      assert(callback1.callCount === 0);
      assert(callback2.callCount === 1);
      assert(callback3.callCount === 1);
      assert(callback2.args[0][0] === event);
      assert(callback3.args[0][0] === event);
    });
  });

  describe("methods", () => {
    it(".start(when, offset, duration)", () => {
      const context = new AudioContext();
      const target = context.createBufferSource();
      const when = 0;
      const offset = 1;
      const duration = 2;

      target._impl.start = sinon.spy();

      target.start(when, offset, duration);
      assert(target._impl.start.callCount === 1);
      assert(target._impl.start.args[0][0] === when);
      assert(target._impl.start.args[0][1] === offset);
      assert(target._impl.start.args[0][2] === duration);
    });

    it(".stop(when)", () => {
      const context = new AudioContext();
      const target = context.createBufferSource();
      const when = 0;

      target._impl.stop = sinon.spy();

      target.stop(when);
      assert(target._impl.stop.callCount === 1);
      assert(target._impl.stop.args[0][0] === when);
    });
  });
});
