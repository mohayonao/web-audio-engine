"use strict";

const assert = require("power-assert");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const SpatialPannerNode = require("../../src/impl/SpatialPannerNode");
const BasePannerNode = require("../../src/impl/BasePannerNode");
const AudioParam = require("../../src/impl/AudioParam");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
const testSpec = {};

testSpec.positionX = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.positionY = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.positionZ = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.orientationX = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.orientationY = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.orientationZ = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

describe("SpatialPannerNode", () => {
  describe("inherits", () => {
    it("SpatialPannerNode < BasePannerNode", () => {
      const node = new SpatialPannerNode(context);

      assert(node instanceof SpatialPannerNode);
      assert(node instanceof BasePannerNode);
    });
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: SpatialPannerNode,
      testSpec
    });
  });
});
