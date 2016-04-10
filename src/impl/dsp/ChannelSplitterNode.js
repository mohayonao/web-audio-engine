"use strict";

const AudioNode = require("../AudioNode");

class ChannelSplitterNode extends AudioNode {
  dspProcess() {
    const inputBus = this.getInput(0).getAudioBus();
    const outputs = this._outputs;

    if (inputBus.isSilent()) {
      for (let i = 0, imax = outputs.length; i < imax; i++) {
        outputs[i].getAudioBus().zeros();
      }
    } else {
      const inputChannelData = inputBus.getChannelData();

      for (let i = 0, imax = outputs.length; i < imax; i++) {
        const outputBus = outputs[i].getAudioBus();

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
