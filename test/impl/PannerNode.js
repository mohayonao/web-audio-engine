"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../src/impl/AudioContext");
const PannerNode = require("../../src/impl/PannerNode");
const BasePannerNode = require("../../src/impl/BasePannerNode");

describe("impl/PannerNode", () => {
  let context;

  beforeEach(() => {
    context = new AudioContext({ sampleRate: 8000, blockSize: 32 });
  });

  it("constructor", () => {
    const node = new PannerNode(context);

    assert(node instanceof PannerNode);
    assert(node instanceof BasePannerNode);
  });
});
