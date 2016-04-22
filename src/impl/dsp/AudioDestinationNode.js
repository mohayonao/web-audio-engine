"use strict";

const AudioDestinationDSP = {
  dspProcess() {
    this.outputBus.copyFrom(this.inputs[0].bus);
  }
};

module.exports = AudioDestinationDSP;
