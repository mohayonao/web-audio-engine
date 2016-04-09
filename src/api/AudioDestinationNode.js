"use strict";

const AudioNode = require("./AudioNode");

class AudioDestinationNode extends AudioNode {
  constructor(context, impl) {
    super(context);

    this._impl = impl;
  }

  get maxChannelCount() {
    return this._impl.getMaxChannelCount();
  }
}

module.exports = AudioDestinationNode;
