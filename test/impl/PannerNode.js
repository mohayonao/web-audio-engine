"use strict";

const assert = require("power-assert");
const AudioContext = require("../../src/impl/AudioContext");
const PannerNode = require("../../src/impl/PannerNode");
const BasePannerNode = require("../../src/impl/BasePannerNode");

const context = new AudioContext({ sampleRate: 8000, processingSizeInFrames: 16 });

describe("PannerNode", () => {
  describe("inherits", () => {
    it("PannerNode < BasePannerNode", () => {
      const node = new PannerNode(context);

      assert(node instanceof PannerNode);
      assert(node instanceof BasePannerNode);
    });
  });
});
