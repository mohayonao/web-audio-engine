"use strict";

const AudioParam = require("./AudioParam");

class SpatialListener {
  constructor(context) {
    this.context = context;
    this._positionX = new AudioParam(context, { rate: "audio", defaultValue: 0 });
    this._positionY = new AudioParam(context, { rate: "audio", defaultValue: 0 });
    this._positionZ = new AudioParam(context, { rate: "audio", defaultValue: 0 });
    this._forwardX = new AudioParam(context, { rate: "audio", defaultValue: 0 });
    this._forwardY = new AudioParam(context, { rate: "audio", defaultValue: 0 });
    this._forwardZ = new AudioParam(context, { rate: "audio", defaultValue: 0 });
    this._upX = new AudioParam(context, { rate: "audio", defaultValue: 0 });
    this._upY = new AudioParam(context, { rate: "audio", defaultValue: 0 });
    this._upZ = new AudioParam(context, { rate: "audio", defaultValue: 0 });
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

  getForwardX() {
    return this._forwardX;
  }

  getForwardY() {
    return this._forwardY;
  }

  getForwardZ() {
    return this._forwardZ;
  }

  getUpX() {
    return this._upX;
  }

  getUpY() {
    return this._upY;
  }

  getUpZ() {
    return this._upZ;
  }
}

module.exports = SpatialListener;
