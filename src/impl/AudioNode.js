"use strict";

const assert = require("assert");
const util = require("../util");
const EventTarget = require("./EventTarget");
const AudioNodeInput = require("./core/AudioNodeInput");
const AudioNodeOutput = require("./core/AudioNodeOutput");
const AudioParam = require("./AudioParam");

/**
 * @prop {AudioContext}      context
 * @prop {number}            blockSize
 * @prop {number}            sampleRate
 * @prop {AudioNodeInput[]}  inputs
 * @prop {AudioNodeOutput[]} outputs
 */
class AudioNode extends EventTarget {
  /**
   * @param {AudioContext} context
   * @param {number[]}     opts.inputs
   * @param {number[]}     opts.outputs
   * @param {number}       opts.channelCount
   * @param {string}       opts.channelCountMode
   */
  constructor(context, /* istanbul ignore next */ opts = {}) {
    let inputs = util.defaults(opts.inputs, []);
    let outputs = util.defaults(opts.outputs, []);
    let channelCount = util.defaults(opts.channelCount, 1);
    let channelCountMode = util.defaults(opts.channelCountMode, "max");

    super();

    this.context = context;
    this.blockSize = context.blockSize;
    this.sampleRate = context.sampleRate;
    this.inputs = [];
    this.outputs = [];
    this.currentSampleFrame = -1;

    this._params = [];
    this._enabled = false;
    this._suicideAtSampleFrame = Infinity;

    inputs.forEach((numberOfChannels) => {
      this.addInput(numberOfChannels, channelCount, channelCountMode);
    });
    outputs.forEach((numberOfChannels) => {
      this.addOutput(numberOfChannels);
    });
  }

  /**
   * @return {number}
   */
  getNumberOfInputs() {
    return this.inputs.length;
  }

  /**
   * @return {number}
   */
  getNumberOfOutputs() {
    return this.outputs.length;
  }

  /**
   * @return {number}
   */
  getChannelCount() {
    assert(this.inputs.length === 1);
    return this.inputs[0].getChannelCount();
  }

  /**
   * @param {number} value
   */
  setChannelCount(value) {
    assert(this.inputs.length === 1);
    this.inputs[0].setChannelCount(value);
  }

  /**
   * @return {string}
   */
  getChannelCountMode() {
    assert(this.inputs.length === 1);
    return this.inputs[0].getChannelCountMode();
  }

  /**
   * @param {string} value
   */
  setChannelCountMode(value) {
    assert(this.inputs.length === 1);
    this.inputs[0].setChannelCountMode(value);
  }

  /**
   * @return {string}
   */
  getChannelInterpretation() {
    assert(this.inputs.length === 1);
    return this.inputs[0].getChannelInterpretation();
  }

  /**
   * @param {string} value
   */
  setChannelInterpretation(value) {
    assert(this.inputs.length === 1);
    this.inputs[0].setChannelInterpretation(value);
  }

  /**
   * @param {AudioNode|AudioParam} destination
   * @param {number}               output
   * @param {number}               input
   */
  connect(destination, output, input) {
    this.outputs[output|0].connect(destination, input|0);
  }

  /**
   *
   */
  disconnect(...args) {
    if (args.length === 0) {
      return this.disconnectAll();
    }
    if (typeof args[0] === "number") {
      return this.disconnectAllFromOutput(args[0]|0);
    }
    if (args.length === 1) {
      return this.disconnectIfConnected(args[0]);
    }
    return this.disconnectFromOutputIfConnected(args[1]|0, args[0], args[2]|0);
  }

  /**
   * @param {number} numberOfChannels
   * @param {number} channelCount
   * @param {string} channelCountMode
   * @return {AudioNodeInput}
   */
  addInput(numberOfChannels, channelCount, channelCountMode) {
    const node = this;
    const index = this.inputs.length;
    const input = new AudioNodeInput({ node, index, numberOfChannels, channelCount, channelCountMode });

    this.inputs.push(input);

    return input;
  }

  /**
   * @param {number} numberOfChannels
   * @return {AudioNodeOutput}
   */
  addOutput(numberOfChannels) {
    const node = this;
    const index = this.outputs.length;
    const output = new AudioNodeOutput({ node, index, numberOfChannels });

    this.outputs.push(output);

    return output;
  }

  /**
   * @param {string} rate - [ "audio", "control" ]
   * @param {number} defaultValue
   * @return {AudioParam}
   */
  addParam(rate, defaultValue) {
    const param = new AudioParam(this.context, { rate, defaultValue });

    this._params.push(param);

    return param;
  }

  /**
   * @return {boolean}
   */
  isEnabled() {
    return this._enabled;
  }

  /**
   * @return {number}
   */
  getTailTime() {
    return 0;
  }

  /**
   *
   */
  enableOutputsIfNecessary() {
    if (!this._enabled) {
      this._suicideAtSampleFrame = Infinity;
      this._enabled = true;
      this.outputs.forEach((output) => {
        output.enable();
      });
    }
  }

  /**
   *
   */
  disableOutputsIfNecessary() {
    const currentTime = this.context.currentTime;
    const disableAtTime = currentTime + this.getTailTime();

    if (disableAtTime === currentTime) {
      this._disableOutputsIfNecessary();
    } else if (disableAtTime !== Infinity) {
      this._suicideAtSampleFrame = Math.round(disableAtTime * this.sampleRate);
    }
  }

  /**
   * @private
   */
  _disableOutputsIfNecessary() {
    if (this._enabled) {
      this._enabled = false;
      this.outputs.forEach((output) => {
        output.disable();
      });
    }
  }

  /**
   *
   */
  channelDidUpdate() {}

  /**
   *
   */
  disconnectAll() {
    this.outputs.forEach((output) => {
      output.disconnect();
    });
  }

  /**
   * @param {number} output
   */
  disconnectAllFromOutput(output) {
    this.outputs[output|0].disconnect();
  }

  /**
   * @param {AudioNode|AudioParam} destination
   */
  disconnectIfConnected(destination) {
    this.outputs.forEach((output) => {
      output.disconnect(destination);
    });
  }

  /**
   * @param {number} output
   * @param {AudioNode|AudioParam} destination
   * @param {number} output
   */
  disconnectFromOutputIfConnected(output, destination, input) {
    this.outputs[output|0].disconnect(destination, input|0);
  }

  /**
   *
   */
  processIfNecessary() {
    // prevent infinite loop when audio graph has feedback
    if (this.context.currentSampleFrame <= this.currentSampleFrame) {
      return;
    }
    this.currentSampleFrame = this.context.currentSampleFrame;

    if (this._suicideAtSampleFrame <= this.currentSampleFrame) {
      const outputs = this.outputs;

      for (let i = 0, imax = outputs.length; i < imax; i++) {
        outputs[i].zeros();
      }

      this.context.addPostProcess(() => {
        this._disableOutputsIfNecessary();
      });
      return;
    }

    const inputs = this.inputs;

    for (let i = 0, imax = inputs.length; i < imax; i++) {
      inputs[i].pull();
    }

    const params = this._params;

    for (let i = 0, imax = params.length; i < imax; i++) {
      params[i].dspProcess();
    }

    this.dspProcess();
  }

  dspInit() {}

  dspProcess() {}
}

module.exports = AudioNode;
