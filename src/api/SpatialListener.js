"use strict";

const AudioParam = require("./AudioParam");

class SpatialListener {
  constructor(context, impl) {
    this._context = context;
    this._impl = impl;
    this._impl.$positionX = new AudioParam(context, this._impl.getPositionX());
    this._impl.$positionY = new AudioParam(context, this._impl.getPositionY());
    this._impl.$positionZ = new AudioParam(context, this._impl.getPositionZ());
    this._impl.$forwardX = new AudioParam(context, this._impl.getForwardX());
    this._impl.$forwardY = new AudioParam(context, this._impl.getForwardY());
    this._impl.$forwardZ = new AudioParam(context, this._impl.getForwardZ());
    this._impl.$upX = new AudioParam(context, this._impl.getUpX());
    this._impl.$upY = new AudioParam(context, this._impl.getUpY());
    this._impl.$upZ = new AudioParam(context, this._impl.getUpZ());
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

  get forwardX() {
    return this._impl.$forwardX;
  }

  get forwardY() {
    return this._impl.$forwardY;
  }

  get forwardZ() {
    return this._impl.$forwardZ;
  }

  get upX() {
    return this._impl.$upX;
  }

  get upY() {
    return this._impl.$upY;
  }

  get upZ() {
    return this._impl.$upZ;
  }
}

module.exports = SpatialListener;
