"use strict";

const AudioNode = require("../AudioNode");

class AudioDestination extends AudioNode {
  dspProcess() {
    this.outputBus.copyFrom(this.inputs[0].bus);
  }
}

module.exports = AudioDestination;
