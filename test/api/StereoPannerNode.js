"use strict";

require("run-with-mocha");

const assert = require("assert");
const api = require("../../src/api");
const AudioContext = require("../../src/api/AudioContext");
const AudioParam = require("../../src/api/AudioParam");

describe("api/StereoPannerNode", () => {
  it("context.createStereoPanner()", () => {
    const context = new AudioContext();
    const target = context.createStereoPanner();

    assert(target instanceof api.StereoPannerNode);
  });

  describe("atrributes", () => {
    it(".pan", () => {
      const context = new AudioContext();
      const target = context.createStereoPanner();

      assert(target.pan instanceof AudioParam);
      assert(target.pan === target._impl.$pan);
    });
  });
});
