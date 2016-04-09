"use strict";

const EventTarget = require("./EventTarget");

class AudioNode extends EventTarget {
  constructor(context) {
    super();

    this._context = context;
    this._impl = null;
  }

  get context() {
    return this._context;
  }

  get numberOfInputs() {
    return this._impl.getNumberOfInputs();
  }

  get numberOfOutputs() {
    return this._impl.getNumberOfOutputs();
  }

  get channelCount() {
    return this._impl.getChannelCount();
  }

  set channelCount(value) {
    this._impl.setChannelCount(value);
  }

  get channelCountMode() {
    return this._impl.getChannelCountMode();
  }

  set channelCountMode(value) {
    this._impl.setChannelCountMode(value);
  }

  get channelInterpretation() {
    return this._impl.getChannelInterpretation();
  }

  set channelInterpretation(value) {
    return this._impl.setChannelInterpretation(value);
  }

  connect(destination, input, output) {
    this._impl.connect(destination._impl, input, output);

    /* istanbul ignore else */
    if (destination instanceof AudioNode) {
      return destination;
    }
  }

  disconnect() {
    this._impl.disconnect.apply(this._impl, arguments);
  }
}

module.exports = AudioNode;
