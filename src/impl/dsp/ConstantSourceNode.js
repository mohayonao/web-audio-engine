"use strict";

const fill = require("../../util/fill");

const ConstantSourceNode = {
  dspInit() {},

  dspProcess() {
    const offsetParam = this._offset;
    const outputBus = this.outputs[0].bus;
    const outputs = outputBus.getMutableData();

    if (offsetParam.hasSampleAccurateValues()) {
      outputs[0].set(offsetParam.getSampleAccurateValues());
    } else {
      fill(outputs[0], offsetParam.getValue());
    }
  }
};

module.exports = ConstantSourceNode;
