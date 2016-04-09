"use strict";

const util = require("../_util");
const AudioSourceNode = require("./AudioSourceNode");
const PeriodicWave = require("./PeriodicWave");
const OscillatorNodeDSP = require("./dsp/OscillatorNode");

const OscillatorTypes = PeriodicWave.BasicWaveForms;
const DefaultPeriodicWaves = {};

class OscillatorNode extends AudioSourceNode {
  constructor(context) {
    super(context);
    this._frequency = this.addParam("audio", 440);
    this._detune = this.addParam("audio", 0);
    this._type = "sine";
    this._periodicWave = this.buildPeriodicWave(this._type);
    this._startTime = Infinity;
    this._stopTime = Infinity;

    this.dspInit();
  }

  getType() {
    return this._type;
  }

  setType(value) {
    /* istanbul ignore else */
    if (OscillatorTypes.indexOf(value) !== -1) {
      this._type = value;
      this._periodicWave = this.buildPeriodicWave(value);
    }
  }

  getFrequency() {
    return this._frequency;
  }

  getDetune() {
    return this._detune;
  }

  start(when) {
    /* istanbul ignore else */
    if (this._startTime === Infinity) {
      when = Math.max(this.context.currentTime, util.toNumber(when));
      this._startTime = when;
      this.getOutput(0).enable();
    }
  }

  stop(when) {
    /* istanbul ignore else */
    if (this._startTime !== Infinity && this._stopTime === Infinity) {
      when = Math.max(this.context.currentTime, this._startTime, util.toNumber(when));
      this._stopTime = when;
    }
  }

  setPeriodicWave(periodicWave) {
    periodicWave = util.toImpl(periodicWave);

    /* istanbul ignore else */
    if (periodicWave instanceof PeriodicWave) {
      this._type = "custom";
      this._periodicWave = periodicWave;
    }
  }

  getPeriodicWave() {
    return this._periodicWave;
  }

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

module.exports = util.mixin(OscillatorNode, OscillatorNodeDSP);
