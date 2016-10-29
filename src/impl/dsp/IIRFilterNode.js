"use strict";

const assert = require("assert");
const IIRFilterKernel = require("./IIRFilterKernel");
const getFilterResponse = require("../../util/getFilterResponse");

const IIRFilterNodeDSP = {
  dspInit() {
    this._kernels = [];
  },

  dspUpdateKernel(numberOfChannels) {
    if (numberOfChannels < this._kernels.length) {
      this._kernels.splice(numberOfChannels);
    } else if (this._kernels.length < numberOfChannels) {
      while (numberOfChannels !== this._kernels.length) {
        this._kernels.push(new IIRFilterKernel(this._feedforward, this._feedback));
      }
    }

    assert(numberOfChannels === this._kernels.length);

    switch (numberOfChannels) {
    case 1:
      this.dspProcess = this.dspProcess1;
      break;
    case 2:
      this.dspProcess = this.dspProcess2;
      break;
    default:
      this.dspProcess = this.dspProcessN;
      break;
    }
  },

  dspProcess1() {
    const inputs = this.inputs[0].bus.getChannelData();
    const outputs = this.outputs[0].bus.getMutableData();
    const kernels = this._kernels;

    kernels[0].process(inputs[0], outputs[0], this.blockSize);
  },

  dspProcess2() {
    const blockSize = this.blockSize;
    const inputs = this.inputs[0].bus.getChannelData();
    const outputs = this.outputs[0].bus.getMutableData();
    const kernels = this._kernels;

    kernels[0].process(inputs[0], outputs[0], blockSize);
    kernels[1].process(inputs[1], outputs[1], blockSize);
  },

  dspProcessN() {
    const blockSize = this.blockSize;
    const inputs = this.inputs[0].bus.getChannelData();
    const outputs = this.outputs[0].bus.getMutableData();
    const kernels = this._kernels;

    for (let i = 0, imax = kernels.length; i < imax; i++) {
      kernels[i].process(inputs[i], outputs[i], blockSize);
    }
  },

  dspGetFrequencyResponse(frequencyHz, magResponse, phaseResponse) {
    const b = this._feedforward;
    const a = this._feedback;

    getFilterResponse(b, a, frequencyHz, magResponse, phaseResponse, this.sampleRate);
  }
};

module.exports = IIRFilterNodeDSP;
