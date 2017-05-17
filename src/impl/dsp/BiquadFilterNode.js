"use strict";

const assert = require("assert");
const BiquadCoeffs = require("biquad-coeffs-webaudio");
const BiquadFilterKernel = require("./BiquadFilterKernel");
const { getFilterResponse } = require("../../utils/FilterUtils");

const BiquadFilterNodeDSP = {
  dspInit() {
    this._kernels = [];
    this._quantumStartFrame = -1;
    this._coefficients = [ 0, 0, 0, 0, 0 ];
    this._prevFrequency = 0;
    this._prevDetune = 0;
    this._prevQ = 0;
    this._prevGain = 0;
  },

  dspUpdateKernel(numberOfChannels) {
    if (numberOfChannels < this._kernels.length) {
      this._kernels.splice(numberOfChannels);
    } else if (this._kernels.length < numberOfChannels) {
      while (numberOfChannels !== this._kernels.length) {
        this._kernels.push(new BiquadFilterKernel(this, this._kernels.length));
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
    const blockSize = this.blockSize;
    const quantumStartFrame = this.context.currentSampleFrame;
    const quantumEndFrame = quantumStartFrame + blockSize;
    const inputs = this.inputs[0].bus.getChannelData();
    const outputs = this.outputs[0].bus.getMutableData();
    const isCoefficientsUpdated = this.dspUpdateCoefficients();
    const coefficients = this._coefficients;
    const kernels = this._kernels;

    if (quantumStartFrame !== this._quantumStartFrame) {
      kernels[0].coefficients = coefficients;
      kernels[0].process(inputs[0], outputs[0], blockSize);
    } else if (isCoefficientsUpdated) {
      kernels[0].processWithCoefficients(inputs[0], outputs[0], blockSize, coefficients);
    } else {
      kernels[0].process(inputs[0], outputs[0], blockSize);
    }

    this._quantumStartFrame = quantumEndFrame;
  },

  dspProcess2() {
    const blockSize = this.blockSize;
    const quantumStartFrame = this.context.currentSampleFrame;
    const quantumEndFrame = quantumStartFrame + blockSize;
    const inputs = this.inputs[0].bus.getChannelData();
    const outputs = this.outputs[0].bus.getMutableData();
    const isCoefficientsUpdated = this.dspUpdateCoefficients();
    const coefficients = this._coefficients;
    const kernels = this._kernels;

    if (quantumStartFrame !== this._quantumStartFrame) {
      kernels[0].coefficients = coefficients;
      kernels[1].coefficients = coefficients;
      kernels[0].process(inputs[0], outputs[0], blockSize);
      kernels[1].process(inputs[1], outputs[1], blockSize);
    } else if (isCoefficientsUpdated) {
      kernels[0].processWithCoefficients(inputs[0], outputs[0], blockSize, coefficients);
      kernels[1].processWithCoefficients(inputs[1], outputs[1], blockSize, coefficients);
    } else {
      kernels[0].process(inputs[0], outputs[0], blockSize);
      kernels[1].process(inputs[1], outputs[1], blockSize);
    }

    this._quantumStartFrame = quantumEndFrame;
  },

  dspProcessN() {
    const blockSize = this.blockSize;
    const quantumStartFrame = this.context.currentSampleFrame;
    const quantumEndFrame = quantumStartFrame + blockSize;
    const inputs = this.inputs[0].bus.getChannelData();
    const outputs = this.outputs[0].bus.getMutableData();
    const isCoefficientsUpdated = this.dspUpdateCoefficients();
    const coefficients = this._coefficients;
    const kernels = this._kernels;

    if (quantumStartFrame !== this._quantumStartFrame) {
      for (let i = 0, imax = kernels.length; i < imax; i++) {
        kernels[i].coefficients = coefficients;
        kernels[i].process(inputs[i], outputs[i], blockSize);
      }
    } else if (isCoefficientsUpdated) {
      for (let i = 0, imax = kernels.length; i < imax; i++) {
        kernels[i].processWithCoefficients(inputs[i], outputs[i], blockSize, coefficients);
      }
    } else {
      for (let i = 0, imax = kernels.length; i < imax; i++) {
        kernels[i].process(inputs[i], outputs[i], blockSize);
      }
    }

    this._quantumStartFrame = quantumEndFrame;
  },

  dspUpdateCoefficients() {
    const frequency = this._frequency.getSampleAccurateValues()[0];
    const detune = this._detune.getSampleAccurateValues()[0];
    const Q = this._Q.getSampleAccurateValues()[0];
    const gain = this._gain.getSampleAccurateValues()[0];

    if (frequency === this._prevFrequency && detune === this._prevDetune && Q === this._prevQ && gain === this._prevGain) {
      return false;
    }

    const normalizedFrequency = (frequency / this.sampleRate) * Math.pow(2, detune / 1200);

    this._coefficients = BiquadCoeffs[this._type](normalizedFrequency, Q, gain);
    this._prevFrequency = frequency;
    this._prevDetune = detune;
    this._prevQ = Q;
    this._prevGain = gain;

    return true;
  },

  dspGetFrequencyResponse(frequencyHz, magResponse, phaseResponse) {
    const frequency = this._frequency.getValue();
    const detune = this._detune.getValue();
    const Q = this._Q.getValue();
    const gain = this._gain.getValue();
    const normalizedFrequency = (frequency / this.sampleRate) * Math.pow(2, detune / 1200);
    const coefficients = BiquadCoeffs[this._type](normalizedFrequency, Q, gain);

    const b = [ coefficients[0], coefficients[1], coefficients[2] ];
    const a = [ 1, coefficients[3], coefficients[4] ];

    getFilterResponse(b, a, frequencyHz, magResponse, phaseResponse, this.sampleRate);
  }
};


module.exports = BiquadFilterNodeDSP;
