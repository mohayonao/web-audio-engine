"use strict";

const assert = require("assert");
const util = require("../../util");
const AudioBus = require("./AudioBus");
const { CLAMPED_MAX, EXPLICIT } = require("../../constants/ChannelCountMode");
const { SPEAKERS } = require("../../constants/ChannelInterpretation");

/**
 * @prop {AudioNode} node
 * @prop {number}    index
 * @prop {AudioBus}  bus
 */
class AudioNodeInput {
  /**
   * @param {object}    opts
   * @param {AudioNode} opts.node
   * @param {number}    opts.index
   * @param {number}    opts.numberOfChannels
   * @param {number}    opts.channelCount
   * @param {string}    opts.channelCountMode
   */
  constructor(opts) {
    let node = opts.node;
    let index = opts.index;
    let numberOfChannels = opts.numberOfChannels;
    let channelCount = opts.channelCount;
    let channelCountMode = opts.channelCountMode;

    this.node = node;
    this.index = index|0;
    this.bus = new AudioBus(numberOfChannels, node.blockSize, node.sampleRate);

    this.bus.setChannelInterpretation(SPEAKERS);
    this.outputs = [];
    this._disabledOutputs = new WeakSet();
    this._channelCount = channelCount|0;
    this._channelCountMode = channelCountMode;
  }

  /**
   * @return {number}
   */
  getChannelCount() {
    return this._channelCount;
  }

  /**
   * @param {number} value
   */
  setChannelCount(value) {
    const channelCount = util.toValidNumberOfChannels(value);

    /* istanbul ignore else */
    if (channelCount !== this._channelCount) {
      this._channelCount = channelCount;
      this.updateNumberOfChannels();
    }
  }

  /**
   * @return {number}
   */
  getChannelCountMode() {
    return this._channelCountMode;
  }

  /**
   * @param {number} value
   */
  setChannelCountMode(value) {
    /* istanbul ignore else */
    if (value !== this._channelCountMode) {
      this._channelCountMode = value;
      this.updateNumberOfChannels();
    }
  }

  /**
   * @return {string}
   */
  getChannelInterpretation() {
    return this.bus.getChannelInterpretation();
  }

  /**
   * @param {string} value
   */
  setChannelInterpretation(value) {
    this.bus.setChannelInterpretation(value);
  }

  /**
   * @return {number}
   */
  getNumberOfChannels() {
    return this.bus.getNumberOfChannels();
  }

  /**
   *
   */
  computeNumberOfChannels() {
    if (this._channelCountMode === EXPLICIT) {
      return this._channelCount;
    }

    const maxChannels = this.outputs.reduce((maxChannels, output) => {
      return Math.max(maxChannels, output.getNumberOfChannels());
    }, 1);

    if (this._channelCountMode === CLAMPED_MAX) {
      return Math.min(this._channelCount, maxChannels);
    }

    return maxChannels;
  }

  /**
   *
   */
  updateNumberOfChannels() {
    const numberOfChannels = this.computeNumberOfChannels();

    /* istanbul ignore else */
    if (numberOfChannels !== this.bus.getNumberOfChannels()) {
      this.bus.setNumberOfChannels(numberOfChannels);
      this.node.channelDidUpdate(numberOfChannels);
    }
  }

  /**
   * @return {boolean}
   */
  isEnabled() {
    return this.outputs.length !== 0;
  }

  /**
   * @param {AudioNodeOutput} output
   */
  enableFrom(output) {
    /* istanbul ignore else */
    if (moveItem(output, this._disabledOutputs, this.outputs)) {
      this.inputDidUpdate();
    }
  }

  /**
   * @param {AudioNodeOutput} output
   */
  disableFrom(output) {
    /* istanbul ignore else */
    if (moveItem(output, this.outputs, this._disabledOutputs)) {
      this.inputDidUpdate();
    }
  }

  /**
   * @param {AudioNodeOutput} output
   */
  connectFrom(output) {
    if (output.isEnabled()) {
      assert(!this._disabledOutputs.has(output));
      /* istanbul ignore else */
      if (addItem(output, this.outputs)) {
        this.inputDidUpdate();
      }
    } else {
      assert(this.outputs.indexOf(output) === -1);
      addItem(output, this._disabledOutputs);
    }
  }

  /**
   * @param {AudioNodeOutput} output
   */
  disconnectFrom(output) {
    if (output.isEnabled()) {
      assert(!this._disabledOutputs.has(output));
      /* istanbul ignore else */
      if (removeItem(output, this.outputs)) {
        this.inputDidUpdate();
      }
    } else {
      assert(this.outputs.indexOf(output) === -1);
      removeItem(output, this._disabledOutputs);
    }
  }

  /**
   *
   */
  inputDidUpdate() {
    this.updateNumberOfChannels();
    if (this.outputs.length === 0) {
      this.node.disableOutputsIfNecessary();
    } else {
      this.node.enableOutputsIfNecessary();
    }
  }

  /**
   * @return {boolean}
   */
  isConnectedFrom(node) {
    return this.outputs.some(target => target.node === node) ||
      !!(node && Array.isArray(node.outputs) && node.outputs.some(target => this._disabledOutputs.has(target)));
  }

  /**
   * @return {AudioBus}
   */
  sumAllConnections() {
    const audioBus = this.bus;
    const outputs = this.outputs;

    audioBus.zeros();

    for (let i = 0, imax = outputs.length; i < imax; i++) {
      audioBus.sumFrom(outputs[i].pull());
    }

    return audioBus;
  }

  /**
   * @return {AudioBus}
   */
  pull() {
    if (this.outputs.length === 1) {
      const output = this.outputs[0];

      /* istanbul ignore else */
      if (output.getNumberOfChannels() === this.getNumberOfChannels()) {
        return this.bus.copyFrom(output.pull());
      }
    }

    return this.sumAllConnections();
  }
}

function addItem(target, destination) {
  if (destination instanceof WeakSet) {
    /* istanbul ignore next */
    if (destination.has(target)) {
      return false;
    }
    destination.add(target);
  } else {
    const index = destination.indexOf(target);

    /* istanbul ignore next */
    if (index !== -1) {
      return false;
    }
    destination.push(target);
  }
  return true;
}

function removeItem(target, source) {
  if (source instanceof WeakSet) {
    /* istanbul ignore next */
    if (!source.has(target)) {
      return false;
    }
    source.delete(target);
  } else {
    const index = source.indexOf(target);

    /* istanbul ignore next */
    if (index === -1) {
      return false;
    }
    source.splice(index, 1);
  }
  return true;
}

function moveItem(target, source, destination) {
  return removeItem(target, source) && addItem(target, destination);
}

module.exports = AudioNodeInput;
