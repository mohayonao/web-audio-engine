"use strict";

const impl = require("../impl");
const AudioNode = require("./AudioNode");
const AudioParam = require("./AudioParam");

class DynamicsCompressorNode extends AudioNode {
  constructor(context, opts) {
    super(context);

    this._impl = new impl.DynamicsCompressorNode(context._impl, opts);
    this._impl.$threshold = new AudioParam(context, this._impl.getThreshold());
    this._impl.$knee = new AudioParam(context, this._impl.getKnee());
    this._impl.$ratio = new AudioParam(context, this._impl.getRatio());
    this._impl.$attack = new AudioParam(context, this._impl.getAttack());
    this._impl.$release = new AudioParam(context, this._impl.getRelease());
  }

  get threshold() {
    return this._impl.$threshold;
  }

  get knee() {
    return this._impl.$knee;
  }

  get ratio() {
    return this._impl.$ratio;
  }

  get reduction() {
    return this._impl.getReduction();
  }

  get attack() {
    return this._impl.$attack;
  }

  get release() {
    return this._impl.$release;
  }
}

module.exports = DynamicsCompressorNode;
