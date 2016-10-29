"use strict";

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

module.exports = IIRFilterKernel;
