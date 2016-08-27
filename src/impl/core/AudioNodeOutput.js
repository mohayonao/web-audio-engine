"use strict";

const AudioBus = require("./AudioBus");

/**
 * @prop {AudioNode} node
 * @prop {number}    index
 * @prop {AudioBus}  bus
 */
class AudioNodeOutput {
  /**
   * @param {object} opts
   * @param {AudioNode} opts.node
   * @param {number}    opts.index
   * @param {number}    opts.numberOfChannels
   * @param {boolean}   opts.enabled
   */
  constructor(opts) {
    let node = opts.node;
    let index = opts.index;
    let numberOfChannels = opts.numberOfChannels;
    let enabled = opts.enabled;

    this.node = node;
    this.index = index|0;
    this.bus = new AudioBus(numberOfChannels, node.blockSize, node.sampleRate);
    this.inputs = [];
    this._enabled = !!enabled;
  }

  /**
   * @return {number}
   */
  getNumberOfChannels() {
    return this.bus.getNumberOfChannels();
  }

  /**
   * @param {number} numberOfChannels
   */
  setNumberOfChannels(numberOfChannels) {
    /* istanbul ignore else */
    if (numberOfChannels !== this.getNumberOfChannels()) {
      const channelInterpretation = this.node.getChannelInterpretation();

      this.bus.setNumberOfChannels(numberOfChannels, channelInterpretation);

      this.inputs.forEach((input) => {
        input.updateNumberOfChannels();
      });
    }
  }

  /**
   * @return {boolean}
   */
  isEnabled() {
    return this._enabled;
  }

  /**
   *
   */
  enable() {
    /* istanbul ignore else */
    if (!this._enabled) {
      this._enabled = true;
      this.inputs.forEach((input) => {
        input.enableFrom(this);
      });
    }
  }

  /**
   *
   */
  disable() {
    /* istanbul ignore else */
    if (this._enabled) {
      this._enabled = false;
      this.inputs.forEach((input) => {
        input.disableFrom(this);
      });
    }
  }

  /**
   *
   */
  zeros() {
    this.bus.zeros();
  }

  /**
   * @param {AudioNode|AudioParam} destination
   * @param {number}               index
   */
  connect(destination, input) {
    const target = destination.inputs[input|0];

    if (this.inputs.indexOf(target) === -1) {
      this.inputs.push(target);
      target.connectFrom(this);
    }
  }

  /**
   *
   */
  disconnect(...args) {
    const isTargetToDisconnect =
      args.length === 1 ? target => target.node === args[0] :
      args.length === 2 ? target => target.node === args[0] && target.index === args[1] :
      () => true;

    for (let i = this.inputs.length - 1; i >= 0; i--) {
      const target = this.inputs[i];

      if (isTargetToDisconnect(target)) {
        target.disconnectFrom(this);
        this.inputs.splice(i, 1);
      }
    }
  }

  /**
   * @return {boolean}
   */
  isConnectedTo(node) {
    return this.inputs.some(target => target.node === node);
  }

  /**
   * @return {AudioBus}
   */
  pull() {
    this.node.processIfNecessary();
    return this.bus;
  }
}

module.exports = AudioNodeOutput;
