"use strict";

const BasePannerNode = require("./BasePannerNode");
const PannerNodeDSP = require("./dsp/PannerNode");

class PannerNode extends BasePannerNode {
  /**
   * @param {AudioContext} context
   */
  constructor(context) {
    super(context);
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  /* istanbul ignore next */
  setPosition() {
    throw new TypeError("NOT YET IMPLEMENTED");
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  /* istanbul ignore next */
  setOrientation() {
    throw new TypeError("NOT YET IMPLEMENTED");
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  /* istanbul ignore next */
  setVelocity() {
    throw new TypeError("NOT YET IMPLEMENTED");
  }
}

Object.assign(PannerNode.prototype, PannerNodeDSP);

module.exports = PannerNode;
