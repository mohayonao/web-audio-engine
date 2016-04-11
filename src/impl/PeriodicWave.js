"use strict";

const util = require("../util");
const PeriodicWaveDSP = require("./dsp/PeriodicWave");

class PeriodicWave {
  constructor(context, opts) {
    let real = opts.real;
    let imag = opts.imag;
    let constraints = opts.constraints;

    this.context = context;
    this._real = real;
    this._imag = imag;
    this._constants = !!constraints;
    this._name = "custom";

    this.dspInit();
  }

  getReal() {
    return this._real;
  }

  getImag() {
    return this._imag;
  }

  getConstraints() {
    return this._constants;
  }

  getName() {
    return this._name;
  }

  getWaveTable() {
    if (!this._waveTable) {
      this._waveTable = this.dspBuildWaveTable();
    }
    return this._waveTable;
  }

  generateBasicWaveform(type) {
    const length = 512;

    switch (type) {
    case "sine":
      this._real = new Float32Array([ 0, 0 ]);
      this._imag = new Float32Array([ 0, 1 ]);
      this._name = "sine";
      break;
    case "sawtooth":
      this._real = new Float32Array(length);
      this._imag = new Float32Array(length).map((_, n) => {
        return n === 0 ? 0 : Math.pow(-1, n + 1) * (2 / (n * Math.PI));
      });
      this._name = "sawtooth";
      this.dspBuildWaveTable();
      break;
    case "triangle":
      this._real = new Float32Array(length);
      this._imag = new Float32Array(length).map((_, n) => {
        return n === 0 ? 0 : (8 * Math.sin(n * Math.PI / 2)) / Math.pow(n * Math.PI,  2);
      });
      this._name = "triangle";
      this.dspBuildWaveTable();
      break;
    case "square":
      this._real = new Float32Array(length);
      this._imag = new Float32Array(length).map((_, n) => {
        return n === 0 ? 0 : (2 / (n * Math.PI)) * (1 - Math.pow(-1, n));
      });
      this._name = "square";
      this.dspBuildWaveTable();
      break;
    default:
      this._real = new Float32Array([ 0 ]);
      this._imag = new Float32Array([ 0 ]);
      this._name = "custom";
      this.dspBuildWaveTable();
      break;
    }
  }
}

PeriodicWave.BasicWaveForms = [ "sine", "sawtooth", "triangle", "square" ];

module.exports = util.mixin(PeriodicWave, PeriodicWaveDSP);
