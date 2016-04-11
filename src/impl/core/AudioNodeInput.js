"use strict";

const assert = require("power-assert");
const util = require("../../util");
const AudioBus = require("./AudioBus");

class AudioNodeInput {
  constructor(opts) {
    let node = opts.node;
    let index = opts.index;
    let numberOfChannels = opts.numberOfChannels;
    let channelCount = opts.channelCount;
    let channelCountMode = opts.channelCountMode;

    this.node = node;
    this.index = index|0;
    this._audioBus = new AudioBus(numberOfChannels, node.processingSizeInFrames, node.sampleRate);
    this._audioBus.setChannelInterpretation("speakers");
    this._channelCount = channelCount|0;
    this._channelCountMode = channelCountMode;
    this._outputs = [];
    this._disabledOutputs = [];
  }

  getAudioBus() {
    return this._audioBus;
  }

  getChannelCount() {
    return this._channelCount;
  }

  setChannelCount(value) {
    const channelCount = util.toValidNumberOfChannels(value);

    /* istanbul ignore else */
    if (channelCount !== this._channelCount) {
      this._channelCount = channelCount;
      this.updateNumberOfChannels();
    }
  }

  getChannelCountMode() {
    return this._channelCountMode;
  }

  setChannelCountMode(value) {
    /* istanbul ignore else */
    if (value !== this._channelCountMode && isValidChannelCountMode(value)) {
      this._channelCountMode = value;
      this.updateNumberOfChannels();
    }
  }

  getChannelInterpretation() {
    return this._audioBus.getChannelInterpretation();
  }

  setChannelInterpretation(value) {
    this._audioBus.setChannelInterpretation(value);
  }

  getNumberOfChannels() {
    return this._audioBus.getNumberOfChannels();
  }

  computeNumberOfChannels() {
    if (this._channelCountMode === "explicit") {
      return this._channelCount;
    }

    const maxChannels = this._outputs.reduce((maxChannels, output) => {
      return Math.max(maxChannels, output.getNumberOfChannels());
    }, 1);

    if (this._channelCountMode === "clamped-max") {
      return Math.min(this._channelCount, maxChannels);
    }

    return maxChannels;
  }

  updateNumberOfChannels() {
    const numberOfChannels = this.computeNumberOfChannels();

    /* istanbul ignore else */
    if (numberOfChannels !== this._audioBus.getNumberOfChannels()) {
      this._audioBus.setNumberOfChannels(numberOfChannels);
      this.node.channelDidUpdate(numberOfChannels);
    }
  }

  getNumberOfConnections() {
    return this._outputs.length + this._disabledOutputs.length;
  }

  getNumberOfFanOuts() {
    return this._outputs.length;
  }

  isEnabled() {
    return this._outputs.length !== 0;
  }

  enableFrom(output) {
    /* istanbul ignore else */
    if (moveItem(output, this._disabledOutputs, this._outputs)) {
      this.inputDidUpdate();
    }
  }

  disableFrom(output) {
    /* istanbul ignore else */
    if (moveItem(output, this._outputs, this._disabledOutputs)) {
      this.inputDidUpdate();
    }
  }

  connectFrom(output) {
    if (output.isEnabled()) {
      assert(this._disabledOutputs.indexOf(output) === -1);
      /* istanbul ignore else */
      if (addItem(output, this._outputs)) {
        this.inputDidUpdate();
      }
    } else {
      assert(this._outputs.indexOf(output) === -1);
      addItem(output, this._disabledOutputs);
    }
  }

  disconnectFrom(output) {
    if (output.isEnabled()) {
      assert(this._disabledOutputs.indexOf(output) === -1);
      /* istanbul ignore else */
      if (removeItem(output, this._outputs)) {
        this.inputDidUpdate();
      }
    } else {
      assert(this._outputs.indexOf(output) === -1);
      removeItem(output, this._disabledOutputs);
    }
  }

  inputDidUpdate() {
    this.updateNumberOfChannels();
    if (this._outputs.length === 0) {
      this.node.disableOutputsIfNecessary();
    } else {
      this.node.enableOutputsIfNecessary();
    }
  }

  isConnectedFrom() {
    const args = Array.from(arguments);

    if (args.length === 1) {
      const hasTarget = target => target.node === args[0];

      return this._outputs.some(hasTarget) || this._disabledOutputs.some(hasTarget);
    }
    if (args.length === 2) {
      const hasTarget = target => target.node === args[0] && target.index === args[1];

      return this._outputs.some(hasTarget) || this._disabledOutputs.some(hasTarget);
    }

    return false;
  }

  sumAllConnections(e) {
    const audioBus = this._audioBus;
    const outputs = this._outputs;

    audioBus.zeros();

    for (let i = 0, imax = outputs.length; i < imax; i++) {
      audioBus.sumFrom(outputs[i].pull(e));
    }

    return audioBus;
  }

  pull(e) {
    if (this._outputs.length === 1) {
      const output = this._outputs[0];

      /* istanbul ignore else */
      if (output.getNumberOfChannels() === this.getNumberOfChannels()) {
        return this._audioBus.copyFrom(output.pull(e));
      }
    }

    return this.sumAllConnections(e);
  }
}

function addItem(target, destination) {
  const index = destination.indexOf(target);

  /* istanbul ignore next */
  if (index !== -1) {
    return false;
  }

  destination.push(target);

  return true;
}

function removeItem(target, source) {
  const index = source.indexOf(target);

  /* istanbul ignore next */
  if (index === -1) {
    return false;
  }

  source.splice(index, 1);

  return true;
}

function moveItem(target, source, destination) {
  const index = source.indexOf(target);

  /* istanbul ignore next */
  if (index === -1) {
    return false;
  }

  source.splice(index, 1);
  destination.push(target);

  return true;
}

function isValidChannelCountMode(value) {
  return value === "max" || value === "clamped-max" || value === "explicit";
}

module.exports = AudioNodeInput;
