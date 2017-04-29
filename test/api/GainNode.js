"use strict";

require("run-with-mocha");

const assert = require("assert");
const api = require("../../src/api");
const AudioContext = require("../../src/api/BaseAudioContext");
const AudioParam = require("../../src/api/AudioParam");

describe("api/GainNode", () => {
  it("context.createGain()", () => {
    const context = new AudioContext();
    const target = context.createGain();

    assert(target instanceof api.GainNode);
  });

  describe("attributes", () => {
    it(".gain", () => {
      const context = new AudioContext();
      const target = context.createGain();

      assert(target.gain instanceof AudioParam);
      assert(target.gain === target._impl.$gain);
    });
  });
});
