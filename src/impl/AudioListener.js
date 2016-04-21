"use strict";

class AudioListener {
  /**
   * @param {AudioContext} context
   */
  constructor(context) {
    this.context = context;
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
   * @param {number} xUp
   * @param {number} yUp
   * @param {number} zUp
   */
  /* istanbul ignore next */
  setOrientation() {
    throw new TypeError("NOT YET IMPLEMENTED");
  }
}

module.exports = AudioListener;
