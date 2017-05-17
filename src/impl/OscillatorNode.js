"use strict";

const AudioScheduledSourceNode = require("./AudioScheduledSourceNode");
const PeriodicWave = require("./PeriodicWave");
const OscillatorNodeDSP = require("./dsp/OscillatorNode");
const { defaults } = require("../utils");
const { toImpl } = require("../utils");
const { AUDIO_RATE } = require("../constants/AudioParamRate");
const { SINE, SAWTOOTH, TRIANGLE, SQUARE, CUSTOM } = require("../constants/OscillatorType");

const DefaultPeriodicWaves = {};
const allowedOscillatorTypes = [
  SINE, SAWTOOTH, TRIANGLE, SQUARE
];

const DEFAULT_TYPE = SINE;
const DEFAULT_FREQUENCY = 440;
const DEFAULT_DETUNE = 0;

class OscillatorNode extends AudioScheduledSourceNode {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {string}       opts.type
   * @param {number}       opts.frequency
   * @param {number}       opts.detune
   */
  constructor(context, opts = {}) {
    let type = defaults(opts.type, DEFAULT_TYPE);
    let frequency = defaults(opts.frequency, DEFAULT_FREQUENCY);
    let detune = defaults(opts.detune, DEFAULT_DETUNE);

    super(context, opts);

    this._frequency = this.addParam(AUDIO_RATE, frequency);
    this._detune = this.addParam(AUDIO_RATE, detune);
    this._type = type;
    this._periodicWave = this.buildPeriodicWave(this._type);
    this._waveTable = null;

    this.dspInit();
  }

  /**
   * @return {string}
   */
  getType() {
    return this._type;
  }

  /**
   * @param {string} value
   */
  setType(value) {
    /* istanbul ignore else */
    if (allowedOscillatorTypes.indexOf(value) !== -1) {
      this._type = value;
      this._periodicWave = this.buildPeriodicWave(value);
      this._waveTable = this._periodicWave.getWaveTable();
    }
  }

  /**
   * @param {AudioParam}
   */
  getFrequency() {
    return this._frequency;
  }

  /**
   * @param {AudioParam}
   */
  getDetune() {
    return this._detune;
  }

  /**
   * @param {PeriodicWave} periodicWave
   */
  setPeriodicWave(periodicWave) {
    periodicWave = toImpl(periodicWave);

    /* istanbul ignore else */
    if (periodicWave instanceof PeriodicWave) {
      this._type = CUSTOM;
      this._periodicWave = periodicWave;
      this._waveTable = this._periodicWave.getWaveTable();
    }
  }

  /**
   * @return {PeriodicWave}
   */
  getPeriodicWave() {
    return this._periodicWave;
  }

  /**
   * @param {string} type
   * @return {PeriodicWave}
   */
  buildPeriodicWave(type) {
    const sampleRate = this.context.sampleRate
    const key = type + ":" + sampleRate;

    /* istanbul ignore else */
    if (!DefaultPeriodicWaves[key]) {
      const periodicWave = new PeriodicWave({ sampleRate }, { constraints: false });

      periodicWave.generateBasicWaveform(type);

      DefaultPeriodicWaves[key] = periodicWave;
    }

    return DefaultPeriodicWaves[key];
  }
}

Object.assign(OscillatorNode.prototype, OscillatorNodeDSP);

module.exports = OscillatorNode;
