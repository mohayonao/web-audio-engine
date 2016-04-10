"use strict";

const AudioNode = require("../AudioNode");

class ChannelMergerNode extends AudioNode {
  dspProcess() {
    const outputBus = this.getOutput(0).getAudioBus();
    const inputBuses = this._inputs.map(input => input.getAudioBus());
    const allSilent = inputBuses.every(inputBus => inputBus.isSilent());

    outputBus.zeros();

    if (!allSilent) {
      const outputChannelData = outputBus.getMutableData();

      for (let i = 0, imax = inputBuses.length; i < imax; i++) {
        outputChannelData[i].set(inputBuses[i].getChannelData()[0]);
      }
    }
  }
}

module.exports = ChannelMergerNode;
