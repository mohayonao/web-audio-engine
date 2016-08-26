"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const api = require("../../src/api");
const AudioContext = require("../../src/api/AudioContext");

describe("api/PannerNode", () => {
  it("context.createPanner()", () => {
    const context = new AudioContext();
    const target = context.createPanner();

    assert(target instanceof api.PannerNode);
  });

  describe("attributes", () => {
    it(".panningModel=", () => {
      const context = new AudioContext();
      const target = context.createPanner();
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

    it(".distanceModel=", () => {
      const context = new AudioContext();
      const target = context.createPanner();
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
      const target = context.createPanner();
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
      const target = context.createPanner();
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
      const target = context.createPanner();
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
      const target = context.createPanner();
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
      const target = context.createPanner();
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
      const target = context.createPanner();
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

  describe("methods", () => {
    it(".setPosition(x, y, z)", () => {
      const context = new AudioContext();
      const target = context.createPanner();
      const x = 0;
      const y = 1;
      const z = 2;

      target._impl.setPosition = sinon.spy();

      target.setPosition(x, y, z);
      assert(target._impl.setPosition.callCount === 1);
      assert(target._impl.setPosition.args[0][0] === x);
      assert(target._impl.setPosition.args[0][1] === y);
      assert(target._impl.setPosition.args[0][2] === z);
    });

    it(".setOrientation(x, y, z)", () => {
      const context = new AudioContext();
      const target = context.createPanner();
      const x = 0;
      const y = 1;
      const z = 2;

      target._impl.setOrientation = sinon.spy();

      target.setOrientation(x, y, z);
      assert(target._impl.setOrientation.callCount === 1);
      assert(target._impl.setOrientation.args[0][0] === x);
      assert(target._impl.setOrientation.args[0][1] === y);
      assert(target._impl.setOrientation.args[0][2] === z);
    });

    it(".setVelocity(x, y, z)", () => {
      const context = new AudioContext();
      const target = context.createPanner();
      const x = 0;
      const y = 1;
      const z = 2;

      target._impl.setVelocity = sinon.spy();

      target.setVelocity(x, y, z);
      assert(target._impl.setVelocity.callCount === 1);
      assert(target._impl.setVelocity.args[0][0] === x);
      assert(target._impl.setVelocity.args[0][1] === y);
      assert(target._impl.setVelocity.args[0][2] === z);
    });
  });
});
