"use strict";

const AnalyserNodeDSP = {
  dspProcess() {
    this.outputs[0].bus.copyFrom(this.inputs[0].bus);
  }
};

module.exports = AnalyserNodeDSP;
