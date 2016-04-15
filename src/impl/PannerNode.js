"use strict";

const util = require("../util");
const BasePannerNode = require("./BasePannerNode");
const PannerNodeDSP = require("./dsp/PannerNode");

class PannerNode extends BasePannerNode {
  constructor(context) {
    super(context);
  }

  /* istanbul ignore next */
  setPosition() {
    throw new TypeError("NOT YET IMPLEMENTED");
  }

  /* istanbul ignore next */
  setOrientation() {
    throw new TypeError("NOT YET IMPLEMENTED");
  }

  /* istanbul ignore next */
  setVelocity() {
    throw new TypeError("NOT YET IMPLEMENTED");
  }
}

module.exports = util.mixin(PannerNode, PannerNodeDSP);
