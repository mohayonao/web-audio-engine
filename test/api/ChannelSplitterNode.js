"use strict";

require("run-with-mocha");

const assert = require("assert");
const api = require("../../src/api");
const AudioContext = require("../../src/api/BaseAudioContext");

describe("api/ChannelSplitterNode", () => {
  it("context.createChannelSplitter(numberOfOutputs)", () => {
    const context = new AudioContext();
    const target = context.createChannelSplitter(2);

    assert(target instanceof api.ChannelSplitterNode);
  });
});
