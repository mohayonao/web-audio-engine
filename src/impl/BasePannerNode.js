"use strict";

const util = require("../util");
const AudioNode = require("./AudioNode");

const PanningModelTypes = [ "equalpower", "HRTF" ];
const DistanceModelTypes = [ "linear", "inverse", "exponential" ];

class BasePannerNode extends AudioNode {
  /**
   * @param {AudioContext} context
   */
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

  /**
   * @param {number} value
   */
  setChannelCount(value) {
    value = util.clip(value|0, 1, 2);
    super.setChannelCount(value);
  }

  /**
   * @param {number} value
   */
  setChannelCountMode(value) {
    /* istanbul ignore else */
    if (value === "clamped-max" || value === "explicit") {
      super.setChannelCountMode(value);
    }
  }

  /**
   * @return {string}
   */
  getPanningModel() {
    return this._panningModel;
  }

  /**
   * @param {string} value
   */
  setPanningModel(value) {
    /* istanbul ignore else */
    if (PanningModelTypes.indexOf(value) !== -1) {
      this._panningModel = value;
    }
  }

  /**
   * @return {string}
   */
  getDistanceModel() {
    return this._distanceModel;
  }

  /**
   * @param {string} value
   */
  setDistanceModel(value) {
    /* istanbul ignore else */
    if (DistanceModelTypes.indexOf(value) !== -1) {
      this._distanceModel = value;
    }
  }

  /**
   * @return {number}
   */
  getRefDistance() {
    return this._refDistance;
  }

  /**
   * @param {number} value
   */
  setRefDistance(value) {
    this._refDistance = util.toNumber(value);
  }

  /**
   * @return {number}
   */
  getMaxDistance() {
    return this._maxDistance;
  }

  /**
   * @param {number} value
   */
  setMaxDistance(value) {
    this._maxDistance = util.toNumber(value);
  }

  /**
   * @return {number}
   */
  getRolloffFactor() {
    return this._rolloffFactor;
  }

  /**
   * @param {number} value
   */
  setRolloffFactor(value) {
    this._rolloffFactor = util.toNumber(value);
  }

  /**
   * @return {number}
   */
  getConeInnerAngle() {
    return this._coneInnerAngle;
  }

  /**
   * @param {number} value
   */
  setConeInnerAngle(value) {
    this._coneInnerAngle = util.toNumber(value);
  }

  /**
   * @return {number}
   */
  getConeOuterAngle() {
    return this._coneOuterAngle;
  }

  /**
   * @param {number} value
   */
  setConeOuterAngle(value) {
    this._coneOuterAngle = util.toNumber(value);
  }

  /**
   * @return {number}
   */
  getConeOuterGain() {
    return this._coneOuterGain;
  }

  /**
   * @param {number} value
   */
  setConeOuterGain(value) {
    this._coneOuterGain = util.toNumber(value);
  }
}

module.exports = BasePannerNode;
