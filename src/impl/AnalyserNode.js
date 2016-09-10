"use strict";

const fft = require("fourier-transform");
const util = require("../util");
const AudioNode = require("./AudioNode");
const AnalyserNodeDSP = require("./dsp/AnalyserNode");
const { MAX } = require("../constants/ChannelCountMode");

const MaxFFTSize = 32768;
const MinFFTSize = 32;

class AnalyserNode extends AudioNode {
  /**
   * @param {AudioContext} context
   */
  constructor(context) {
    super(context, {
      inputs: [ 1 ],
      outputs: [ 1 ],
      channelCount: 1,
      channelCountMode: MAX
    });
    this._fftSize = 2048;
    this._minDecibels = -100;
    this._maxDecibels = -30;
    this._smoothingTimeConstant = 0.8;
    this.dspInit(this._fftSize);
  }

  /**
   * @return {number}
   */
  getFftSize() {
    return this._fftSize;
  }

  /**
   * @param {number} value
   */
  setFftSize(value) {
    value = util.clamp(value|0, MinFFTSize, MaxFFTSize);
    value = util.toPowerOfTwo(value, Math.ceil);
    this._fftSize = value;
    this.dspUpdateSizes(this._fftSize);
  }

  /**
   * @return {number}
   */
  getFrequencyBinCount() {
    return this._fftSize / 2;
  }

  /**
   * @return {number}
   */
  getMinDecibels() {
    return this._minDecibels;
  }

  /**
   * @param {number} value
   */
  setMinDecibels(value) {
    value = util.toNumber(value);
    /* istanbul ignore else */
    if (-Infinity < value && value < this._maxDecibels) {
      this._minDecibels = value;
    }
  }

  /**
   * @return {number}
   */
  getMaxDecibels() {
    return this._maxDecibels;
  }

  /**
   * @param {number} value
   */
  setMaxDecibels(value) {
    value = util.toNumber(value);
    /* istanbul ignore else */
    if (this._minDecibels < value && value < Infinity) {
      this._maxDecibels = value;
    }
  }


  /**
   * @return {number}
   */
  getSmoothingTimeConstant() {
    return this._smoothingTimeConstant;
  }

  /**
   * @param {number}
   */
  setSmoothingTimeConstant(value) {
    value = util.clamp(util.toNumber(value), 0, 1);
    this._smoothingTimeConstant = value;
  }

  /**
   * @param {Float32Array} array
   */
  getFloatFrequencyData(array) {
    const fftSize = this._fftSize;
    const s = this._smoothingTimeConstant;
    const len = array.length;
    let waveform = new Float32Array(fftSize);
    // 1. down-mix
    this.getFloatTimeDomainData(waveform);
    // 2. Apply Blackman window
    waveform = waveform.map((v, i) => v * this._blackmanTable[i] || 0);
    // 3. FFT
    let spectrum = fft(waveform);
    const numFrequencyBins = spectrum.length;
    // re-size to frequencyBinCount, then do more processing
    for (let i = 0; i < numFrequencyBins && i < len; i++) {
      let v = spectrum[i];
      // 4. Smooth over data
      this._previousSmooth[i] = (s * this._previousSmooth[i]) + ((1 - s) * v);
      // 5. Convert to dB
      v = util.toDecibel(this._previousSmooth[i]);
      // store in array
      array[i] = Number.isFinite(v) ? v : 0;
    }
  }

  /**
   * @param {Uint8Array} array
   */
  getByteFrequencyData(array) {
    const dBMin = this._minDecibels;
    const dBMax = this._maxDecibels;
    const spectrum = new Float32Array(array.length);
    this.getFloatFrequencyData(spectrum);
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.round(util.normalize(spectrum[i], dBMin, dBMax) * 255);
    }
  }

  /**
   * @param {Float32Array} array
   */
  getFloatTimeDomainData(array) {
    const len = this._timeDomainBuffer.length;
    for (let i = 0; i < array.length && i < len; i++) {
      array[i] = this._timeDomainBuffer[i] || 0;
    }
  }

  /**
   * @param {Uint8Array} array
   */
  getByteTimeDomainData(array) {
    const waveform = new Float32Array(array.length);
    this.getFloatTimeDomainData(waveform);
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.round(util.normalize(waveform[i], -1, 1) * 255);
    }
  }

  /**
   * @param {number} numberOfChannels
   */
  channelDidUpdate(numberOfChannels) {
    this.outputs[0].setNumberOfChannels(numberOfChannels);
  }
}

Object.assign(AnalyserNode.prototype, AnalyserNodeDSP);

module.exports = AnalyserNode;
