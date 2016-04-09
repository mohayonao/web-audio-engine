"use strict";

const impl = require("../impl");
const AudioNode = require("./AudioNode");

class ChannelSplitterNode extends AudioNode {
  constructor(context, opts) {
    super(context);

    this._impl = new impl.ChannelSplitterNode(context._impl, opts);
  }
}

module.exports = ChannelSplitterNode;
