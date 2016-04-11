"use strict";

const assert = require("power-assert");
const util = require("../util");
const AudioNodeInput = require("./core/AudioNodeInput");
const AudioBus = require("./core/AudioBus");
const AudioParamDSP = require("./dsp/AudioParam");

class AudioParam {
  constructor(context, opts) {
    opts = opts || /* istanbul ignore next */ {};

    let rate = util.defaults(opts.rate, "control");
    let defaultValue = util.defaults(opts.defaultValue, 0);

    this.context = context;
    this.processingSizeInFrames = context.processingSizeInFrames;
    this.sampleRate = context.sampleRate;
    this._rate = this.fromRateName(rate);
    this._defaultValue = util.toNumber(defaultValue);
    this._value = this._defaultValue;
    this._timeline = [];
    this._inputs = [
      new AudioNodeInput({
        node: this,
        index: 0,
        numberOfChannels: 1,
        channelCount: 1,
        channelCountMode: "explicit"
      })
    ];
    this._outpus = [];
    this._outputBus = new AudioBus(1, this.processingSizeInFrames, this.sampleRate);

    this.dspInit(this._rate);
  }

  getValue() {
    return this._value;
  }

  setValue(value) {
    this._value = util.toNumber(value);
  }

  getDefaultValue() {
    return this._defaultValue;
  }

  setValueAtTime(value, startTime) {
    value = util.toNumber(value);
    startTime = Math.max(0, util.toNumber(startTime));

    this.insertEvent({
      type: AudioParamDSP.SET_VALUE_AT_TIME,
      time: startTime,
      args: [ value, startTime ]
    });
  }

  linearRampToValueAtTime(value, endTime) {
    value = util.toNumber(value);
    endTime = Math.max(0, util.toNumber(endTime));

    this.insertEvent({
      type: AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME,
      time: endTime,
      args: [ value, endTime ]
    });
  }

  exponentialRampToValueAtTime(value, endTime) {
    value = Math.max(1e-6, util.toNumber(value));
    endTime = Math.max(0, util.toNumber(endTime));

    this.insertEvent({
      type: AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME,
      time: endTime,
      args: [ value, endTime ]
    });
  }

  setTargetAtTime(target, startTime, timeConstant) {
    target = util.toNumber(target);
    startTime = Math.max(0, util.toNumber(startTime));
    timeConstant = Math.max(0, util.toNumber(timeConstant));

    this.insertEvent({
      type: AudioParamDSP.SET_TARGET_AT_TIME,
      time: startTime,
      args: [ target, startTime, timeConstant ]
    });
  }

  setValueCurveAtTime(values, startTime, duration) {
    startTime = Math.max(0, util.toNumber(startTime));
    duration = Math.max(0, util.toNumber(duration));

    this.insertEvent({
      type: AudioParamDSP.SET_VALUE_CURVE_AT_TIME,
      time: startTime,
      args: [ values, startTime, duration ]
    });
  }

  cancelScheduledValues(startTime) {
    startTime = Math.max(0, util.toNumber(startTime));

    this._timeline = this._timeline.filter(eventItem => eventItem.time < startTime);
  }

  getContext() {
    return this.context;
  }

  getInput(channel) {
    return this._inputs[channel|0];
  }

  getRate() {
    return this.toRateName(this._rate);
  }

  hasSampleAccurateValues() {
    return this._hasSampleAccurateValues;
  }

  getSampleAccurateValues() {
    return this._outputBus.getChannelData()[0];
  }

  /* istanbul ignore next */
  enableOutputsIfNecessary() {}

  /* istanbul ignore next */
  disableOutputsIfNecessary() {}

  isConnectedFrom() {
    const args = Array.from(arguments);

    if (args[0] && args[0].isConnectedTo) {
      return args[0].isConnectedTo.apply(args[0], [ this ].concat(args.slice(1)));
    }

    return false;
  }

  getEvents() {
    return this._timeline.map((event) => {
      return {
        type: this.toMethodName(event.type),
        time: event.time,
        args: event.args
      };
    });
  }

  insertEvent(eventItem) {
    const time = eventItem.time;
    const events = this._timeline;

    if (events.length === 0 || events[events.length - 1].time < time) {
      events.push(eventItem);
      return;
    }

    let pos = 0;
    let replace = 0;

    while (pos < events.length) {
      if (events[pos].time === time && events[pos].type === eventItem.type) {
        replace = 1;
        break;
      }
      if (time < events[pos].time) {
        break;
      }
      pos += 1;
    }

    events.splice(pos, replace, eventItem);
  }

  fromRateName(value) {
    if (value === "audio") {
      return AudioParamDSP.AUDIO;
    }
    return AudioParamDSP.CONTROL;
  }

  toRateName(value) {
    if (value === AudioParamDSP.AUDIO) {
      return "audio";
    }
    return "control";
  }

  toMethodName(value) {
    switch (value) {
    case AudioParamDSP.SET_VALUE_AT_TIME:
      return "setValueAtTime";
    case AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME:
      return "linearRampToValueAtTime";
    case AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
      return "exponentialRampToValueAtTime";
    case AudioParamDSP.SET_TARGET_AT_TIME:
      return "setTargetAtTime";
    case AudioParamDSP.SET_VALUE_CURVE_AT_TIME:
      return "setValueCurveAtTime"
    }
    /* istanbul ignore next */
    assert(!"NOT REACHED");
  }
}

module.exports = util.mixin(AudioParam, AudioParamDSP);
