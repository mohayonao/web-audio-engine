"use strict";

const BasePannerNode = require("../BasePannerNode");

class SpatialPannerNode extends BasePannerNode {
  dspProcess() {
    const outputBus = this.outputs[0].bus;

    outputBus.zeros();
    outputBus.sumFrom(this.inputs[0].bus);
  }
}

module.exports = SpatialPannerNode;
