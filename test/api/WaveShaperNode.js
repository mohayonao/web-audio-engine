"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const api = require("../../src/api");
const AudioContext = require("../../src/api/AudioContext");

describe("api/WaveShaperNode", () => {
  it("context.createWaveShaper()", () => {
    const context = new AudioContext();
    const target = context.createWaveShaper();

    assert(target instanceof api.WaveShaperNode);
  });

  describe("atrributes", () => {
    it(".curve=", () => {
      const context = new AudioContext();
      const target = context.createWaveShaper();
      const curve1 = null;
      const curve2 = new Float32Array(128);

      target._impl.getCurve = sinon.spy(() => curve1);
      target._impl.setCurve = sinon.spy();

      assert(target.curve === curve1);
      assert(target._impl.getCurve.callCount === 1);

      target.curve = curve2;
      assert(target._impl.setCurve.callCount === 1);
      assert(target._impl.setCurve.args[0][0] === curve2);
    });

    it(".oversample=", () => {
      const context = new AudioContext();
      const target = context.createWaveShaper();
      const oversample1 = "none";
      const oversample2 = "2x";

      target._impl.getOversample = sinon.spy(() => oversample1);
      target._impl.setOversample = sinon.spy();

      assert(target.oversample === oversample1);
      assert(target._impl.getOversample.callCount === 1);

      target.oversample = oversample2;
      assert(target._impl.setOversample.callCount === 1);
      assert(target._impl.setOversample.args[0][0] === oversample2);
    });
  });
});
