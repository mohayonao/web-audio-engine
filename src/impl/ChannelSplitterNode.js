"use strict";

const util = require("../util");
const AudioNode = require("./AudioNode");
const ChannelSplitterNodeDSP = require("./dsp/ChannelSplitterNode");
const { MAX } = require("../constants/ChannelCountMode");

const DEFAULT_NUMBER_OF_OUTPUTS = 6;

class ChannelSplitterNode extends AudioNode {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.numberOfOutputs
   */
  constructor(context, opts = {}) {
    let numberOfOutputs = util.defaults(opts.numberOfOutputs, DEFAULT_NUMBER_OF_OUTPUTS);

    numberOfOutputs = util.toValidNumberOfChannels(numberOfOutputs);

    super(context, opts, {
      inputs: [ 1 ],
      outputs: new Array(numberOfOutputs).fill(1),
      channelCount: 2,
      channelCountMode: MAX
    });
  }
}

Object.assign(ChannelSplitterNode.prototype, ChannelSplitterNodeDSP);

module.exports = ChannelSplitterNode;
