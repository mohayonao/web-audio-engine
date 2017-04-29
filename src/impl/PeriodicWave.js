"use strict";

const nmap = require("nmap");
const PeriodicWaveDSP = require("./dsp/PeriodicWave");
const { SINE, SAWTOOTH, TRIANGLE, SQUARE, CUSTOM } = require("../constants/OscillatorType");

class PeriodicWave {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {Float32Array} opts.real
   * @param {Float32Array} opts.imag
   * @param {boolean}      opts.constraints
   */
  constructor(context, opts = {}) {
    let real = opts.real;
    let imag = opts.imag;
    let constraints = opts.constraints;

    this.context = context;
    this._real = real;
    this._imag = imag;
    this._constants = !!constraints;
    this._name = CUSTOM;

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
    case SINE:
      this._real = new Float32Array([ 0, 0 ]);
      this._imag = new Float32Array([ 0, 1 ]);
      this._name = SINE;
      break;
    case SAWTOOTH:
      this._real = new Float32Array(length);
      this._imag = new Float32Array(nmap(length, (_, n) => {
        return n === 0 ? 0 : Math.pow(-1, n + 1) * (2 / (n * Math.PI));
      }));
      this._name = SAWTOOTH;
      this.dspBuildWaveTable();
      break;
    case TRIANGLE:
      this._real = new Float32Array(length);
      this._imag = new Float32Array(nmap(length, (_, n) => {
        return n === 0 ? 0 : (8 * Math.sin(n * Math.PI / 2)) / Math.pow(n * Math.PI,  2);
      }));
      this._name = TRIANGLE;
      this.dspBuildWaveTable();
      break;
    case SQUARE:
      this._real = new Float32Array(length);
      this._imag = new Float32Array(nmap(length, (_, n) => {
        return n === 0 ? 0 : (2 / (n * Math.PI)) * (1 - Math.pow(-1, n));
      }));
      this._name = SQUARE;
      this.dspBuildWaveTable();
      break;
    default:
      this._real = new Float32Array([ 0 ]);
      this._imag = new Float32Array([ 0 ]);
      this._name = CUSTOM;
      this.dspBuildWaveTable();
      break;
    }
  }
}

Object.assign(PeriodicWave.prototype, PeriodicWaveDSP);

module.exports = PeriodicWave;
