"use strict";

const AudioNode = require("./AudioNode");
const GainNodeDSP = require("./dsp/GainNode");

class GainNode extends AudioNode {
  /**
   * @param {AudioContext} context
   */
  constructor(context) {
    super(context, {
      inputs: [ 1 ],
      outputs: [ 1 ],
      channelCount: 2,
      channelCountMode: "max"
    });
    this._gain = this.addParam("audio", 1);
  }

  /**
   * @return {AudioParam}
   */
  getGain() {
    return this._gain;
  }

  /**
   * @param {number} numberOfChannels
   */
  channelDidUpdate(numberOfChannels) {
    this.outputs[0].setNumberOfChannels(numberOfChannels);
  }
}

Object.assign(GainNode.prototype, GainNodeDSP);

module.exports = GainNode;
