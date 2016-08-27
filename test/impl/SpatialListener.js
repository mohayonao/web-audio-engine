"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../src/impl/AudioContext");
const SpatialListener = require("../../src/impl/SpatialListener");
const AudioParam = require("../../src/impl/AudioParam");

describe("impl/SpatialListener", () => {
  let context;

  beforeEach(() => {
    context = new AudioContext({ sampleRate: 8000, blockSize: 32 });
  });

  it("constructor", () => {
    const node = new SpatialListener(context);

    assert(node instanceof SpatialListener);
  });

  describe("attributes", () => {
    it(".positionX", () => {
      const node = new SpatialListener(context);

      assert(node.getPositionX() instanceof AudioParam);
      assert(node.getPositionX().getValue() === 0);
    });

    it(".positionY", () => {
      const node = new SpatialListener(context);

      assert(node.getPositionY() instanceof AudioParam);
      assert(node.getPositionY().getValue() === 0);
    });

    it(".positionZ", () => {
      const node = new SpatialListener(context);

      assert(node.getPositionZ() instanceof AudioParam);
      assert(node.getPositionZ().getValue() === 0);
    });

    it(".forwardX", () => {
      const node = new SpatialListener(context);

      assert(node.getForwardX() instanceof AudioParam);
      assert(node.getForwardX().getValue() === 0);
    });

    it(".forwardY", () => {
      const node = new SpatialListener(context);

      assert(node.getForwardY() instanceof AudioParam);
      assert(node.getForwardY().getValue() === 0);
    });

    it(".forwardZ", () => {
      const node = new SpatialListener(context);

      assert(node.getForwardZ() instanceof AudioParam);
      assert(node.getForwardZ().getValue() === 0);
    });

    it(".upX", () => {
      const node = new SpatialListener(context);

      assert(node.getUpX() instanceof AudioParam);
    });

    it(".upY", () => {
      const node = new SpatialListener(context);

      assert(node.getUpY() instanceof AudioParam);
    });

    it(".upZ", () => {
      const node = new SpatialListener(context);

      assert(node.getUpZ() instanceof AudioParam);
    });
  });
});
