"use strict";

const util = require("../_util");
const AudioNode = require("./AudioNode");

class ScriptProcessorNode extends AudioNode {
  constructor(context, opts) {
    let bufferSize = opts.bufferSize;
    let numberOfInputChannels = opts.numberOfInputChannels;
    let numberOfOutputChannels = opts.numberOfOutputChannels;

    bufferSize = Math.max(256, Math.min(bufferSize|0, 16384));
    bufferSize = util.toPowerOfTwo(bufferSize, Math.ceil);
    numberOfInputChannels = util.toValidNumberOfChannels(numberOfInputChannels);
    numberOfOutputChannels = util.toValidNumberOfChannels(numberOfOutputChannels);

    super(context, {
      inputs: [ 1 ],
      outputs: [ numberOfOutputChannels ],
      channelCount: numberOfInputChannels,
      channelCountMode: "explicit"
    });
    this._bufferSize = bufferSize;
    this.enableOutputsIfNecessary();
  }

  getBufferSize() {
    return this._bufferSize;
  }

  setChannelCount() {
    // This node's channelCount cannot be changed.
  }

  setChannelCountMode() {
    // This node's channelCountMode cannot be changed.
  }

  disableOutputsIfNecessary() {
    // This node cannot disable.
  }
}

module.exports = ScriptProcessorNode;
