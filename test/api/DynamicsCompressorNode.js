"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const api = require("../../src/api");
const AudioContext = require("../../src/api/BaseAudioContext");
const AudioParam = require("../../src/api/AudioParam");

describe("api/DynamicsCompressorNode", () => {
  it("context.createDynamicsCompressor()", () => {
    const context = new AudioContext();
    const target = context.createDynamicsCompressor();

    assert(target instanceof api.DynamicsCompressorNode);
  });

  describe("attributes", () => {
    it(".threshold", () => {
      const context = new AudioContext();
      const target = context.createDynamicsCompressor();

      assert(target.threshold instanceof AudioParam);
      assert(target.threshold === target._impl.$threshold);
    });

    it(".knee", () => {
      const context = new AudioContext();
      const target = context.createDynamicsCompressor();

      assert(target.knee instanceof AudioParam);
      assert(target.knee === target._impl.$knee);
    });

    it(".ratio", () => {
      const context = new AudioContext();
      const target = context.createDynamicsCompressor();

      assert(target.ratio instanceof AudioParam);
      assert(target.ratio === target._impl.$ratio);
    });

    it(".reduction", () => {
      const context = new AudioContext();
      const target = context.createDynamicsCompressor();
      const reduction = 0;

      target._impl.getReduction = sinon.spy(() => reduction);

      assert(target.reduction === reduction);
      assert(target._impl.getReduction.callCount === 1);
    });

    it(".attack", () => {
      const context = new AudioContext();
      const target = context.createDynamicsCompressor();

      assert(target.attack instanceof AudioParam);
      assert(target.attack === target._impl.$attack);
    });

    it(".release", () => {
      const context = new AudioContext();
      const target = context.createDynamicsCompressor();

      assert(target.release instanceof AudioParam);
      assert(target.release === target._impl.$release);
    });
  });
});
