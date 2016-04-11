"use strict";

const util = require("../util");
const AudioNode = require("./AudioNode");
const GainNodeDSP = require("./dsp/GainNode");

class GainNode extends AudioNode {
  constructor(context) {
    super(context, {
      inputs: [ 1 ],
      outputs: [ 1 ],
      channelCount: 2,
      channelCountMode: "max"
    });
    this._gain = this.addParam("audio", 1);
  }

  getGain() {
    return this._gain;
  }

  channelDidUpdate(numberOfChannels) {
    this.getOutput(0).setNumberOfChannels(numberOfChannels);
  }
}

module.exports = util.mixin(GainNode, GainNodeDSP);
