"use strict";

const util = require("../_util");
const AudioNode = require("./AudioNode");

class ChannelMergerNode extends AudioNode {
  constructor(context, opts) {
    let numberOfInputs = opts.numberOfInputs;

    numberOfInputs = util.toValidNumberOfChannels(numberOfInputs || 6);

    super(context, {
      inputs: new Array(numberOfInputs).fill(1),
      outputs: [ numberOfInputs ],
      channelCount: 1,
      channelCountMode: "explicit"
    });
  }

  getChannelCount() {
    return 1;
  }

  setChannelCount() {
    // This node's channelCount cannot be changed.
  }

  getChannelCountMode() {
    return "explicit";
  }

  setChannelCountMode() {
    // This node's channelCountMode cannot be changed.
  }

  getChannelInterpretation() {
    return this._inputs[0].getChannelInterpretation();
  }

  setChannelInterpretation(value) {
    this._inputs.forEach((input) => {
      input.setChannelInterpretation(value);
    });
  }

  disableOutputsIfNecessary() {
    // disable if all inputs are disabled

    /* istanbul ignore else */
    if (this.isEnabled()) {
      const numberOfInputs = this.getNumberOfInputs();

      for (let i = 0; i < numberOfInputs; i++) {
        if (this.getInput(i).isEnabled()) {
          return;
        }
      }

      super.disableOutputsIfNecessary();
    }
  }
}

module.exports = ChannelMergerNode;
