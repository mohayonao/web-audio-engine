"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../src/impl/AudioContext");
const StereoPannerNode = require("../../src/impl/StereoPannerNode");
const BasePannerNode = require("../../src/impl/BasePannerNode");
const AudioParam = require("../../src/impl/AudioParam");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });

describe("impl/StereoPannerNode", () => {
  it("constructor", () => {
    const node = new StereoPannerNode(context);

    assert(node instanceof StereoPannerNode);
    assert(node instanceof BasePannerNode);
  });

  describe("attributes", () => {
    it(".numberOfInputs", () => {
      const node = new StereoPannerNode(context);

      assert(node.getNumberOfInputs() === 1);
    });

    it(".numberOfOutputs", () => {
      const node = new StereoPannerNode(context);

      assert(node.getNumberOfOutputs() === 1);
    });

    it(".pan", () => {
      const node = new StereoPannerNode(context);

      assert(node.getPan() instanceof AudioParam);
      assert(node.getPan().getValue() === 0);
    });
  });
});
