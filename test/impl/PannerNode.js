"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../src/impl/AudioContext");
const PannerNode = require("../../src/impl/PannerNode");
const BasePannerNode = require("../../src/impl/BasePannerNode");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });

describe("impl/PannerNode", () => {
  it("constructor", () => {
    const node = new PannerNode(context);

    assert(node instanceof PannerNode);
    assert(node instanceof BasePannerNode);
  });
});
