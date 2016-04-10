"use strict";

const util = require("../_util");
const AudioNode = require("./AudioNode");
const ChannelSplitterNodeDSP = require("./dsp/ChannelSplitterNode");

class ChannelSplitterNode extends AudioNode {
  constructor(context, opts) {
    let numberOfOutputs = opts.numberOfOutputs;

    numberOfOutputs = util.toValidNumberOfChannels(numberOfOutputs || 6);

    super(context, {
      inputs: [ 1 ],
      outputs: new Array(numberOfOutputs).fill(1),
      channelCount: 2,
      channelCountMode: "max"
    });
  }
}

module.exports = util.mixin(ChannelSplitterNode, ChannelSplitterNodeDSP);
