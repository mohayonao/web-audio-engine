"use strict";

const BasePannerNode = require("./BasePannerNode");
const StereoPannerNodeDSP = require("./dsp/StereoPannerNode");
const { AUDIO_RATE } = require("../constants/AudioParamRate");

class StereoPannerNode extends BasePannerNode {
  /**
   * @param {AudioContext} context
   */
  constructor(context) {
    super(context);
    this._pan = this.addParam(AUDIO_RATE, 0);
  }

  /**
   * @param {AudioParam}
   */
  getPan() {
    return this._pan;
  }
}

Object.assign(StereoPannerNode.prototype, StereoPannerNodeDSP);

module.exports = StereoPannerNode;
