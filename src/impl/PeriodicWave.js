"use strict";

const PeriodicWaveDSP = require("./dsp/PeriodicWave");

class PeriodicWave {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {Float32Array} opts.real
   * @param {Float32Array} opts.imag
   * @param {boolean}      opts.constraints
   */
  constructor(context, opts) {
    opts = opts || /* istanbul ignore next */ {};

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

  /**
   * @return {Float32Array}
   */
  getReal() {
    return this._real;
  }

  /**
   * @return {Float32Array}
   */
  getImag() {
    return this._imag;
  }

  /**
   * @return {booleam}
   */
  getConstraints() {
    return this._constants;
  }

  /**
   * @return {string}
   */
  getName() {
    return this._name;
  }

  /**
   * @return {Float32Array}
   */
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
      this._imag = new Float32Array(Array.from({ length }, (_, n) => {
        return n === 0 ? 0 : Math.pow(-1, n + 1) * (2 / (n * Math.PI));
      }));
      this._name = "sawtooth";
      this.dspBuildWaveTable();
      break;
    case "triangle":
      this._real = new Float32Array(length);
      this._imag = new Float32Array(Array.from({ length }, (_, n) => {
        return n === 0 ? 0 : (8 * Math.sin(n * Math.PI / 2)) / Math.pow(n * Math.PI,  2);
      }));
      this._name = "triangle";
      this.dspBuildWaveTable();
      break;
    case "square":
      this._real = new Float32Array(length);
      this._imag = new Float32Array(Array.from({ length }, (_, n) => {
        return n === 0 ? 0 : (2 / (n * Math.PI)) * (1 - Math.pow(-1, n));
      }));
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

Object.assign(PeriodicWave.prototype, PeriodicWaveDSP);

module.exports = PeriodicWave;
