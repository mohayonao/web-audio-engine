"use strict";

const util = require("../util");
const AudioNode = require("./AudioNode");
const { CLAMPED_MAX, EXPLICIT } = require("../constants/ChannelCountMode");

const PanningModelTypes = [ "equalpower", "HRTF" ];
const DistanceModelTypes = [ "linear", "inverse", "exponential" ];

const DEFAULT_PANNING_MODEL = "equalpower";
const DEFAULT_DISTANCE_MODEL = "inverse";
const DEFAULT_REF_DISTANCE = 1;
const DEFAULT_MAX_DISTANCE = 10000;
const DEFAULT_ROLLOFF_FACTOR = 1;
const DEFAULT_CONE_INNER_ANGLE = 360;
const DEFAULT_CONE_OUTER_ANGLE = 360;
const DEFAULT_CONE_OUTER_GAIN = 0;

class BasePannerNode extends AudioNode {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {string}       opts.panningModel
   * @param {string}       opts.distanceModel
   * @param {number}       opts.refDistance
   * @param {number}       opts.maxDistance
   * @param {number}       opts.rolloffFactor
   * @param {number}       opts.coneInnerAngle
   * @param {number}       opts.coneOuterAngle
   * @param {number}       opts.coneOuterGain
   */
  constructor(context, opts = {}) {
    let panningModel = util.defaults(opts.panningModel, DEFAULT_PANNING_MODEL);
    let distanceModel = util.defaults(opts.distanceModel, DEFAULT_DISTANCE_MODEL);
    let refDistance = util.defaults(opts.refDistance, DEFAULT_REF_DISTANCE);
    let maxDistance = util.defaults(opts.maxDistance, DEFAULT_MAX_DISTANCE);
    let rolloffFactor = util.defaults(opts.rolloffFactor, DEFAULT_ROLLOFF_FACTOR);
    let coneInnerAngle = util.defaults(opts.coneInnerAngle, DEFAULT_CONE_INNER_ANGLE);
    let coneOuterAngle = util.defaults(opts.coneOuterAngle, DEFAULT_CONE_OUTER_ANGLE);
    let coneOuterGain = util.defaults(opts.coneOuterGain, DEFAULT_CONE_OUTER_GAIN);

    super(context, opts, {
      inputs: [ 1 ],
      outputs: [ 2 ],
      channelCount: 2,
      channelCountMode: CLAMPED_MAX,
      allowedMaxChannelCount: 2,
      allowedChannelCountMode: [ CLAMPED_MAX, EXPLICIT ]
    });

    this._panningModel = panningModel;
    this._distanceModel = distanceModel;
    this._refDistance = refDistance;
    this._maxDistance = maxDistance;
    this._rolloffFactor = rolloffFactor;
    this._coneInnerAngle = coneInnerAngle;
    this._coneOuterAngle = coneOuterAngle;
    this._coneOuterGain = coneOuterGain;
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
