"use strict";

const AudioNode = require("../AudioNode");

class ChannelSplitterNode extends AudioNode {
  dspProcess() {
    const inputBus = this.inputs[0].bus;
    const outputs = this.outputs;

    if (inputBus.isSilent) {
      for (let i = 0, imax = outputs.length; i < imax; i++) {
        outputs[i].bus.zeros();
      }
    } else {
      const inputChannelData = inputBus.getChannelData();

      for (let i = 0, imax = outputs.length; i < imax; i++) {
        const outputBus = outputs[i].bus;

        if (inputChannelData[i]) {
          outputBus.getMutableData()[0].set(inputChannelData[i]);
        } else {
          outputBus.zeros();
        }
      }
    }
  }
}

module.exports = ChannelSplitterNode;
