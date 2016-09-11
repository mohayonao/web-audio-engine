"use strict";

const util = require("../util");
const AudioNode = require("./AudioNode");
const ChannelMergerNodeDSP = require("./dsp/ChannelMergerNode");
const { EXPLICIT } = require("../constants/ChannelCountMode");

class ChannelMergerNode extends AudioNode {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.numberOfInputs
   */
  constructor(context, /* istanbul ignore next */ opts = {}) {
    let numberOfInputs = util.defaults(opts.numberOfInputs, 6);

    numberOfInputs = util.toValidNumberOfChannels(numberOfInputs);

    super(context, {
      inputs: new Array(numberOfInputs).fill(1),
      outputs: [ numberOfInputs ],
      channelCount: 1,
      channelCountMode: EXPLICIT,
      allowedMaxChannelCount: 1,
      allowedChannelCountMode: [ EXPLICIT ]
    });
  }

  disableOutputsIfNecessary() {
    // disable if all inputs are disabled

    /* istanbul ignore else */
    if (this.isEnabled()) {
      const inputs = this.inputs;

      for (let i = 0, imax = inputs.length; i < imax; i++) {
        if (inputs[i].isEnabled()) {
          return;
        }
      }

      super.disableOutputsIfNecessary();
    }
  }
}

Object.assign(ChannelMergerNode.prototype, ChannelMergerNodeDSP);

module.exports = ChannelMergerNode;
