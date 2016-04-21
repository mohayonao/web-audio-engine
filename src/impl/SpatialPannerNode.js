"use strict";

const util = require("../util");
const BasePannerNode = require("./BasePannerNode");
const SpatialPannerNodeDSP = require("./dsp/SpatialPannerNode");

class SpatialPannerNode extends BasePannerNode {
  /**
   * @param {AudioContext}
   */
  constructor(context) {
    super(context);
    this._positionX = this.addParam("audio", 0);
    this._positionY = this.addParam("audio", 0);
    this._positionZ = this.addParam("audio", 0);
    this._orientationX = this.addParam("audio", 0);
    this._orientationY = this.addParam("audio", 0);
    this._orientationZ = this.addParam("audio", 0);
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

module.exports = util.mixin(SpatialPannerNode, SpatialPannerNodeDSP);
