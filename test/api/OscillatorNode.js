"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const api = require("../../src/api");
const AudioContext = require("../../src/api/AudioContext");
const AudioParam = require("../../src/api/AudioParam");

describe("api/OscillatorNode", () => {
  it("context.createOscillator()", () => {
    const context = new AudioContext();
    const target = context.createOscillator();

    assert(target instanceof api.OscillatorNode);
    assert(target instanceof api.AudioScheduledSourceNode);
  });

  describe("attributes", () => {
    it(".type=", () => {
      const context = new AudioContext();
      const target = context.createOscillator();
      const type1 = "sine"
      const type2 = "sawtooth";

      target._impl.getType = sinon.spy(() => type1);
      target._impl.setType = sinon.spy();

      assert(target.type === type1);
      assert(target._impl.getType.callCount === 1);

      target.type = type2;
      assert(target._impl.setType.callCount === 1);
      assert(target._impl.setType.args[0][0] === type2);
    });

    it(".frequency", () => {
      const context = new AudioContext();
      const target = context.createOscillator();

      assert(target.frequency instanceof AudioParam);
      assert(target.frequency === target._impl.$frequency);
    });

    it(".detune", () => {
      const context = new AudioContext();
      const target = context.createOscillator();

      assert(target.detune instanceof AudioParam);
      assert(target.detune === target._impl.$detune);
    });

    it(".onended=", () => {
      const context = new AudioContext();
      const target = context.createOscillator();
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
    it(".start(when)", () => {
      const context = new AudioContext();
      const target = context.createOscillator();
      const when = 0;

      target._impl.start = sinon.spy();

      target.start(when);
      assert(target._impl.start.callCount === 1);
      assert(target._impl.start.args[0][0] === when);
    });

    it(".stop(when)", () => {
      const context = new AudioContext();
      const target = context.createOscillator();
      const when = 0;

      target._impl.stop = sinon.spy();

      target.stop(when);
      assert(target._impl.stop.callCount === 1);
      assert(target._impl.stop.args[0][0] === when);
    });

    it(".setPeriodicWave(periodicWave)", () => {
      const context = new AudioContext();
      const target = context.createOscillator();
      const real = new Float32Array(16);
      const imag = new Float32Array(16);
      const periodicWave = context.createPeriodicWave(real, imag);

      target._impl.setPeriodicWave = sinon.spy();

      target.setPeriodicWave(periodicWave);
      assert(target._impl.setPeriodicWave.callCount === 1);
      assert(target._impl.setPeriodicWave.args[0][0] === periodicWave);
    });
  });
});
