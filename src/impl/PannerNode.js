"use strict";

const BasePannerNode = require("./BasePannerNode");

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

  dspProcess() {
    const inputBus = this.getInput(0).getAudioBus();
    const outputBus = this.getOutput(0).getAudioBus();

    outputBus.zeros();
    outputBus.sumFrom(inputBus);
  }
}

module.exports = PannerNode;
