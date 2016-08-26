"use strict";

require("run-with-mocha");

const assert = require("assert");
const api = require("../../src/api");
const AudioContext = require("../../src/api/AudioContext");
const AudioParam = require("../../src/api/AudioParam");

describe("api/DelayNode", () => {
  it("context.createDelay(maxDelayTime)", () => {
    const context = new AudioContext();
    const target = context.createDelay(1);

    assert(target instanceof api.DelayNode);
  });

  describe("attributes", () => {
    it(".delayTime", () => {
      const context = new AudioContext();
      const target = context.createDelay();

      assert(target.delayTime instanceof AudioParam);
      assert(target.delayTime === target._impl.$delayTime);
    });
  });
});
