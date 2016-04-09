"use strict";

class AudioListener {
  constructor(context) {
    this.context = context;
  }

  /* istanbul ignore next */
  setPosition() {
    throw new TypeError("NOT YET IMPLEMENTED");
  }

  /* istanbul ignore next */
  setOrientation() {
    throw new TypeError("NOT YET IMPLEMENTED");
  }
}

module.exports = AudioListener;
