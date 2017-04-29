"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const api = require("../../src/api");
const AudioContext = require("../../src/api/BaseAudioContext");
const AudioParam = require("../../src/api/AudioParam");

describe("api/BiquadFilterNode", () => {
  it("context.createBiquadFilter()", () => {
    const context = new AudioContext();
    const target = context.createBiquadFilter();

    assert(target instanceof api.BiquadFilterNode);
  });

  describe("attributes", () => {
    it(".type=", () => {
      const context = new AudioContext();
      const target = context.createBiquadFilter();
      const type1 = "lowpass"
      const type2 = "highpass";

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
      const target = context.createBiquadFilter();

      assert(target.frequency instanceof AudioParam);
      assert(target.frequency === target._impl.$frequency);
    });

    it(".detune", () => {
      const context = new AudioContext();
      const target = context.createBiquadFilter();

      assert(target.detune instanceof AudioParam);
      assert(target.detune === target._impl.$detune);
    });

    it(".Q", () => {
      const context = new AudioContext();
      const target = context.createBiquadFilter();

      assert(target.Q instanceof AudioParam);
      assert(target.Q === target._impl.$Q);
    });

    it(".gain", () => {
      const context = new AudioContext();
      const target = context.createBiquadFilter();

      assert(target.gain instanceof AudioParam);
      assert(target.gain === target._impl.$gain);
    });
  });

  describe("methods", () => {
    it(".getFrequencyResponse(frequencyHz, magResponse, phaseResponse)", () => {
      const context = new AudioContext();
      const target = context.createBiquadFilter();
      const frequencyHz = new Float32Array(128);
      const magResponse = new Float32Array(128);
      const phaseResponse = new Float32Array(128);

      target._impl.getFrequencyResponse = sinon.spy();

      target.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);
      assert(target._impl.getFrequencyResponse.callCount === 1);
      assert(target._impl.getFrequencyResponse.args[0][0] === frequencyHz);
      assert(target._impl.getFrequencyResponse.args[0][1] === magResponse);
      assert(target._impl.getFrequencyResponse.args[0][2] === phaseResponse);
    });
  });
});
