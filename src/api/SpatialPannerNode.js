"use strict";

const impl = require("../impl");
const AudioNode = require("./AudioNode");
const AudioParam = require("./AudioParam");

class SpatialPannerNode extends AudioNode {
  constructor(context) {
    super(context);

    this._impl = new impl.SpatialPannerNode(context._impl);
    this._impl.$positionX = new AudioParam(context, this._impl.getPositionX());
    this._impl.$positionY = new AudioParam(context, this._impl.getPositionY());
    this._impl.$positionZ = new AudioParam(context, this._impl.getPositionZ());
    this._impl.$orientationX = new AudioParam(context, this._impl.getOrientationX());
    this._impl.$orientationY = new AudioParam(context, this._impl.getOrientationY());
    this._impl.$orientationZ = new AudioParam(context, this._impl.getOrientationZ());
  }

  get panningModel() {
    return this._impl.getPanningModel();
  }

  set panningModel(value) {
    this._impl.setPanningModel(value);
  }

  get positionX() {
    return this._impl.$positionX;
  }

  get positionY() {
    return this._impl.$positionY;
  }

  get positionZ() {
    return this._impl.$positionZ;
  }

  get orientationX() {
    return this._impl.$orientationX;
  }

  get orientationY() {
    return this._impl.$orientationY;
  }

  get orientationZ() {
    return this._impl.$orientationZ;
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
}

module.exports = SpatialPannerNode;
