"use strict";

const assert = require("assert");

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
  }
};

class IIRFilterKernel {
  constructor(feedforward, feedback) {
    this.a = toCoefficient(feedback, feedback[0]);
    this.b = toCoefficient(feedforward, feedback[0]);
    this.x = new Float32Array(this.b.length);
    this.y = new Float32Array(this.a.length);
  }

  process(input, output, inNumSamples) {
    const a = this.a;
    const b = this.b;
    const x = this.x;
    const y = this.y;
    const alen = this.a.length - 1;
    const blen = this.b.length;

    for (let i = 0; i < inNumSamples; i++) {
      x[blen - 1] = input[i];
      y[alen] = 0;

      for (let j = 0; j < blen; j++) {
        y[alen] += b[j] * x[j];
        x[j] = flushDenormalFloatToZero(x[j + 1]);
      }

      for (let j = 0; j < alen; j++) {
        y[alen] -= a[j] * y[j];
        y[j] = flushDenormalFloatToZero(y[j + 1]);
      }

      output[i] = y[alen];
    }
  }
}

function toCoefficient(filter, a0) {
  const coeff = new Float32Array(filter.length);

  for (let i = 0, imax = coeff.length; i < imax; i++) {
    coeff[i] = filter[imax - i - 1] / a0;
  }

  return coeff;
}

function flushDenormalFloatToZero(f) {
  return (Math.abs(f) < 1.175494e-38) ? 0.0 : f;
}

module.exports = IIRFilterNodeDSP;
