"use strict";

const util = require("../_util");
const AudioNode = require("./AudioNode");

class DelayNode extends AudioNode {
  constructor(context, opts) {
    let maxDelayTime = opts.maxDelayTime;

    super(context, {
      inputs: [ 1 ],
      outputs: [ 1 ],
      channelCount: 2,
      channelCountMode: "max"
    });
    this._maxDelayTime = Math.max(0, util.toNumber(maxDelayTime) || 1);
    this._delay = this.addParam("audio", 0);
  }

  getDelay() {
    return this._delay;
  }

  getMaxDelayTime() {
    return this._maxDelayTime;
  }

  channelDidUpdate(numberOfChannels) {
    this.getOutput(0).setNumberOfChannels(numberOfChannels);
  }
}

module.exports = DelayNode;
