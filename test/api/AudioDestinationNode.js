"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const api = require("../../src/api");
const AudioContext = require("../../src/api/BaseAudioContext");

describe("api/AudioDestinationNode", () => {
  it("context.destination", () => {
    const context = new AudioContext();
    const target = context.destination;

    assert(target instanceof api.AudioDestinationNode);
  });

  describe("attributes", () => {
    it(".maxChannelCount", () => {
      const context = new AudioContext();
      const target = context.destination;
      const maxChannelCount = 2;

      target._impl.getMaxChannelCount = sinon.spy(() => maxChannelCount);

      assert(target.maxChannelCount === maxChannelCount);
      assert(target._impl.getMaxChannelCount.callCount === 1);
    });
  });
});
