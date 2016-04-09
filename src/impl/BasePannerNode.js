"use strict";

const util = require("../_util");
const AudioNode = require("./AudioNode");

const PanningModelTypes = [ "equalpower", "HRTF" ];
const DistanceModelTypes = [ "linear", "inverse", "exponential" ];

class BasePannerNode extends AudioNode {
  constructor(context) {
    super(context, {
      inputs: [ 1 ],
      outputs: [ 2 ],
      channelCount: 2,
      channelCountMode: "clamped-max"
    });
    this._panningModel = "equalpower";
    this._distanceModel = "inverse";
    this._refDistance = 1;
    this._maxDistance = 10000;
    this._rolloffFactor = 1;
    this._coneInnerAngle = 360;
    this._coneOuterAngle = 360;
    this._coneOuterGain = 0;
  }

  setChannelCount(value) {
    value = util.clip(value|0, 1, 2);
    super.setChannelCount(value);
  }

  setChannelCountMode(value) {
    /* istanbul ignore else */
    if (value === "clamped-max" || value === "explicit") {
      super.setChannelCountMode(value);
    }
  }

  getPanningModel() {
    return this._panningModel;
  }

  setPanningModel(value) {
    /* istanbul ignore else */
    if (PanningModelTypes.indexOf(value) !== -1) {
      this._panningModel = value;
    }
  }

  getDistanceModel() {
    return this._distanceModel;
  }

  setDistanceModel(value) {
    /* istanbul ignore else */
    if (DistanceModelTypes.indexOf(value) !== -1) {
      this._distanceModel = value;
    }
  }

  getRefDistance() {
    return this._refDistance;
  }

  setRefDistance(value) {
    this._refDistance = util.toNumber(value);
  }

  getMaxDistance() {
    return this._maxDistance;
  }

  setMaxDistance(value) {
    this._maxDistance = util.toNumber(value);
  }

  getRolloffFactor() {
    return this._rolloffFactor;
  }

  setRolloffFactor(value) {
    this._rolloffFactor = util.toNumber(value);
  }

  getConeInnerAngle() {
    return this._coneInnerAngle;
  }

  setConeInnerAngle(value) {
    this._coneInnerAngle = util.toNumber(value);
  }

  getConeOuterAngle() {
    return this._coneOuterAngle;
  }

  setConeOuterAngle(value) {
    this._coneOuterAngle = util.toNumber(value);
  }

  getConeOuterGain() {
    return this._coneOuterGain;
  }

  setConeOuterGain(value) {
    this._coneOuterGain = util.toNumber(value);
  }
}

module.exports = BasePannerNode;
