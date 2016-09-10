"use strict";

const assert = require("assert");
const util = require("../util");
const AudioNodeInput = require("./core/AudioNodeInput");
const AudioBus = require("./core/AudioBus");
const AudioParamDSP = require("./dsp/AudioParam");

/**
 * @prop {AudioContext}      context
 * @prop {number}            blockSize
 * @prop {number}            sampleRate
 * @prop {AudioNodeInput[]}  inputs
 * @prop {AudioBus}          outputBus
 */
class AudioParam {
  /**
   * @param {AudioContext} context
   * @param {string}       opts.rate - [ "audio", "control "]
   * @param {number}       opts.defaultValue
   */
  constructor(context, /* istanbul ignore next */ opts = {}) {
    let rate = util.defaults(opts.rate, "control");
    let defaultValue = util.defaults(opts.defaultValue, 0);

    this.context = context;
    this.blockSize = context.blockSize;
    this.sampleRate = context.sampleRate;
    this.inputs = [
      new AudioNodeInput({
        node: this,
        index: 0,
        numberOfChannels: 1,
        channelCount: 1,
        channelCountMode: "explicit"
      })
    ];
    this.outputBus = new AudioBus(1, this.blockSize, this.sampleRate);

    this._rate = this.fromRateName(rate);
    this._defaultValue = util.toNumber(defaultValue);
    this._value = this._defaultValue;
    this._userValue = this._value;
    this._timeline = [];

    this.dspInit(this._rate);
  }

  /**
   * @return {number}
   */
  getValue() {
    return this._value;
  }

  /**
   * @param {number} value
   */
  setValue(value) {
    this._value = this._userValue = util.toNumber(value);
  }

  /**
   * @return {number}
   */
  getDefaultValue() {
    return this._defaultValue;
  }

  /**
   * @param {number} value
   * @param {number} startTime
   */
  setValueAtTime(value, startTime) {
    value = util.toNumber(value);
    startTime = Math.max(0, util.toNumber(startTime));

    const eventItem = {
      type: AudioParamDSP.SET_VALUE_AT_TIME,
      time: startTime,
      args: [ value, startTime ],
      startFrame: Math.round(startTime * this.sampleRate),
      endFrame: Infinity,
      startValue: value,
      endValue: value
    };
    const index = this.insertEvent(eventItem);
    const prevEventItem = this._timeline[index - 1];
    const nextEventItem = this._timeline[index + 1];

    if (prevEventItem) {
      switch (prevEventItem.type) {
      case AudioParamDSP.SET_VALUE_AT_TIME:
      case AudioParamDSP.SET_TARGET_AT_TIME:
        prevEventItem.endFrame = eventItem.startFrame;
        break;
      }
    }

    if (nextEventItem) {
      switch (nextEventItem.type) {
      case AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME:
      case AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
        nextEventItem.startFrame = eventItem.startFrame;
        nextEventItem.startValue = eventItem.startValue;
        break;
      }
      eventItem.endFrame = nextEventItem.startFrame;
    }

    if (index <= this._currentEventIndex) {
      this._currentEventIndex = index;
      this._remainSamples = 0;
    }
  }

  /**
   * @param {number} value
   * @param {number} endTime
   */
  linearRampToValueAtTime(value, endTime) {
    value = util.toNumber(value);
    endTime = Math.max(0, util.toNumber(endTime));

    const eventItem = {
      type: AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME,
      time: endTime,
      args: [ value, endTime ],
      startFrame: 0,
      endFrame: Math.round(endTime * this.sampleRate),
      startValue: this._defaultValue,
      endValue: value
    };
    const index = this.insertEvent(eventItem);
    const prevEventItem = this._timeline[index - 1];
    const nextEventItem = this._timeline[index + 1];

    if (prevEventItem) {
      switch (prevEventItem.type) {
      case AudioParamDSP.SET_VALUE_AT_TIME:
      case AudioParamDSP.SET_TARGET_AT_TIME:
        eventItem.startFrame = prevEventItem.startFrame;
        eventItem.startValue = prevEventItem.startValue;
        prevEventItem.endFrame = eventItem.startFrame;
        break;
      case AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME:
      case AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
      case AudioParamDSP.SET_VALUE_CURVE_AT_TIME:
        eventItem.startFrame = prevEventItem.endFrame;
        eventItem.startValue = prevEventItem.endValue;
        break;
      }
    }

    if (nextEventItem) {
      switch (nextEventItem.type) {
      case AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME:
      case AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
        nextEventItem.startFrame = eventItem.endFrame;
        nextEventItem.startValue = eventItem.endValue;
        break;
      }
    }

    if (index <= this._currentEventIndex) {
      this._currentEventIndex = index;
      this._remainSamples = 0;
    }
  }

  /**
   * @param {number} value
   * @param {number} endTime
   */
  exponentialRampToValueAtTime(value, endTime) {
    value = Math.max(1e-6, util.toNumber(value));
    endTime = Math.max(0, util.toNumber(endTime));

    const eventItem = {
      type: AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME,
      time: endTime,
      args: [ value, endTime ],
      startFrame: 0,
      endFrame: Math.round(endTime * this.sampleRate),
      startValue: Math.max(1e-6, this._defaultValue),
      endValue: value
    };
    const index = this.insertEvent(eventItem);
    const prevEventItem = this._timeline[index - 1];
    const nextEventItem = this._timeline[index + 1];

    if (prevEventItem) {
      switch (prevEventItem.type) {
      case AudioParamDSP.SET_VALUE_AT_TIME:
      case AudioParamDSP.SET_TARGET_AT_TIME:
        eventItem.startFrame = prevEventItem.startFrame;
        eventItem.startValue = prevEventItem.startValue;
        prevEventItem.endFrame = eventItem.startFrame;
        break;
      case AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME:
      case AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
      case AudioParamDSP.SET_VALUE_CURVE_AT_TIME:
        eventItem.startFrame = prevEventItem.endFrame;
        eventItem.startValue = prevEventItem.endValue;
        break;
      }
    }

    if (nextEventItem) {
      switch (nextEventItem.type) {
      case AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME:
      case AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
        nextEventItem.startFrame = eventItem.endFrame;
        nextEventItem.startValue = eventItem.endValue;
        break;
      }
    }

    if (index <= this._currentEventIndex) {
      this._currentEventIndex = index;
      this._remainSamples = 0;
    }
  }

  /**
   * @param {number} target
   * @param {number} startTime
   * @param {number} timeConstant
   */
  setTargetAtTime(target, startTime, timeConstant) {
    target = util.toNumber(target);
    startTime = Math.max(0, util.toNumber(startTime));
    timeConstant = Math.max(0, util.toNumber(timeConstant));

    const eventItem = {
      type: AudioParamDSP.SET_TARGET_AT_TIME,
      time: startTime,
      args: [ target, startTime, timeConstant ],
      startFrame: Math.round(startTime * this.sampleRate),
      endFrame: Infinity,
      startValue: 0,
      endValue: target
    };
    const index = this.insertEvent(eventItem);
    const prevEventItem = this._timeline[index - 1];
    const nextEventItem = this._timeline[index + 1];

    if (prevEventItem) {
      switch (prevEventItem.type) {
      case AudioParamDSP.SET_VALUE_AT_TIME:
        eventItem.startValue = prevEventItem.endValue;
        prevEventItem.endFrame = eventItem.startFrame;
        break;
      case AudioParamDSP.SET_TARGET_AT_TIME:
        eventItem.startValue = 0;
        prevEventItem.endFrame = eventItem.startFrame;
        break;
      case AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME:
      case AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
      case AudioParamDSP.SET_VALUE_CURVE_AT_TIME:
        eventItem.startValue = prevEventItem.endValue;
        break;
      }
    }

    if (nextEventItem) {
      switch (nextEventItem.type) {
      case AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME:
      case AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
        nextEventItem.startFrame = eventItem.startFrame;
        nextEventItem.startValue = eventItem.startValue;
        break;
      }
      eventItem.endFrame = nextEventItem.startFrame;
    }

    if (index <= this._currentEventIndex) {
      this._currentEventIndex = index;
      this._remainSamples = 0;
    }
  }

  /**
   * @param {Float32Array[]} values
   * @param {number}         startTime
   * @param {number}         duration
   */
  setValueCurveAtTime(values, startTime, duration) {
    startTime = Math.max(0, util.toNumber(startTime));
    duration = Math.max(0, util.toNumber(duration));

    if (values.length === 0 || duration === 0) {
      return;
    }

    const eventItem = {
      type: AudioParamDSP.SET_VALUE_CURVE_AT_TIME,
      time: startTime,
      args: [ values, startTime, duration ],
      startFrame: Math.round(startTime * this.sampleRate),
      endFrame: Math.round((startTime + duration) * this.sampleRate),
      startValue: values[0],
      endValue: values[values.length - 1]
    };
    const index = this.insertEvent(eventItem);
    const prevEventItem = this._timeline[index - 1];
    const nextEventItem = this._timeline[index + 1];

    if (prevEventItem) {
      switch (prevEventItem.type) {
      case AudioParamDSP.SET_VALUE_AT_TIME:
      case AudioParamDSP.SET_TARGET_AT_TIME:
        prevEventItem.endFrame = eventItem.startFrame;
        break;
      }
    }

    if (nextEventItem) {
      switch (nextEventItem.type) {
      case AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME:
      case AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
        nextEventItem.startFrame = eventItem.startFrame;
        nextEventItem.startValue = eventItem.endValue;
        break;
      }
    }

    if (index <= this._currentEventIndex) {
      this._currentEventIndex = index;
      this._remainSamples = 0;
    }
  }

  /**
   * @param {number} startTime
   */
  cancelScheduledValues(startTime) {
    startTime = Math.max(0, util.toNumber(startTime));

    this._timeline = this._timeline.filter(eventItem => eventItem.time < startTime);

    const index = this._timeline.length - 1;
    const lastEventItem = this._timeline[index];

    if (lastEventItem) {
      switch (lastEventItem.type) {
      case AudioParamDSP.SET_VALUE_AT_TIME:
      case AudioParamDSP.SET_TARGET_AT_TIME:
        lastEventItem.endFrame = Infinity;
        break;
      }
    }

    if (index <= this._currentEventIndex) {
      this._currentEventIndex = index;
      this._remainSamples = 0;
    }
  }

  /**
   * @return {string}
   */
  getRate() {
    return this.toRateName(this._rate);
  }

  /**
   * @return {boolean}
   */
  hasSampleAccurateValues() {
    return this._hasSampleAccurateValues;
  }

  /**
   * @return {Float32Array}
   */
  getSampleAccurateValues() {
    return this.outputBus.getChannelData()[0];
  }

  /**
   *
   */
  enableOutputsIfNecessary() {}

  /**
   *
   */
  disableOutputsIfNecessary() {}

  /**
   * @return {object[]}
   */
  getTimeline() {
    return this._timeline;
  }

  /**
   * @return {object[]}
   */
  getEvents() {
    return this._timeline.map((event) => {
      return {
        type: this.toMethodName(event.type),
        time: event.time,
        args: event.args
      };
    });
  }

  /**
   * @param {object}
   * @return {number}
   */
  insertEvent(eventItem) {
    const time = eventItem.time;
    const timeline = this._timeline;

    if (timeline.length === 0 || timeline[timeline.length - 1].time < time) {
      timeline.push(eventItem);
      return timeline.length - 1;
    }

    let pos = 0;
    let replace = 0;

    while (pos < timeline.length) {
      if (timeline[pos].time === time && timeline[pos].type === eventItem.type) {
        replace = 1;
        break;
      }
      if (time < timeline[pos].time) {
        break;
      }
      pos += 1;
    }

    timeline.splice(pos, replace, eventItem);

    return pos
  }

  /**
   * @param {string} value
   * @return {number}
   */
  fromRateName(value) {
    if (value === "audio") {
      return AudioParamDSP.AUDIO;
    }
    return AudioParamDSP.CONTROL;
  }

  /**
   * @param {number} value
   * @return {string}
   */
  toRateName(value) {
    if (value === AudioParamDSP.AUDIO) {
      return "audio";
    }
    return "control";
  }

  /**
   * @param {number} value
   * @return {string}
   */
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

Object.assign(AudioParam.prototype, AudioParamDSP);

module.exports = AudioParam;
