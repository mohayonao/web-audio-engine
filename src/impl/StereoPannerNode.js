"use strict";

const util = require("../util");
const BasePannerNode = require("./BasePannerNode");
const StereoPannerNodeDSP = require("./dsp/StereoPannerNode");

class StereoPannerNode extends BasePannerNode {
  constructor(context) {
    super(context);
    this._pan = this.addParam("audio", 0);
  }

  getPan() {
    return this._pan;
  }
}

module.exports = util.mixin(StereoPannerNode, StereoPannerNodeDSP);
