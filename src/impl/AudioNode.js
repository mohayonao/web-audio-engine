"use strict";

const EventTarget = require("./EventTarget");
const AudioNodeInput = require("./core/AudioNodeInput");
const AudioNodeOutput = require("./core/AudioNodeOutput");
const AudioParam = require("./AudioParam");
const { defaults, clamp } = require("../utils");
const { toNumber } = require("../utils");
const { MIN_NUMBER_OF_CHANNELS, MAX_NUMBER_OF_CHANNELS } = require("../constants");
const { MAX, CLAMPED_MAX, EXPLICIT } = require("../constants/ChannelCountMode");
const { DISCRETE, SPEAKERS } = require("../constants/ChannelInterpretation");

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
   * @param {object}       opts
   * @param {number}       opts.channelCount
   * @param {string}       opts.channelCountMode
   * @param {string}       opts.channelInterpretation
   * @param {number[]}     config.inputs
   * @param {number[]}     config.outputs
   * @param {number}       config.channelCount
   * @param {string}       config.channelCountMode
   */
  constructor(context, opts = {}, config = {}) {
    let inputs = defaults(config.inputs, []);
    let outputs = defaults(config.outputs, []);
    let channelCount = defaults(config.channelCount, 1);
    let channelCountMode = defaults(config.channelCountMode, MAX);
    let channelInterpretation = SPEAKERS;
    let allowedMinChannelCount = defaults(config.allowedMinChannelCount, MIN_NUMBER_OF_CHANNELS);
    let allowedMaxChannelCount = defaults(config.allowedMaxChannelCount, MAX_NUMBER_OF_CHANNELS);
    let allowedChannelCountMode = defaults(config.allowedChannelCountMode, [ MAX, CLAMPED_MAX, EXPLICIT ]);
    let allowedChannelInterpretation = defaults(config.allowedChannelInterpretation, [ DISCRETE, SPEAKERS ]);

    super();

    this.context = context;
    this.blockSize = context.blockSize;
    this.sampleRate = context.sampleRate;
    this.inputs = [];
    this.outputs = [];
    this.channelCount = channelCount;
    this.channelCountMode = channelCountMode;
    this.channelInterpretation = channelInterpretation;
    this.allowedMinChannelCount = allowedMinChannelCount;
    this.allowedMaxChannelCount = allowedMaxChannelCount;
    this.allowedChannelCountMode = allowedChannelCountMode;
    this.allowedChannelInterpretation = allowedChannelInterpretation;
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

    if (typeof opts.channelCount === "number") {
      this.setChannelCount(opts.channelCount);
    }
    if (typeof opts.channelCountMode === "string") {
      this.setChannelCountMode(opts.channelCountMode);
    }
    if (typeof opts.channelInterpretation === "string") {
      this.setChannelInterpretation(opts.channelInterpretation);
    }
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
    return this.channelCount;
  }

  /**
   * @param {number} value
   */
  setChannelCount(value) {
    value = toNumber(value);

    const channelCount = clamp(value, this.allowedMinChannelCount, this.allowedMaxChannelCount);

    if (channelCount !== this.channelCount) {
      this.channelCount = channelCount;
      this.inputs.forEach(input => {
        input.setChannelCount(value);
      });
    }
  }

  /**
   * @return {string}
   */
  getChannelCountMode() {
    return this.channelCountMode;
  }

  /**
   * @param {string} value
   */
  setChannelCountMode(value) {
    if (this.allowedChannelCountMode.indexOf(value) !== -1) {
      if (value !== this.channelCountMode) {
        this.channelCountMode = value;
        this.inputs.forEach((input) => {
          input.setChannelCountMode(value);
        });
      }
    }
  }

  /**
   * @return {string}
   */
  getChannelInterpretation() {
    return this.channelInterpretation;
  }

  /**
   * @param {string} value
   */
  setChannelInterpretation(value) {
    if (this.allowedChannelInterpretation.indexOf(value) !== -1) {
      if (value !== this.channelInterpretation) {
        this.channelInterpretation = value;
        this.inputs.forEach((input) => {
          input.setChannelInterpretation(value);
        });
      }
    }
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
