"use strict";

const impl = require("../impl");
const AudioNode = require("./AudioNode");
const AudioParam = require("./AudioParam");

class OscillatorNode extends AudioNode {
  constructor(context) {
    super(context);

    this._impl = new impl.OscillatorNode(context._impl);
    this._impl.$frequency = new AudioParam(context, this._impl.getFrequency());
    this._impl.$detune = new AudioParam(context, this._impl.getDetune());
    this._impl.$onended = null;
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

  get onended() {
    return this._impl.$onended;
  }

  set onended(callback) {
    this._impl.replaceEventListener("ended", this._impl.$onended, callback);
    this._impl.$onended = callback;
  }

  start(when) {
    this._impl.start(when);
  }

  stop(when) {
    this._impl.stop(when);
  }

  setPeriodicWave(periodicWave) {
    this._impl.setPeriodicWave(periodicWave);
  }
}

module.exports = OscillatorNode;
