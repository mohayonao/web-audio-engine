"use strict";

const BasePannerNode = require("../BasePannerNode");

class PannerNode extends BasePannerNode {
  dspProcess() {
    const outputBus = this.outputs[0].bus;

    outputBus.zeros();
    outputBus.sumFrom(this.inputs[0].bus);
  }
}

module.exports = PannerNode;
