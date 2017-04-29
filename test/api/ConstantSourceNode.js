"use strict";

require("run-with-mocha");

const assert = require("assert");
const api = require("../../src/api");
const AudioContext = require("../../src/api/BaseAudioContext");
const AudioParam = require("../../src/api/AudioParam");

describe("api/ConstantSourceNode", () => {
  it("context.createConstantSource()", () => {
    const context = new AudioContext();
    const target = context.createConstantSource();

    assert(target instanceof api.ConstantSourceNode);
    assert(target instanceof api.AudioScheduledSourceNode);
  });

  describe("attributes", () => {
    it(".offset=", () => {
      const context = new AudioContext();
      const target = context.createConstantSource();

      assert(target.offset instanceof AudioParam);
      assert(target.offset === target._impl.$offset);
    });
  });
});
