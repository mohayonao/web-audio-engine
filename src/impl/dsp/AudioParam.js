"use strict";

const assert = require("assert");

const SET_VALUE_AT_TIME = 1;
const LINEAR_RAMP_TO_VALUE_AT_TIME = 2;
const EXPONENTIAL_RAMP_TO_VALUE_AT_TIME = 3;
const SET_TARGET_AT_TIME = 4;
const SET_VALUE_CURVE_AT_TIME = 5;
const CONTROL = 1;
const AUDIO = 2;

class AudioParam {
  dspInit() {
    this._prevValue = NaN;
    this._hasSampleAccurateValues = false;
    this._currentEventIndex = -1;
    this._fillToFrame = 0;
    this._schedParams = {};
  }

  dspProcess(e) {
    const input = this._inputs[0];
    const inputBus = input.getAudioBus();

    input.pull(e);

    const hasEvents = !!this._timeline.length;
    const hasInput = !inputBus.isSilent();
    const algorithm = hasEvents * 2 + hasInput;

    switch (algorithm) {
    case 0:
      // events: x / input: x
      return this.dspStaticValue(e);
    case 1:
      // events: x / input: o
      return this.dspInputAndOffset(e, inputBus);
    case 2:
      // events: o / input: x
      return this.dspEvents(e);
    case 3:
      // events: o / input: o
      return this.dspEventsAndInput(e, inputBus);
    default:
      /* istanbul ignore next */
      assert(!"NOT REACHED");
    }
  }

  dspStaticValue() {
    const value = this._value;

    if (value !== this._prevValue) {
      if (value === 0) {
        this._outputBus.zeros();
      } else {
        this._outputBus.getMutableData()[0].fill(value);
      }
      this._prevValue = value;
    }

    this._hasSampleAccurateValues = false;
  }

  dspInputAndOffset(e, inputBus) {
    const outputBus = this._outputBus;
    const output = outputBus.getMutableData()[0];
    const input = inputBus.getChannelData()[0];
    const inNumSamples = e.inNumSamples;
    const value = this._value;

    output.set(input);

    if (value !== 0) {
      for (let i = 0; i < inNumSamples; i++) {
        output[i] += value;
      }
    }

    this._prevValue = NaN;
    this._hasSampleAccurateValues = true;
  }

  dspEvents(e) {
    const outputBus = this._outputBus;
    const output = outputBus.getMutableData()[0];

    this.dspValuesForTimeRange(e, output);

    this._prevValue = NaN;
    this._hasSampleAccurateValues = true;
  }

  dspEventsAndInput(e, inputBus) {
    const outputBus = this._outputBus;
    const output = outputBus.getMutableData()[0];
    const input = inputBus.getChannelData()[0];
    const inNumSamples = e.inNumSamples;

    this.dspValuesForTimeRange(e, output);

    for (let i = 0; i < inNumSamples; i++) {
      output[i] += input[i];
    }

    this._prevValue = NaN;
    this._hasSampleAccurateValues = true;
  }

  dspValuesForTimeRange(e, output) {
    const timeline = this._timeline;
    const currentTime = e.currentTime;
    const nextCurrentTime = e.nextCurrentTime;
    const inNumSamples = e.inNumSamples;
    const sampleRate = e.sampleRate;

    let value = this._value;
    let writeIndex = 0;

    if (this._currentEventIndex === -1) {
      const firstEventTime = timeline[0].time;

      if (nextCurrentTime <= firstEventTime) {
        for (let i = 0; i < inNumSamples; i++) {
          output[i] = value;
        }
        this._hasSampleAccurateValues = false;
        return;
      }

      const fillToTime = Math.min(firstEventTime, nextCurrentTime);
      const fillToFrame = Math.round((fillToTime - currentTime) * sampleRate);

      while (writeIndex < fillToFrame) {
        output[writeIndex++] = value;
      }
    }

    this._hasSampleAccurateValues = true;

    let fillToFrame = this._fillToFrame;
    let schedParams = this._schedParams;

    if (fillToFrame === Infinity && this._currentEventIndex + 1 !== timeline.length) {
      const nextEvent = timeline[this._currentEventIndex + 1];

      if (nextEvent.type === LINEAR_RAMP_TO_VALUE_AT_TIME || nextEvent.type === EXPONENTIAL_RAMP_TO_VALUE_AT_TIME) {
        fillToFrame = 0;
        this._currentEventIndex -= 1;
      } else {
        fillToFrame = Math.round((nextEvent.time - currentTime) * sampleRate);
      }
    }

    while (writeIndex < inNumSamples) {
      while (fillToFrame === 0) {
        this._currentEventIndex += 1;

        const currentEvent = timeline[this._currentEventIndex];
        const currentEventType = currentEvent.type;
        const nextEvent = timeline[this._currentEventIndex + 1] || null;
        const nextEventType = nextEvent && nextEvent.type;
        const time1 = currentEvent.time;
        const time2 = nextEvent ? nextEvent.time : Infinity;

        let numSampleFrames = (time2 - time1) * sampleRate;

        if (time2 <= currentTime) {
          continue;
        }

        if (nextEventType === LINEAR_RAMP_TO_VALUE_AT_TIME) {
          const value1 = Math.fround(currentEvent.args[0]);
          const value2 = Math.fround(nextEvent.args[0]);
          const grow = (value2 - value1) / numSampleFrames;

          if (time1 < currentTime) {
            const a = (currentTime - time1) / (time2 - time1);

            value = value1 + a * (value2 - value1);
            numSampleFrames -= (currentTime - time1) * sampleRate;
          } else {
            value = value1;
          }

          /* istanbul ignore else */
          if (grow) {
            schedParams = { type: LINEAR_RAMP_TO_VALUE_AT_TIME, grow };
          } else {
            schedParams = { type: SET_VALUE_AT_TIME };
          }
        } else if (nextEventType === EXPONENTIAL_RAMP_TO_VALUE_AT_TIME) {
          const value1 = Math.fround(currentEvent.args[0]);
          const value2 = Math.fround(nextEvent.args[0]);
          const grow = Math.pow(value2 / value1, 1 / numSampleFrames);

          if (time1 < currentTime) {
            const a = (currentTime - time1) / (time2 - time1);

            value = value1 * Math.pow(value2 / value1, a);
            numSampleFrames -= (currentTime - time1) * sampleRate;
          } else {
            value = value1;
          }

          /* istanbul ignore else */
          if (grow) {
            schedParams = { type: EXPONENTIAL_RAMP_TO_VALUE_AT_TIME, grow };
          } else {
            schedParams = { type: SET_VALUE_AT_TIME };
          }
        } else if (currentEventType === SET_TARGET_AT_TIME) {
          const target = Math.fround(currentEvent.args[0]);
          const timeConstant = currentEvent.args[2];
          const discreteTimeConstant = 1 - Math.exp(-1 / (sampleRate * timeConstant));

          // if (time1 < currentTime) {
          //   value = target + (value - target) * Math.exp((time1 - currentTime) / timeConstant);
          //   numSampleFrames -= (currentTime - time1) * sampleRate;
          // }

          /* istanbul ignore else */
          if (discreteTimeConstant !== 1) {
            schedParams = { type: SET_TARGET_AT_TIME, target, discreteTimeConstant };
          } else {
            value = target;
            schedParams = { type: SET_VALUE_AT_TIME };
          }
        } else if (currentEventType === SET_VALUE_CURVE_AT_TIME) {
          const curve = currentEvent.args[0];
          const duration = currentEvent.args[2];
          const durationFrames = Math.fround(duration * sampleRate);

          let frameIndex = 0;

          if (time1 < currentTime) {
            const passToFrame = (currentTime - time1) * sampleRate;

            frameIndex = Math.round(passToFrame);
            numSampleFrames -= passToFrame;
          }

          /* istanbul ignore else */
          if (curve.length) {
            schedParams = { type: SET_VALUE_CURVE_AT_TIME, curve, frameIndex, durationFrames };
          } else {
            schedParams = { type: SET_VALUE_AT_TIME };
          }
        } else {
          if (time1 <= currentTime) {
            const passToFrame = (currentTime - time1) * sampleRate;

            numSampleFrames -= passToFrame;
          }
          value = Math.fround(currentEvent.args[0]);
          schedParams = { type: SET_VALUE_AT_TIME };
        }

        fillToFrame = Math.max(0, Math.round(numSampleFrames));
      }

      while (writeIndex < inNumSamples && fillToFrame !== 0) {
        switch (schedParams.type) {
          case SET_VALUE_AT_TIME:
            output[writeIndex++] = value;
            break;
          case LINEAR_RAMP_TO_VALUE_AT_TIME:
            output[writeIndex++] = value;
            value += schedParams.grow;
            break;
          case EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
            output[writeIndex++] = value;
            value *= schedParams.grow;
            break;
          case SET_TARGET_AT_TIME:
            output[writeIndex++] = value;
            value += (schedParams.target - value) * schedParams.discreteTimeConstant;
            if (output[writeIndex - 1] === schedParams.target) {
              schedParams.type = SET_VALUE_AT_TIME;
              value = schedParams.target;
            }
            break;
          case SET_VALUE_CURVE_AT_TIME:
            {
              const curve = schedParams.curve;
              const x = schedParams.frameIndex++ / schedParams.durationFrames;
              const ix = x * (curve.length - 1);
              const i0 = ix|0;
              const i1 = i0 + 1;

              if (curve.length <= i1) {
                value = curve[curve.length - 1];
                schedParams.type = SET_VALUE_AT_TIME;
              } else {
                value = curve[i0] + (ix % 1) * (curve[i1] - curve[i0]);
              }

              output[writeIndex++] = value;
            }
            break;
        }
        fillToFrame -= 1;
      }
    }

    this._value = value;
    this._fillToFrame = fillToFrame;
    this._schedParams = schedParams;
  }
}

AudioParam.SET_VALUE_AT_TIME = SET_VALUE_AT_TIME;
AudioParam.LINEAR_RAMP_TO_VALUE_AT_TIME = LINEAR_RAMP_TO_VALUE_AT_TIME;
AudioParam.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME = EXPONENTIAL_RAMP_TO_VALUE_AT_TIME;
AudioParam.SET_TARGET_AT_TIME = SET_TARGET_AT_TIME;
AudioParam.SET_VALUE_CURVE_AT_TIME = SET_VALUE_CURVE_AT_TIME;
AudioParam.CONTROL = CONTROL;
AudioParam.AUDIO = AUDIO;

module.exports = AudioParam;
