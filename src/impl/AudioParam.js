"use strict";

const assert = require("assert");
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

  getValue() {
    return this._value;
  }

  setValue(value) {
    this._value = this._userValue = util.toNumber(value);
  }

  getDefaultValue() {
    return this._defaultValue;
  }

  setValueAtTime(value, startTime) {
    value = util.toNumber(value);
    startTime = Math.max(0, util.toNumber(startTime));

    const eventItem = {
      type: AudioParamDSP.SET_VALUE_AT_TIME,
      time: startTime,
      args: [ value, startTime ],
      startSample: Math.round(startTime * this.sampleRate),
      endSample: Infinity,
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
        prevEventItem.endSample = eventItem.startSample;
        break;
      }
    }

    if (nextEventItem) {
      switch (nextEventItem.type) {
      case AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME:
      case AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
        nextEventItem.startSample = eventItem.startSample;
        nextEventItem.startValue = eventItem.startValue;
        break;
      }
      eventItem.endSample = nextEventItem.startSample;
    }

    if (index <= this._currentEventIndex) {
      this._currentEventIndex = index;
      this._remainSamples = 0;
    }
  }

  linearRampToValueAtTime(value, endTime) {
    value = util.toNumber(value);
    endTime = Math.max(0, util.toNumber(endTime));

    const eventItem = {
      type: AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME,
      time: endTime,
      args: [ value, endTime ],
      startSample: 0,
      endSample: Math.round(endTime * this.sampleRate),
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
        eventItem.startSample = prevEventItem.startSample;
        eventItem.startValue = prevEventItem.startValue;
        prevEventItem.endSample = eventItem.startSample;
        break;
      case AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME:
      case AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
      case AudioParamDSP.SET_VALUE_CURVE_AT_TIME:
        eventItem.startSample = prevEventItem.endSample;
        eventItem.startValue = prevEventItem.endValue;
        break;
      }
    }

    if (nextEventItem) {
      switch (nextEventItem.type) {
      case AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME:
      case AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
        nextEventItem.startSample = eventItem.endSample;
        nextEventItem.startValue = eventItem.endValue;
        break;
      }
    }

    if (index <= this._currentEventIndex) {
      this._currentEventIndex = index;
      this._remainSamples = 0;
    }
  }

  exponentialRampToValueAtTime(value, endTime) {
    value = Math.max(1e-6, util.toNumber(value));
    endTime = Math.max(0, util.toNumber(endTime));

    const eventItem = {
      type: AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME,
      time: endTime,
      args: [ value, endTime ],
      startSample: 0,
      endSample: Math.round(endTime * this.sampleRate),
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
        eventItem.startSample = prevEventItem.startSample;
        eventItem.startValue = prevEventItem.startValue;
        prevEventItem.endSample = eventItem.startSample;
        break;
      case AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME:
      case AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
      case AudioParamDSP.SET_VALUE_CURVE_AT_TIME:
        eventItem.startSample = prevEventItem.endSample;
        eventItem.startValue = prevEventItem.endValue;
        break;
      }
    }

    if (nextEventItem) {
      switch (nextEventItem.type) {
      case AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME:
      case AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
        nextEventItem.startSample = eventItem.endSample;
        nextEventItem.startValue = eventItem.endValue;
        break;
      }
    }

    if (index <= this._currentEventIndex) {
      this._currentEventIndex = index;
      this._remainSamples = 0;
    }
  }

  setTargetAtTime(target, startTime, timeConstant) {
    target = util.toNumber(target);
    startTime = Math.max(0, util.toNumber(startTime));
    timeConstant = Math.max(0, util.toNumber(timeConstant));

    const eventItem = {
      type: AudioParamDSP.SET_TARGET_AT_TIME,
      time: startTime,
      args: [ target, startTime, timeConstant ],
      startSample: Math.round(startTime * this.sampleRate),
      endSample: Infinity,
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
        prevEventItem.endSample = eventItem.startSample;
        break;
      case AudioParamDSP.SET_TARGET_AT_TIME:
        eventItem.startValue = 0;
        prevEventItem.endSample = eventItem.startSample;
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
        nextEventItem.startSample = eventItem.startSample;
        nextEventItem.startValue = eventItem.startValue;
        break;
      }
      eventItem.endSample = nextEventItem.startSample;
    }

    if (index <= this._currentEventIndex) {
      this._currentEventIndex = index;
      this._remainSamples = 0;
    }
  }

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
      startSample: Math.round(startTime * this.sampleRate),
      endSample: Math.round((startTime + duration) * this.sampleRate),
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
        prevEventItem.endSample = eventItem.startSample;
        break;
      }
    }

    if (nextEventItem) {
      switch (nextEventItem.type) {
      case AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME:
      case AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
        nextEventItem.startSample = eventItem.startSample;
        nextEventItem.startValue = eventItem.endValue;
        break;
      }
    }

    if (index <= this._currentEventIndex) {
      this._currentEventIndex = index;
      this._remainSamples = 0;
    }
  }

  cancelScheduledValues(startTime) {
    startTime = Math.max(0, util.toNumber(startTime));

    this._timeline = this._timeline.filter(eventItem => eventItem.time < startTime);

    const index = this._timeline.length - 1;
    const lastEventItem = this._timeline[index];

    if (lastEventItem) {
      switch (lastEventItem.type) {
      case AudioParamDSP.SET_VALUE_AT_TIME:
      case AudioParamDSP.SET_TARGET_AT_TIME:
        lastEventItem.endSample = Infinity;
        break;
      }
    }

    if (index <= this._currentEventIndex) {
      this._currentEventIndex = index;
      this._remainSamples = 0;
    }
  }

  getContext() {
    return this.context;
  }

  getInput(channel) {
    return this.inputs[channel|0];
  }

  getRate() {
    return this.toRateName(this._rate);
  }

  hasSampleAccurateValues() {
    return this._hasSampleAccurateValues;
  }

  getSampleAccurateValues() {
    return this.outputBus.getChannelData()[0];
  }

  enableOutputsIfNecessary() {}

  disableOutputsIfNecessary() {}

  isConnectedFrom() {
    const args = Array.from(arguments);

    if (args[0] && args[0].isConnectedTo) {
      return args[0].isConnectedTo.apply(args[0], [ this ].concat(args.slice(1)));
    }

    return false;
  }

  getTimeline() {
    return this._timeline;
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
