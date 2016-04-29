"use strict";

const assert = require("assert");

const WaveShaperNodeDSP = {
  dspInit() {
    this._kernels = [];
  },

  dspUpdateKernel(curve, numberOfChannels) {
    if (curve === null) {
      numberOfChannels = 0;
    }
    if (numberOfChannels < this._kernels.length) {
      this._kernels.splice(numberOfChannels);
    } else if (this._kernels.length < numberOfChannels) {
      while (numberOfChannels !== this._kernels.length) {
        this._kernels.push(new WaveShaperKernel(this, this._kernels.length));
      }
    }

    assert(numberOfChannels === this._kernels.length);

    switch (numberOfChannels) {
    case 0:
      this.dspProcess = this.dspProcess0;
      break;
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

  dspProcess0() {
    this.outputs[0].bus.copyFrom(this.inputs[0].bus);
  },

  dspProcess1() {
    const inputBus = this.inputs[0].bus;
    const outputBus = this.outputs[0].bus;
    const inputs = inputBus.getChannelData();
    const outputs = outputBus.getMutableData();
    const kernels = this._kernels;

    kernels[0].process(inputs[0], outputs[0], this._curve, this.blockSize);
  },

  dspProcess2() {
    const inputBus = this.inputs[0].bus;
    const outputBus = this.outputs[0].bus;
    const inputs = inputBus.getChannelData();
    const outputs = outputBus.getMutableData();
    const blockSize = this.blockSize;
    const curve = this._curve;
    const kernels = this._kernels;

    kernels[0].process(inputs[0], outputs[0], curve, blockSize);
    kernels[1].process(inputs[1], outputs[1], curve, blockSize);
  },

  dspProcessN() {
    const inputBus = this.inputs[0].bus;
    const outputBus = this.outputs[0].bus;
    const inputs = inputBus.getChannelData();
    const outputs = outputBus.getMutableData();
    const blockSize = this.blockSize;
    const curve = this._curve;
    const kernels = this._kernels;

    for (let i = 0, imax = kernels.length; i < imax; i++) {
      kernels[i].process(inputs[i], outputs[i], curve, blockSize);
    }
  }
};

class WaveShaperKernel {
  process(input, output, curve, inNumSamples) {
    for (let i = 0; i < inNumSamples; i++) {
      const x = (Math.max(-1, Math.min(input[i], 1)) + 1) * 0.5;
      const ix = x * (curve.length - 1);
      const i0 = ix|0;
      const i1 = i0 + 1;

      if (curve.length <= i1) {
        output[i] = curve[curve.length - 1];
      } else {
        output[i] = curve[i0] + (ix % 1) * (curve[i1] - curve[i0]);
      }
    }
  }
}

module.exports = WaveShaperNodeDSP;
