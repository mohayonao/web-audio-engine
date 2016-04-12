"use strict";

const assert = require("assert");
const AudioNode = require("./AudioNode");

/* istanbul ignore next */
class AudioSourceNode extends AudioNode {
  constructor(context) {
    super(context, {
      inputs: [],
      outputs: [ 1 ]
    });
  }

  getChannelCount() {
    return 0;
  }

  setChannelCount() {}

  getChannelCountMode() {
    return "explicit";
  }

  setChannelCountMode() {}

  getChannelInterpretation() {
    return "discrete";
  }

  setChannelInterpretation() {}

  enableOutputsIfNecessary() {
    assert(!"SHOULD NOT BE CALLED");
  }

  disableOutputsIfNecessary() {
    assert(!"SHOULD NOT BE CALLED");
  }
}

module.exports = AudioSourceNode;
