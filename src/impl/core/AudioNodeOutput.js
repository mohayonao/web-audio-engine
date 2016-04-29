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
    this._inputs = [];
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

      this._inputs.forEach((input) => {
        input.updateNumberOfChannels();
      });
    }
  }

  /**
   * @return {number}
   */
  getNumberOfConnections() {
    return this._inputs.length;
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
      this._inputs.forEach((input) => {
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
      this._inputs.forEach((input) => {
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

    if (this._inputs.indexOf(target) === -1) {
      this._inputs.push(target);
      target.connectFrom(this);
    }
  }

  /**
   *
   */
  disconnect() {
    const args = Array.from(arguments);
    const isTargetToDisconnect =
      args.length === 1 ? target => target.node === args[0] :
      args.length === 2 ? target => target.node === args[0] && target.index === args[1] :
      () => true;

    for (let i = this._inputs.length - 1; i >= 0; i--) {
      const target = this._inputs[i];

      if (isTargetToDisconnect(target)) {
        target.disconnectFrom(this);
        this._inputs.splice(i, 1);
      }
    }
  }

  /**
   * @return {boolean}
   */
  isConnectedTo() {
    const args = Array.from(arguments);

    if (args.length === 1) {
      return this._inputs.some(target => target.node === args[0]);
    }
    if (args.length === 2) {
      return this._inputs.some(target => target.node === args[0] && target.index === args[1]);
    }

    return false;
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
