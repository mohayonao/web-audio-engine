"use strict";

const impl = require("../impl");
const AudioScheduledSourceNode = require("./AudioScheduledSourceNode");
const AudioParam = require("./AudioParam");

class OscillatorNode extends AudioScheduledSourceNode {
  constructor(context, opts) {
    super(context);

    this._impl = new impl.OscillatorNode(context._impl, opts);
    this._impl.$frequency = new AudioParam(context, this._impl.getFrequency());
    this._impl.$detune = new AudioParam(context, this._impl.getDetune());
    this._impl.$onended = null;

    if (opts && opts.periodicWave) {
      this.setPeriodicWave(opts.periodicWave);
    }
  }

  get type() {
    return this._impl.getType();
  }

  set type(value) {
    this._impl.setType(value);
  }

  get frequency() {
    return this._impl.$frequency;
  }

  get detune() {
    return this._impl.$detune;
  }

  setPeriodicWave(periodicWave) {
    this._impl.setPeriodicWave(periodicWave);
  }
}

module.exports = OscillatorNode;
