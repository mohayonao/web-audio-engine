"use strict";

require("run-with-mocha");

const assert = require("assert");
const api = require("../../src/api");
const AudioContext = require("../../src/api/AudioContext");

describe("api/ChannelMergerNode", () => {
  it("context.createChannelMerger(numberOfInputs)", () => {
    const context = new AudioContext();
    const target = context.createChannelMerger(2);

    assert(target instanceof api.ChannelMergerNode);
  });
});
