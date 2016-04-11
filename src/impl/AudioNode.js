"use strict";

const assert = require("power-assert");
const EventTarget = require("./EventTarget");
const AudioNodeInput = require("./core/AudioNodeInput");
const AudioNodeOutput = require("./core/AudioNodeOutput");
const AudioParam = require("./AudioParam");

class AudioNode extends EventTarget {
  constructor(context, opts) {
    opts = opts || /* istanbul ignore next */ {};

    let inputs = opts.inputs;
    let outputs = opts.outputs;
    let channelCount = opts.channelCount;
    let channelCountMode = opts.channelCountMode;

    super();

    this.context = context;
    this.processingSizeInFrames = context.processingSizeInFrames;
    this.sampleRate = context.sampleRate;

    this._inputs = [];
    this._outputs = [];
    this._params = [];
    this._enabled = false;
    this._lastProcessingTime = -1;

    channelCount = channelCount || 1;
    channelCountMode = channelCountMode || "max";

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
    return this._inputs.length;
  }

  getNumberOfOutputs() {
    return this._outputs.length;
  }

  getChannelCount() {
    assert(this._inputs.length === 1);
    return this._inputs[0].getChannelCount();
  }

  setChannelCount(value) {
    assert(this._inputs.length === 1);
    this._inputs[0].setChannelCount(value);
  }

  getChannelCountMode() {
    assert(this._inputs.length === 1);
    return this._inputs[0].getChannelCountMode();
  }

  setChannelCountMode(value) {
    assert(this._inputs.length === 1);
    this._inputs[0].setChannelCountMode(value);
  }

  getChannelInterpretation() {
    assert(this._inputs.length === 1);
    return this._inputs[0].getChannelInterpretation();
  }

  setChannelInterpretation(value) {
    assert(this._inputs.length === 1);
    this._inputs[0].setChannelInterpretation(value);
  }

  connect(destination, output, input) {
    this._outputs[output|0].connect(destination, input|0);
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
    const index = this._inputs.length;
    const input = new AudioNodeInput({ node, index, numberOfChannels, channelCount, channelCountMode });

    this._inputs.push(input);

    return input;
  }

  addOutput(numberOfChannels) {
    const node = this;
    const index = this._outputs.length;
    const output = new AudioNodeOutput({ node, index, numberOfChannels });

    this._outputs.push(output);

    return output;
  }

  addParam(rate, defaultValue) {
    const param = new AudioParam(this, { rate, defaultValue });

    this._params.push(param);

    return param;
  }

  getInput(channel) {
    assert(0 <= channel && channel < this._inputs.length);
    return this._inputs[channel|0];
  }

  getOutput(channel) {
    assert(0 <= channel && channel < this._outputs.length);
    return this._outputs[channel|0];
  }

  isEnabled() {
    return this._enabled;
  }

  enableOutputsIfNecessary() {
    if (!this._enabled) {
      this._enabled = true;
      this._outputs.forEach((output) => {
        output.enable();
      });
    }
  }

  disableOutputsIfNecessary() {
    if (this._enabled) {
      this._enabled = false;
      this._outputs.forEach((output) => {
        output.disable();
      });
    }
  }

  channelDidUpdate() {}

  disconnectAll() {
    this._outputs.forEach((output) => {
      output.disconnect();
    });
  }

  disconnectAllFromOutput(output) {
    this._outputs[output|0].disconnect();
  }

  disconnectIfConnected(destination) {
    this._outputs.forEach((output) => {
      output.disconnect(destination);
    });
  }

  disconnectFromOutputIfConnected(output, destination, input) {
    this._outputs[output|0].disconnect(destination, input|0);
  }

  isConnectedTo() {
    const args = Array.from(arguments);

    if (args.length === 1) {
      return this._outputs.some((output) => {
        return output.isConnectedTo(args[0]);
      });
    }

    const output = args.splice(1, 1)[0]|0;

    if (this._outputs[output]) {
      return this._outputs[output].isConnectedTo.apply(this._outputs[output], args);
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

  processIfNecessary(e) {
    if (e.currentTime <= this._lastProcessingTime) {
      return;
    }
    this._lastProcessingTime = e.currentTime;

    const inputs = this._inputs;

    for (let i = 0, imax = inputs.length; i < imax; i++) {
      inputs[i].pull(e);
    }

    const params = this._params;

    for (let i = 0, imax = params.length; i < imax; i++) {
      params[i].dspProcess(e);
    }

    this.dspProcess(e);
  }

  dspInit() {}

  dspProcess() {}
}

module.exports = AudioNode;
