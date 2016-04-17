"use strict";

const assert = require("assert");
const AudioNode = require("../AudioNode");

const LOWPASS = 0;
const HIGHPASS = 1;
const BANDPASS = 2;
const LOWSHELF = 3;
const HIGHSHELF = 4;
const PEAKING = 5;
const NOTCH = 6;
const ALLPASS = 7;

const FilterTypes = [ LOWPASS, HIGHPASS, BANDPASS, LOWSHELF, HIGHSHELF, PEAKING, NOTCH, ALLPASS ];
const computeCoefficients = {};

class BiquadFilterNode extends AudioNode {
  dspInit() {
    this._kernels = [];
    this._initCoefficients = false;
    this._coefficients = [ 0, 0, 0, 0, 0 ];
    this._prevFrequency = 0;
    this._prevDetune = 0;
    this._prevQ = 0;
    this._prevGain = 0;
  }

  dspSetNumberOfChannels(numberOfChannels) {
    if (numberOfChannels < this._kernels.length) {
      this._kernels.splice(numberOfChannels);
    } else if (this._kernels.length < numberOfChannels) {
      while (numberOfChannels !== this._kernels.length) {
        this._kernels.push(new BiquadFilterKernel(this, this._kernels.length));
      }
    }
    assert(numberOfChannels === this._kernels.length);
  }

  dspProcess() {
    const inputs = this.inputs[0].bus.getChannelData();
    const outputs = this.outputs[0].bus.getMutableData();
    const isCoefficientsUpdated = this.dspUpdateCoefficients();
    const kernels = this._kernels;
    const inNumSamples = this.blockSize;

    if (!this._initCoefficients) {
      for (let i = 0, imax = kernels.length; i < imax; i++) {
        kernels[i].processWithInitCoefficients(this._coefficients, inputs[i], outputs[i], inNumSamples);
      }
      this._initCoefficients = true;
    } else if (isCoefficientsUpdated) {
      for (let i = 0, imax = kernels.length; i < imax; i++) {
        kernels[i].processWithCoefficients(this._coefficients, inputs[i], outputs[i], inNumSamples);
      }
    } else {
      for (let i = 0, imax = kernels.length; i < imax; i++) {
        kernels[i].process(inputs[i], outputs[i], inNumSamples);
      }
    }
  }

  dspUpdateCoefficients() {
    const frequency = this._frequency.getValue();
    const detune = this._detune.getValue();
    const Q = this._Q.getValue();
    const gain = this._gain.getValue();

    if (frequency === this._prevFrequency && detune === this._prevDetune && Q === this._prevQ && gain === this._prevGain) {
      return false;
    }

    const nyquist = this.sampleRate * 0.5;
    const normalizedFrequency = (frequency / nyquist) * Math.pow(2, detune / 1200);

    this._coefficients = computeCoefficients[this._type](normalizedFrequency, Q, gain);
    this._prevFrequency = frequency;
    this._prevDetune = detune;
    this._prevQ = Q;
    this._prevGain = gain;

    return true;
  }
}

class BiquadFilterKernel {
  constructor() {
    this._coefficients = [ 0, 0, 0, 0, 0 ];
    this._x1 = 0;
    this._x2 = 0;
    this._y1 = 0;
    this._y2 = 0;
  }

  processWithInitCoefficients(coefficients, input, output, inNumSamples) {
    this._coefficients = coefficients;
    this.process(input, output, inNumSamples);
  }

  process(input, output, inNumSamples) {
    const b0 = this._coefficients[0];
    const b1 = this._coefficients[1];
    const b2 = this._coefficients[2];
    const a1 = this._coefficients[3];
    const a2 = this._coefficients[4];

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

  processWithCoefficients(coefficients, input, output, inNumSamples) {
    let b0 = this._coefficients[0];
    let b1 = this._coefficients[1];
    let b2 = this._coefficients[2];
    let a1 = this._coefficients[3];
    let a2 = this._coefficients[4];
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
    this._coefficients = coefficients;
  }
}

computeCoefficients[LOWPASS] = (cutoff, resonance) => {
  cutoff = Math.max(0.0, Math.min(cutoff, 1.0));

  if (cutoff === 1) {
    return [ 1, 0, 0, 0, 0 ];
  }

  if (0 < cutoff) {
    resonance = Math.max(0.0, resonance);

    const g = Math.pow(10.0, 0.05 * resonance);
    const d = Math.sqrt((4 - Math.sqrt(16 - 16 / (g * g))) / 2);
    const theta = Math.PI * cutoff;
    const sn = 0.5 * d * Math.sin(theta);
    const beta = 0.5 * (1 - sn) / (1 + sn);
    const gamma = (0.5 + beta) * Math.cos(theta);
    const alpha = 0.25 * (0.5 + beta - gamma);

    const b0 = 2 * alpha;
    const b1 = 2 * 2 * alpha;
    const b2 = 2 * alpha;
    const a1 = 2 * -gamma;
    const a2 = 2 * beta;

    return [ b0, b1, b2, a1, a2 ];
  }

  return [ 0, 0, 0, 0, 0 ];
};

computeCoefficients[HIGHPASS] = (cutoff, resonance) => {
  cutoff = Math.max(0.0, Math.min(cutoff, 1.0));

  if (cutoff == 1) {
    return [ 0, 0, 0, 0, 0 ];
  }

  if (0 < cutoff) {
    resonance = Math.max(0.0, resonance);

    const g = Math.pow(10.0, 0.05 * resonance);
    const d = Math.sqrt((4 - Math.sqrt(16 - 16 / (g * g))) / 2);
    const theta = Math.PI * cutoff;
    const sn = 0.5 * d * Math.sin(theta);
    const beta = 0.5 * (1 - sn) / (1 + sn);
    const gamma = (0.5 + beta) * Math.cos(theta);
    const alpha = 0.25 * (0.5 + beta + gamma);

    const b0 = 2 * alpha;
    const b1 = 2 * -2 * alpha;
    const b2 = 2 * alpha;
    const a1 = 2 * -gamma;
    const a2 = 2 * beta;

    return [ b0, b1, b2, a1, a2 ];
  }

  return [ 1, 0, 0, 0, 0 ];
};

computeCoefficients[BANDPASS] = (frequency, Q) => {
  frequency = Math.max(0.0, frequency);
  Q = Math.max(0.0, Q);

  if (0 < frequency && frequency < 1) {
    const w0 = Math.PI * frequency;

    if (0 < Q) {
      const alpha = Math.sin(w0) / (2 * Q);
      const k = Math.cos(w0);

      const b0 = alpha;
      const b1 = 0;
      const b2 = -alpha;
      const a0 = 1 + alpha;
      const a1 = -2 * k;
      const a2 = 1 - alpha;

      return [ b0/a0, b1/a0, b2/a0, a1/a0, a2/a0 ];
    }

    return [ 1, 0, 0, 0, 0 ];
  }

  return [ 0, 0, 0, 0, 0 ];
};

computeCoefficients[LOWSHELF] = (frequency, _, dbGain) => {
  frequency = Math.max(0.0, Math.min(frequency, 1.0));

  const A = Math.pow(10.0, dbGain / 40);

  if (frequency == 1) {
    return [ A*A, 0, 0, 0, 0 ];
  }

  if (0 < frequency) {
    const w0 = Math.PI * frequency;
    const S = 1;
    const alpha = 0.5 * Math.sin(w0) * Math.sqrt((A + 1 / A) * (1 / S - 1) + 2);
    const k = Math.cos(w0);
    const k2 = 2 * Math.sqrt(A) * alpha;
    const aPlusOne = A + 1;
    const aMinusOne = A - 1;

    const b0 = A * (aPlusOne - aMinusOne * k + k2);
    const b1 = 2 * A * (aMinusOne - aPlusOne * k);
    const b2 = A * (aPlusOne - aMinusOne * k - k2);
    const a0 = aPlusOne + aMinusOne * k + k2;
    const a1 = -2 * (aMinusOne + aPlusOne * k);
    const a2 = aPlusOne + aMinusOne * k - k2;

    return [ b0/a0, b1/a0, b2/a0, a1/a0, a2/a0 ];
  }

  return [ 1, 0, 0, 0, 0 ];
};

computeCoefficients[HIGHSHELF] = (frequency, _, dbGain) => {
  frequency = Math.max(0.0, Math.min(frequency, 1.0));

  const A = Math.pow(10.0, dbGain / 40);

  if (frequency == 1) {
    return [ 1, 0, 0, 0, 0 ];
  }

  if (0 < frequency) {
    const w0 = Math.PI * frequency;
    const S = 1;
    const alpha = 0.5 * Math.sin(w0) * Math.sqrt((A + 1 / A) * (1 / S - 1) + 2);
    const k = Math.cos(w0);
    const k2 = 2 * Math.sqrt(A) * alpha;
    const aPlusOne = A + 1;
    const aMinusOne = A - 1;

    const b0 = A * (aPlusOne + aMinusOne * k + k2);
    const b1 = -2 * A * (aMinusOne + aPlusOne * k);
    const b2 = A * (aPlusOne + aMinusOne * k - k2);
    const a0 = aPlusOne - aMinusOne * k + k2;
    const a1 = 2 * (aMinusOne - aPlusOne * k);
    const a2 = aPlusOne - aMinusOne * k - k2;

    return [ b0/a0, b1/a0, b2/a0, a1/a0, a2/a0 ];
  }

  return [ A*A, 0, 0, 0, 0 ];
};

computeCoefficients[PEAKING] = (frequency, Q, dbGain) => {
  frequency = Math.max(0.0, Math.min(frequency, 1.0));
  Q = Math.max(0.0, Q);

  const A = Math.pow(10.0, dbGain / 40);

  if (0 < frequency && frequency < 1) {
    if (0 < Q) {
      const w0 = Math.PI * frequency;
      const alpha = Math.sin(w0) / (2 * Q);
      const k = Math.cos(w0);

      const b0 = 1 + alpha * A;
      const b1 = -2 * k;
      const b2 = 1 - alpha * A;
      const a0 = 1 + alpha / A;
      const a1 = -2 * k;
      const a2 = 1 - alpha / A;

      return [ b0/a0, b1/a0, b2/a0, a1/a0, a2/a0 ];
    }

    return [ A*A, 0, 0, 0, 0 ];
  }

  return [ 1, 0, 0, 0, 0 ];
};

computeCoefficients[NOTCH] = (frequency, Q) => {
  frequency = Math.max(0.0, Math.min(frequency, 1.0));
  Q = Math.max(0.0, Q);

  if (0 < frequency && frequency < 1) {
    if (0 < Q) {
      const w0 = Math.PI * frequency;
      const alpha = Math.sin(w0) / (2 * Q);
      const k = Math.cos(w0);

      const b0 = 1;
      const b1 = -2 * k;
      const b2 = 1;
      const a0 = 1 + alpha;
      const a1 = -2 * k;
      const a2 = 1 - alpha;

      return [ b0/a0, b1/a0, b2/a0, a1/a0, a2/a0 ];
    }

    return [ 0, 0, 0, 0, 0 ];
  }

  return [ 1, 0, 0, 0, 0 ];
};

computeCoefficients[ALLPASS] = (frequency, Q) => {
  frequency = Math.max(0.0, Math.min(frequency, 1.0));
  Q = Math.max(0.0, Q);

  if (0 < frequency && frequency < 1) {
    if (0 < Q) {
      const w0 = Math.PI * frequency;
      const alpha = Math.sin(w0) / (2 * Q);
      const k = Math.cos(w0);

      const b0 = 1 - alpha;
      const b1 = -2 * k;
      const b2 = 1 + alpha;
      const a0 = 1 + alpha;
      const a1 = -2 * k;
      const a2 = 1 - alpha;

      return [ b0/a0, b1/a0, b2/a0, a1/a0, a2/a0 ];
    }

    return [ -1, 0, 0, 0, 0 ];
  }

  return [ 1, 0, 0, 0, 0 ];
};

function flushDenormalFloatToZero(f) {
  return (Math.abs(f) < 1.175494e-38) ? 0.0 : f;
}

BiquadFilterNode.FilterTypes = FilterTypes;
BiquadFilterNode.LOWPASS = LOWPASS;
BiquadFilterNode.HIGHPASS = HIGHPASS;
BiquadFilterNode.BANDPASS = BANDPASS;
BiquadFilterNode.LOWSHELF = LOWSHELF;
BiquadFilterNode.HIGHSHELF = HIGHSHELF;
BiquadFilterNode.PEAKING = PEAKING;
BiquadFilterNode.NOTCH = NOTCH;
BiquadFilterNode.ALLPASS = ALLPASS;

module.exports = BiquadFilterNode;
