"use strict";

const impl = require("../impl");
const AudioNode = require("./AudioNode");

class ChannelMergerNode extends AudioNode {
  constructor(context, opts) {
    super(context);

    this._impl = new impl.ChannelMergerNode(context._impl, opts);
  }
}

module.exports = ChannelMergerNode;
