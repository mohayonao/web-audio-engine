"use strict";

const assert = require("power-assert");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const StereoPannerNode = require("../../src/impl/StereoPannerNode");
const BasePannerNode = require("../../src/impl/BasePannerNode");
const AudioParam = require("../../src/impl/AudioParam");

const context = new AudioContext({ sampleRate: 8000, processingSizeInFrames: 16 });
const testSpec = {};

testSpec.pan = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

describe("StereoPannerNode", () => {
  describe("inherits", () => {
    it("StereoPannerNode < AudioNode", () => {
      const node = new StereoPannerNode(context);

      assert(node instanceof StereoPannerNode);
      assert(node instanceof BasePannerNode);
    });
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: StereoPannerNode,
      testSpec
    });
  });
});
