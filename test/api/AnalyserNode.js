"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const api = require("../../src/api");
const AudioContext = require("../../src/api/BaseAudioContext");

describe("api/AnalyserNode", () => {
  it("context.createAnalyser()", () => {
    const context = new AudioContext();
    const target = context.createAnalyser();

    assert(target instanceof api.AnalyserNode);
  });

  describe("attributes", () => {
    it(".fftSize=", () => {
      const context = new AudioContext();
      const target = context.createAnalyser();
      const fftSize1 = 1024;
      const fftSize2 = 512;

      target._impl.getFftSize = sinon.spy(() => fftSize1);
      target._impl.setFftSize = sinon.spy();

      assert(target.fftSize === fftSize1);
      assert(target._impl.getFftSize.callCount === 1);

      target.fftSize = fftSize2;
      assert(target._impl.setFftSize.callCount === 1);
      assert(target._impl.setFftSize.args[0][0] === fftSize2);
    });

    it(".frequencyBinCount", () => {
      const context = new AudioContext();
      const target = context.createAnalyser();
      const frequencyBinCount = 512;

      target._impl.getFrequencyBinCount = sinon.spy(() => frequencyBinCount);

      assert(target.frequencyBinCount === frequencyBinCount);
      assert(target._impl.getFrequencyBinCount.callCount === 1);
    });

    it(".minDecibels=", () => {
      const context = new AudioContext();
      const target = context.createAnalyser();
      const minDecibels1 = -30;
      const minDecibels2 = -20;

      target._impl.getMinDecibels = sinon.spy(() => minDecibels1);
      target._impl.setMinDecibels = sinon.spy();

      assert(target.minDecibels === minDecibels1);
      assert(target._impl.getMinDecibels.callCount === 1);

      target.minDecibels = minDecibels2;
      assert(target._impl.setMinDecibels.callCount === 1);
      assert(target._impl.setMinDecibels.args[0][0] === minDecibels2);
    });

    it(".maxDecibels=", () => {
      const context = new AudioContext();
      const target = context.createAnalyser();
      const maxDecibels1 = -100;
      const maxDecibels2 = -120;

      target._impl.getMaxDecibels = sinon.spy(() => maxDecibels1);
      target._impl.setMaxDecibels = sinon.spy();

      assert(target.maxDecibels === maxDecibels1);
      assert(target._impl.getMaxDecibels.callCount === 1);

      target.maxDecibels = maxDecibels2;
      assert(target._impl.setMaxDecibels.callCount === 1);
      assert(target._impl.setMaxDecibels.args[0][0] === maxDecibels2);
    });

    it(".smoothingTimeConstant=", () => {
      const context = new AudioContext();
      const target = context.createAnalyser();
      const smoothingTimeConstant1 = 0.8;
      const smoothingTimeConstant2 = 0.6;

      target._impl.getSmoothingTimeConstant = sinon.spy(() => smoothingTimeConstant1);
      target._impl.setSmoothingTimeConstant = sinon.spy();

      assert(target.smoothingTimeConstant === smoothingTimeConstant1);
      assert(target._impl.getSmoothingTimeConstant.callCount === 1);

      target.smoothingTimeConstant = smoothingTimeConstant2;
      assert(target._impl.setSmoothingTimeConstant.callCount === 1);
      assert(target._impl.setSmoothingTimeConstant.args[0][0] === smoothingTimeConstant2);
    });
  });

  describe("methods", () => {
    it(".getFloatFrequencyData(array)", () => {
      const context = new AudioContext();
      const target = context.createAnalyser();
      const array = new Float32Array(128);

      target._impl.getFloatFrequencyData = sinon.spy();

      target.getFloatFrequencyData(array);
      assert(target._impl.getFloatFrequencyData.callCount === 1);
      assert(target._impl.getFloatFrequencyData.args[0][0] === array);
    });

    it(".getByteFrequencyData(array)", () => {
      const context = new AudioContext();
      const target = context.createAnalyser();
      const array = new Uint8Array(128);

      target._impl.getByteFrequencyData = sinon.spy();

      target.getByteFrequencyData(array);
      assert(target._impl.getByteFrequencyData.callCount === 1);
      assert(target._impl.getByteFrequencyData.args[0][0] === array);
    });

    it(".getFloatTimeDomainData(array)", () => {
      const context = new AudioContext();
      const target = context.createAnalyser();
      const array = new Float32Array(128);

      target._impl.getFloatTimeDomainData = sinon.spy();

      target.getFloatTimeDomainData(array);
      assert(target._impl.getFloatTimeDomainData.callCount === 1);
      assert(target._impl.getFloatTimeDomainData.args[0][0] === array);
    });

    it(".getByteTimeDomainData(array)", () => {
      const context = new AudioContext();
      const target = context.createAnalyser();
      const array = new Uint8Array(128);

      target._impl.getByteTimeDomainData = sinon.spy();

      target.getByteTimeDomainData(array);
      assert(target._impl.getByteTimeDomainData.callCount === 1);
      assert(target._impl.getByteTimeDomainData.args[0][0] === array);
    });
  });
});
