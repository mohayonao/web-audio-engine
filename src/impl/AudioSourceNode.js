"use strict";

const assert = require("assert");
const AudioNode = require("./AudioNode");

/* istanbul ignore next */
class AudioSourceNode extends AudioNode {
  /**
   * @param {AudioContext} context
   */
  constructor(context) {
    super(context, {
      inputs: [],
      outputs: [ 1 ]
    });
  }

  enableOutputsIfNecessary() {
    assert(!"SHOULD NOT BE CALLED");
  }

  disableOutputsIfNecessary() {
    assert(!"SHOULD NOT BE CALLED");
  }
}

module.exports = AudioSourceNode;
