"use strict";

const assert = require("assert");
const util = require("../util");
const EventTarget = require("./EventTarget");
const AudioNodeInput = require("./core/AudioNodeInput");
const AudioNodeOutput = require("./core/AudioNodeOutput");
const AudioParam = require("./AudioParam");

class AudioNode extends EventTarget {
  constructor(context, opts) {
    opts = opts || /* istanbul ignore next */ {};

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

    this._params = [];
    this._enabled = false;
    this._lastProcessingSample = -1;
    this._disableSample = Infinity;

    inputs.forEach((numberOfChannels) => {
      this.addInput(numberOfChannels, channelCount, channelCountMode);
    });
    outputs.forEach((numberOfChannels) => {
      this.addOutput(numberOfChannels);
    });
  }

  getContext() {
    return this.context;
  }

  getNumberOfInputs() {
    return this.inputs.length;
  }

  getNumberOfOutputs() {
    return this.outputs.length;
  }

  getChannelCount() {
    assert(this.inputs.length === 1);
    return this.inputs[0].getChannelCount();
  }

  setChannelCount(value) {
    assert(this.inputs.length === 1);
    this.inputs[0].setChannelCount(value);
  }

  getChannelCountMode() {
    assert(this.inputs.length === 1);
    return this.inputs[0].getChannelCountMode();
  }

  setChannelCountMode(value) {
    assert(this.inputs.length === 1);
    this.inputs[0].setChannelCountMode(value);
  }

  getChannelInterpretation() {
    assert(this.inputs.length === 1);
    return this.inputs[0].getChannelInterpretation();
  }

  setChannelInterpretation(value) {
    assert(this.inputs.length === 1);
    this.inputs[0].setChannelInterpretation(value);
  }

  connect(destination, output, input) {
    this.outputs[output|0].connect(destination, input|0);
  }

  disconnect() {
    const args = Array.from(arguments);

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

  addInput(numberOfChannels, channelCount, channelCountMode) {
    const node = this;
    const index = this.inputs.length;
    const input = new AudioNodeInput({ node, index, numberOfChannels, channelCount, channelCountMode });

    this.inputs.push(input);

    return input;
  }

  addOutput(numberOfChannels) {
    const node = this;
    const index = this.outputs.length;
    const output = new AudioNodeOutput({ node, index, numberOfChannels });

    this.outputs.push(output);

    return output;
  }

  addParam(rate, defaultValue) {
    const param = new AudioParam(this, { rate, defaultValue });

    this._params.push(param);

    return param;
  }

  getInput(channel) {
    assert(0 <= channel && channel < this.inputs.length);
    return this.inputs[channel|0];
  }

  getOutput(channel) {
    assert(0 <= channel && channel < this.outputs.length);
    return this.outputs[channel|0];
  }

  isEnabled() {
    return this._enabled;
  }

  getTailTime() {
    return 0;
  }

  enableOutputsIfNecessary() {
    if (!this._enabled) {
      this._disableSample = Infinity;
      this._enabled = true;
      this.outputs.forEach((output) => {
        output.enable();
      });
    }
  }

  disableOutputsIfNecessary() {
    const currentTime = this.context.currentTime;
    const disableTime = currentTime + this.getTailTime();

    if (disableTime === currentTime) {
      this._disableOutputsIfNecessary();
    } else if (disableTime !== Infinity) {
      this._disableSample = Math.round(disableTime * this.sampleRate);
    }
  }

  _disableOutputsIfNecessary() {
    if (this._enabled) {
      this._enabled = false;
      this.outputs.forEach((output) => {
        output.disable();
      });
    }
  }

  channelDidUpdate() {}

  disconnectAll() {
    this.outputs.forEach((output) => {
      output.disconnect();
    });
  }

  disconnectAllFromOutput(output) {
    this.outputs[output|0].disconnect();
  }

  disconnectIfConnected(destination) {
    this.outputs.forEach((output) => {
      output.disconnect(destination);
    });
  }

  disconnectFromOutputIfConnected(output, destination, input) {
    this.outputs[output|0].disconnect(destination, input|0);
  }

  isConnectedTo() {
    const args = Array.from(arguments);

    if (args.length === 1) {
      return this.outputs.some((output) => {
        return output.isConnectedTo(args[0]);
      });
    }

    const output = args.splice(1, 1)[0]|0;

    if (this.outputs[output]) {
      return this.outputs[output].isConnectedTo.apply(this.outputs[output], args);
    }

    return false;
  }

  isConnectedFrom() {
    const args = Array.from(arguments);

    if (args[0] && args[0].isConnectedTo) {
      return args[0].isConnectedTo.apply(args[0], [ this ].concat(args.slice(1)));
    }

    return false;
  }

  processIfNecessary(currentSample) {
    if (currentSample <= this._lastProcessingSample) {
      return;
    }
    this._lastProcessingSample = currentSample;

    if (this._disableSample <= currentSample) {
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
      inputs[i].pull(currentSample);
    }

    const params = this._params;

    for (let i = 0, imax = params.length; i < imax; i++) {
      params[i].dspProcess(currentSample);
    }

    this.dspProcess(currentSample);
  }

  dspInit() {}

  dspProcess() {}
}

module.exports = AudioNode;
