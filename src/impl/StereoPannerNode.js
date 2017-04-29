"use strict";

const util = require("../util");
const BasePannerNode = require("./BasePannerNode");
const StereoPannerNodeDSP = require("./dsp/StereoPannerNode");
const { AUDIO_RATE } = require("../constants/AudioParamRate");

const DEFAULT_PAN = 0;

class StereoPannerNode extends BasePannerNode {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.pan
   */
  constructor(context, opts = {}) {
    let pan = util.defaults(opts.pan, DEFAULT_PAN);

    super(context, opts);

    this._pan = this.addParam(AUDIO_RATE, pan);
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
