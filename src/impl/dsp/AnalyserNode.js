"use strict";

const AudioNode = require("../AudioNode");

class AnalyserNode extends AudioNode {
  dspProcess() {
    this.outputs[0].bus.copyFrom(this.inputs[0].bus);
  }
}

module.exports = AnalyserNode;
