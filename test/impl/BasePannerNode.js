"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../src/impl/AudioContext");
const BasePannerNode = require("../../src/impl/BasePannerNode");
const AudioNode = require("../../src/impl/AudioNode");

describe("impl/BasePannerNode", () => {
  let context;

  beforeEach(() => {
    context = new AudioContext({ sampleRate: 8000, blockSize: 32 });
  });

  it("constructor", () => {
    const node = new BasePannerNode(context);

    assert(node instanceof BasePannerNode);
    assert(node instanceof AudioNode);
  });

  describe("attributes", () => {
    it(".numberOfInputs", () => {
      const node = new BasePannerNode(context);

      assert(node.getNumberOfInputs() === 1);
    });

    it(".numberOfOutputs", () => {
      const node = new BasePannerNode(context);

      assert(node.getNumberOfOutputs() === 1);
    });

    it(".channelCount=", () => {
      const node = new BasePannerNode(context);

      assert(node.getChannelCount() === 2);

      node.setChannelCount(1);
      assert(node.getChannelCount() === 1);
    });

    it(".channelCountMode=", () => {
      const node = new BasePannerNode(context);

      assert(node.getChannelCountMode() === "clamped-max");

      node.setChannelCountMode("explicit");
      assert(node.getChannelCountMode() === "explicit");
    });

    it(".panningModel=", () => {
      const node = new BasePannerNode(context);

      assert(node.getPanningModel() === "equalpower");

      [
        "equalpower", "HRTF"
      ].forEach((panningModel) => {
        node.setPanningModel(panningModel);
        assert(node.getPanningModel() === panningModel);
      });
  });

    it(".distanceModel=", () => {
      const node = new BasePannerNode(context);

      assert(node.getDistanceModel() === "inverse");

      [
        "inverse", "linear", "exponential"
      ].forEach((distanceModel) => {
        node.setDistanceModel(distanceModel);
        assert(node.getDistanceModel() === distanceModel);
      });
    });

    it(".refDistance=", () => {
      const node = new BasePannerNode(context);

      assert(node.getRefDistance() === 1);

      node.setRefDistance(2);
      assert(node.getRefDistance() === 2);
    });

    it(".maxDistance=", () => {
      const node = new BasePannerNode(context);

      assert(node.getMaxDistance() === 10000);

      node.setMaxDistance(20000);
      assert(node.getMaxDistance() === 20000);
    });

    it(".rolloffFactor=", () => {
      const node = new BasePannerNode(context);

      assert(node.getRolloffFactor() === 1);

      node.setRolloffFactor(0.8);
      assert(node.getRolloffFactor() === 0.8);
    });

    it(".coneInnerAngle=", () => {
      const node = new BasePannerNode(context);

      assert(node.getConeInnerAngle() === 360);

      node.setConeInnerAngle(270);
      assert(node.getConeInnerAngle() === 270);
    });

    it(".coneOuterAngle=", () => {
      const node = new BasePannerNode(context);

      assert(node.getConeOuterAngle() === 360);

      node.setConeOuterAngle(270);
      assert(node.getConeOuterAngle() === 270);
    });

    it(".coneOuterGain=", () => {
      const node = new BasePannerNode(context);

      assert(node.getConeOuterGain() === 0);

      node.setConeOuterGain(0.1);
      assert(node.getConeOuterGain() === 0.1);
    });
  });

  describe("channel configuration", () => {
    it("should be always 2ch", () => {
      const node1 = new AudioNode(context, {}, { outputs: [ 4 ] });
      const node2 = new BasePannerNode(context);
      const node3 = new AudioNode(context, {}, { inputs: [ 1 ] });

      node1.outputs[0].enable();
      node2.outputs[0].enable();

      // +-------+
      // | node1 |
      // +--(4)--+
      //
      // +--(1)--+
      // | node2 | BasePannerNode
      // +--(2)--+
      //     |
      // +--(2)--+
      // | node3 |
      // +-------+
      node2.connect(node3);
      assert(node2.inputs[0].getNumberOfChannels() === 1);
      assert(node3.inputs[0].getNumberOfChannels() === 2);

      // +-------+
      // | node1 |
      // +--(4)--+
      //     |
      // +--(2)--+
      // | node2 | BasePannerNode
      // +--(2)--+
      //     |
      // +--(2)--+
      // | node3 |
      // +-------+
      node1.connect(node2);
      assert(node2.inputs[0].getNumberOfChannels() === 2);
      assert(node3.inputs[0].getNumberOfChannels() === 2);
    });
  });
});
