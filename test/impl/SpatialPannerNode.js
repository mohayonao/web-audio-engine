"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../src/impl/AudioContext");
const SpatialPannerNode = require("../../src/impl/SpatialPannerNode");
const BasePannerNode = require("../../src/impl/BasePannerNode");
const AudioParam = require("../../src/impl/AudioParam");

describe("impl/SpatialPannerNode", () => {
  let context;

  beforeEach(() => {
    context = new AudioContext({ sampleRate: 8000, blockSize: 32 });
  });

  it("constructor", () => {
    const node = new SpatialPannerNode(context);

    assert(node instanceof SpatialPannerNode);
    assert(node instanceof BasePannerNode);
  });

  describe("attributes", () => {
    it(".positionX", () => {
      const node = new SpatialPannerNode(context);

      assert(node.getPositionX() instanceof AudioParam);
      assert(node.getPositionX().getValue() === 0);
    });

    it(".positionY", () => {
      const node = new SpatialPannerNode(context);

      assert(node.getPositionY() instanceof AudioParam);
      assert(node.getPositionY().getValue() === 0);
    });

    it(".positionZ", () => {
      const node = new SpatialPannerNode(context);

      assert(node.getPositionZ() instanceof AudioParam);
      assert(node.getPositionZ().getValue() === 0);
    });

    it(".orientationX", () => {
      const node = new SpatialPannerNode(context);

      assert(node.getOrientationX() instanceof AudioParam);
      assert(node.getOrientationX().getValue() === 0);
    });

    it(".orientationY", () => {
      const node = new SpatialPannerNode(context);

      assert(node.getOrientationY() instanceof AudioParam);
      assert(node.getOrientationY().getValue() === 0);
    });

    it(".orientationZ", () => {
      const node = new SpatialPannerNode(context);

      assert(node.getOrientationZ() instanceof AudioParam);
      assert(node.getOrientationZ().getValue() === 0);
    });
  });
});
