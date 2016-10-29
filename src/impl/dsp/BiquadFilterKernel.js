"use strict";

class BiquadFilterKernel {
  constructor() {
    this.coefficients = [ 0, 0, 0, 0, 0 ];
    this._x1 = 0;
    this._x2 = 0;
    this._y1 = 0;
    this._y2 = 0;
  }

  process(input, output, inNumSamples) {
    const b0 = this.coefficients[0];
    const b1 = this.coefficients[1];
    const b2 = this.coefficients[2];
    const a1 = this.coefficients[3];
    const a2 = this.coefficients[4];

    let x0;
    let x1 = this._x1;
    let x2 = this._x2;
    let y0;
    let y1 = this._y1;
    let y2 = this._y2;

    for (let i = 0; i < inNumSamples; i++) {
      x0 = input[i];
      y0 = (b0 * x0) + (b1 * x1) + (b2 * x2) - (a1 * y1) - (a2 * y2);

      x2 = x1;
      x1 = x0;
      y2 = y1;
      y1 = y0;

      output[i] = y0;
    }

    this._x1 = flushDenormalFloatToZero(x1);
    this._x2 = flushDenormalFloatToZero(x2);
    this._y1 = flushDenormalFloatToZero(y1);
    this._y2 = flushDenormalFloatToZero(y2);
  }

  processWithCoefficients(input, output, inNumSamples, coefficients) {
    let b0 = this.coefficients[0];
    let b1 = this.coefficients[1];
    let b2 = this.coefficients[2];
    let a1 = this.coefficients[3];
    let a2 = this.coefficients[4];
    let x0;
    let x1 = this._x1;
    let x2 = this._x2;
    let y0;
    let y1 = this._y1;
    let y2 = this._y2;

    const step = 1 / inNumSamples;
    const b0Incr = (coefficients[0] - b0) * step;
    const b1Incr = (coefficients[1] - b1) * step;
    const b2Incr = (coefficients[2] - b2) * step;
    const a1Incr = (coefficients[3] - a1) * step;
    const a2Incr = (coefficients[4] - a2) * step;

    for (let i = 0; i < inNumSamples; i++) {
      x0 = input[i];
      y0 = (b0 * x0) + (b1 * x1) + (b2 * x2) - (a1 * y1) - (a2 * y2);

      x2 = x1;
      x1 = x0;
      y2 = y1;
      y1 = y0;

      b0 += b0Incr;
      b1 += b1Incr;
      b2 += b2Incr;
      a1 += a1Incr;
      a2 += a2Incr;

      output[i] = y0;
    }

    this._x1 = flushDenormalFloatToZero(x1);
    this._x2 = flushDenormalFloatToZero(x2);
    this._y1 = flushDenormalFloatToZero(y1);
    this._y2 = flushDenormalFloatToZero(y2);
    this.coefficients = coefficients;
  }
}

function flushDenormalFloatToZero(f) {
  return (Math.abs(f) < 1.175494e-38) ? 0.0 : f;
}

module.exports = BiquadFilterKernel;
