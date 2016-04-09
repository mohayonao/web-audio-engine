"use strict";

const BasePannerNode = require("./BasePannerNode");

class SpatialPannerNode extends BasePannerNode {
  constructor(context) {
    super(context);
    this._positionX = this.addParam("audio", 0);
    this._positionY = this.addParam("audio", 0);
    this._positionZ = this.addParam("audio", 0);
    this._orientationX = this.addParam("audio", 0);
    this._orientationY = this.addParam("audio", 0);
    this._orientationZ = this.addParam("audio", 0);
  }

  getPositionX() {
    return this._positionX;
  }

  getPositionY() {
    return this._positionY;
  }

  getPositionZ() {
    return this._positionZ;
  }

  getOrientationX() {
    return this._positionX;
  }

  getOrientationY() {
    return this._positionY;
  }

  getOrientationZ() {
    return this._positionZ;
  }
}

module.exports = SpatialPannerNode;
