"use strict";

const BasePannerNode = require("./BasePannerNode");
const SpatialPannerNodeDSP = require("./dsp/SpatialPannerNode");
const { AUDIO_RATE } = require("../constants/AudioParamRate");

class SpatialPannerNode extends BasePannerNode {
  /**
   * @param {AudioContext}
   */
  constructor(context) {
    super(context);
    this._positionX = this.addParam(AUDIO_RATE, 0);
    this._positionY = this.addParam(AUDIO_RATE, 0);
    this._positionZ = this.addParam(AUDIO_RATE, 0);
    this._orientationX = this.addParam(AUDIO_RATE, 0);
    this._orientationY = this.addParam(AUDIO_RATE, 0);
    this._orientationZ = this.addParam(AUDIO_RATE, 0);
  }

  /**
   * @param {AudioParam}
   */
  getPositionX() {
    return this._positionX;
  }

  /**
   * @param {AudioParam}
   */
  getPositionY() {
    return this._positionY;
  }

  /**
   * @param {AudioParam}
   */
  getPositionZ() {
    return this._positionZ;
  }

  /**
   * @param {AudioParam}
   */
  getOrientationX() {
    return this._positionX;
  }

  /**
   * @param {AudioParam}
   */
  getOrientationY() {
    return this._positionY;
  }

  /**
   * @param {AudioParam}
   */
  getOrientationZ() {
    return this._positionZ;
  }
}

Object.assign(SpatialPannerNode.prototype, SpatialPannerNodeDSP);

module.exports = SpatialPannerNode;
