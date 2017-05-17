"use strict";

const { defineProp } = require("../utils");

class AudioParam {
  constructor(context, impl) {
    defineProp(this, "_context", context);
    defineProp(this, "_impl", impl);
  }

  get value() {
    return this._impl.getValue();
  }

  set value(value) {
    this._impl.setValue(value);
  }

  get defaultValue() {
    return this._impl.getDefaultValue();
  }

  setValueAtTime(value, startTime) {
    this._impl.setValueAtTime(value, startTime);
    return this;
  }

  linearRampToValueAtTime(value, endTime) {
    this._impl.linearRampToValueAtTime(value, endTime);
    return this;
  }

  exponentialRampToValueAtTime(value, endTime) {
    this._impl.exponentialRampToValueAtTime(value, endTime);
    return this;
  }

  setTargetAtTime(target, startTime, timeConstant) {
    this._impl.setTargetAtTime(target, startTime, timeConstant);
    return this;
  }

  setValueCurveAtTime(values, startTime, duration) {
    this._impl.setValueCurveAtTime(values, startTime, duration);
    return this;
  }

  cancelScheduledValues(startTime) {
    this._impl.cancelScheduledValues(startTime);
    return this;
  }
}

module.exports = AudioParam;
