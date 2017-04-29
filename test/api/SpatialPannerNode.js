"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const api = require("../../src/api");
const AudioContext = require("../../src/api/BaseAudioContext");
const AudioParam = require("../../src/api/AudioParam");

describe("api/SpatialPannerNode", () => {
  it("context.createSpatialPanner()", () => {
    const context = new AudioContext();
    const target = context.createSpatialPanner();

    assert(target instanceof api.SpatialPannerNode);
  });

  describe("attributes", () => {
    it(".panningModel=", () => {
      const context = new AudioContext();
      const target = context.createSpatialPanner();
      const panningModel1 = "equalpower";
      const panningModel2 = "HRTF";

      target._impl.getPanningModel = sinon.spy(() => panningModel1);
      target._impl.setPanningModel = sinon.spy();

      assert(target.panningModel === panningModel1);
      assert(target._impl.getPanningModel.callCount === 1);

      target.panningModel = panningModel2;
      assert(target._impl.setPanningModel.callCount === 1);
      assert(target._impl.setPanningModel.args[0][0] === panningModel2);
    });

    it(".positionX", () => {
      const context = new AudioContext();
      const target = context.createSpatialPanner();

      assert(target.positionX instanceof AudioParam);
      assert(target.positionX === target._impl.$positionX);
    });

    it(".positionY", () => {
      const context = new AudioContext();
      const target = context.createSpatialPanner();

      assert(target.positionY instanceof AudioParam);
      assert(target.positionY === target._impl.$positionY);
    });

    it(".positionZ", () => {
      const context = new AudioContext();
      const target = context.createSpatialPanner();

      assert(target.positionZ instanceof AudioParam);
      assert(target.positionZ === target._impl.$positionZ);
    });

    it(".orientationX", () => {
      const context = new AudioContext();
      const target = context.createSpatialPanner();

      assert(target.orientationX instanceof AudioParam);
      assert(target.orientationX === target._impl.$orientationX);
    });

    it(".orientationY", () => {
      const context = new AudioContext();
      const target = context.createSpatialPanner();

      assert(target.orientationY instanceof AudioParam);
      assert(target.orientationY === target._impl.$orientationY);
    });

    it(".orientationZ", () => {
      const context = new AudioContext();
      const target = context.createSpatialPanner();

      assert(target.orientationZ instanceof AudioParam);
      assert(target.orientationZ === target._impl.$orientationZ);
    });

    it(".distanceModel=", () => {
      const context = new AudioContext();
      const target = context.createSpatialPanner();
      const distanceModel1 = "inverse";
      const distanceModel2 = "linear";

      target._impl.getDistanceModel = sinon.spy(() => distanceModel1);
      target._impl.setDistanceModel = sinon.spy();

      assert(target.distanceModel === distanceModel1);
      assert(target._impl.getDistanceModel.callCount === 1);

      target.distanceModel = distanceModel2;
      assert(target._impl.setDistanceModel.callCount === 1);
      assert(target._impl.setDistanceModel.args[0][0] === distanceModel2);
    });

    it(".refDistance=", () => {
      const context = new AudioContext();
      const target = context.createSpatialPanner();
      const refDistance1 = 1;
      const refDistance2 = 0.8;

      target._impl.getRefDistance = sinon.spy(() => refDistance1);
      target._impl.setRefDistance = sinon.spy();

      assert(target.refDistance === refDistance1);
      assert(target._impl.getRefDistance.callCount === 1);

      target.refDistance = refDistance2;
      assert(target._impl.setRefDistance.callCount === 1);
      assert(target._impl.setRefDistance.args[0][0] === refDistance2);
    });

    it(".maxDistance=", () => {
      const context = new AudioContext();
      const target = context.createSpatialPanner();
      const maxDistance1 = 10000;
      const maxDistance2 = 15000;

      target._impl.getMaxDistance = sinon.spy(() => maxDistance1);
      target._impl.setMaxDistance = sinon.spy();

      assert(target.maxDistance === maxDistance1);
      assert(target._impl.getMaxDistance.callCount === 1);

      target.maxDistance = maxDistance2;
      assert(target._impl.setMaxDistance.callCount === 1);
      assert(target._impl.setMaxDistance.args[0][0] === maxDistance2);
    });

    it(".rolloffFactor=", () => {
      const context = new AudioContext();
      const target = context.createSpatialPanner();
      const rolloffFactor1 = 1;
      const rolloffFactor2 = 0.8;

      target._impl.getRolloffFactor = sinon.spy(() => rolloffFactor1);
      target._impl.setRolloffFactor = sinon.spy();

      assert(target.rolloffFactor === rolloffFactor1);
      assert(target._impl.getRolloffFactor.callCount === 1);

      target.rolloffFactor = rolloffFactor2;
      assert(target._impl.setRolloffFactor.callCount === 1);
      assert(target._impl.setRolloffFactor.args[0][0] === rolloffFactor2);
    });

    it(".coneInnerAngle=", () => {
      const context = new AudioContext();
      const target = context.createSpatialPanner();
      const coneInnerAngle1 = 360;
      const coneInnerAngle2 = 270;

      target._impl.getConeInnerAngle = sinon.spy(() => coneInnerAngle1);
      target._impl.setConeInnerAngle = sinon.spy();

      assert(target.coneInnerAngle === coneInnerAngle1);
      assert(target._impl.getConeInnerAngle.callCount === 1);

      target.coneInnerAngle = coneInnerAngle2;
      assert(target._impl.setConeInnerAngle.callCount === 1);
      assert(target._impl.setConeInnerAngle.args[0][0] === coneInnerAngle2);
    });

    it(".coneOuterAngle=", () => {
      const context = new AudioContext();
      const target = context.createSpatialPanner();
      const coneOuterAngle1 = 360;
      const coneOuterAngle2 = 270;

      target._impl.getConeOuterAngle = sinon.spy(() => coneOuterAngle1);
      target._impl.setConeOuterAngle = sinon.spy();

      assert(target.coneOuterAngle === coneOuterAngle1);
      assert(target._impl.getConeOuterAngle.callCount === 1);

      target.coneOuterAngle = coneOuterAngle2;
      assert(target._impl.setConeOuterAngle.callCount === 1);
      assert(target._impl.setConeOuterAngle.args[0][0] === coneOuterAngle2);
    });

    it(".coneOuterGain=", () => {
      const context = new AudioContext();
      const target = context.createSpatialPanner();
      const coneOuterGain1 = 0;
      const coneOuterGain2 = 0.25;

      target._impl.getConeOuterGain = sinon.spy(() => coneOuterGain1);
      target._impl.setConeOuterGain = sinon.spy();

      assert(target.coneOuterGain === coneOuterGain1);
      assert(target._impl.getConeOuterGain.callCount === 1);

      target.coneOuterGain = coneOuterGain2;
      assert(target._impl.setConeOuterGain.callCount === 1);
      assert(target._impl.setConeOuterGain.args[0][0] === coneOuterGain2);
    });
  });
});
