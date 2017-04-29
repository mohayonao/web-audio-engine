"use strict";

const impl = require("../impl");
const AudioNode = require("./AudioNode");

class PannerNode extends AudioNode {
  constructor(context, opts) {
    super(context);

    this._impl = new impl.PannerNode(context._impl, opts);
  }

  get panningModel() {
    return this._impl.getPanningModel();
  }

  set panningModel(value) {
    this._impl.setPanningModel(value);
  }

  get distanceModel() {
    return this._impl.getDistanceModel();
  }

  set distanceModel(value) {
    this._impl.setDistanceModel(value);
  }

  get refDistance() {
    return this._impl.getRefDistance();
  }

  set refDistance(value) {
    this._impl.setRefDistance(value);
  }

  get maxDistance() {
    return this._impl.getMaxDistance();
  }

  set maxDistance(value) {
    this._impl.setMaxDistance(value);
  }

  get rolloffFactor() {
    return this._impl.getRolloffFactor();
  }

  set rolloffFactor(value) {
    this._impl.setRolloffFactor(value);
  }

  get coneInnerAngle() {
    return this._impl.getConeInnerAngle();
  }

  set coneInnerAngle(value) {
    this._impl.setConeInnerAngle(value);
  }

  get coneOuterAngle() {
    return this._impl.getConeOuterAngle();
  }

  set coneOuterAngle(value) {
    this._impl.setConeOuterAngle(value);
  }

  get coneOuterGain() {
    return this._impl.getConeOuterGain();
  }

  set coneOuterGain(value) {
    this._impl.setConeOuterGain(value);
  }

  setPosition(x, y, z) {
    this._impl.setPosition(x, y, z);
  }

  setOrientation(x, y, z) {
    this._impl.setOrientation(x, y, z);
  }

  setVelocity(x, y, z) {
    this._impl.setVelocity(x, y, z);
  }
}

module.exports = PannerNode;
