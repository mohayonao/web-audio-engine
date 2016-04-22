"use strict";

const assert = require("assert");
const audioParamUtil = require("../../util/audioParamUtil");

const SET_VALUE_AT_TIME = 1;
const LINEAR_RAMP_TO_VALUE_AT_TIME = 2;
const EXPONENTIAL_RAMP_TO_VALUE_AT_TIME = 3;
const SET_TARGET_AT_TIME = 4;
const SET_VALUE_CURVE_AT_TIME = 5;
const CONTROL = 1;
const AUDIO = 2;

const AudioParamDSP = {
  dspInit() {
    this._prevValue = NaN;
    this._hasSampleAccurateValues = false;
    this._currentEventIndex = -1;
    this._expectedCurrentSample = -1;
    this._remainSamples = 0;
    this._schedParams = {};
  },

  dspProcess(currentSample) {
    const input = this.inputs[0];
    const inputBus = input.bus;

    input.pull(currentSample);

    const hasEvents = !!this._timeline.length;
    const hasInput = !inputBus.isSilent;
    const algorithm = hasEvents * 2 + hasInput;

    switch (algorithm) {
    case 0:
      // events: x / input: x
      return this.dspStaticValue(currentSample);
    case 1:
      // events: x / input: o
      return this.dspInputAndOffset(currentSample, inputBus);
    case 2:
      // events: o / input: x
      return this.dspEvents(currentSample);
    case 3:
      // events: o / input: o
      return this.dspEventsAndInput(currentSample, inputBus);
    default:
      /* istanbul ignore next */
      assert(!"NOT REACHED");
    }
  },

  dspStaticValue() {
    const value = this._value;

    if (value !== this._prevValue) {
      if (value === 0) {
        this.outputBus.zeros();
      } else {
        this.outputBus.getMutableData()[0].fill(value);
      }
      this._prevValue = value;
    }

    this._hasSampleAccurateValues = false;
  },

  dspInputAndOffset(currentSample, inputBus) {
    const blockSize = this.blockSize;
    const outputBus = this.outputBus;
    const output = outputBus.getMutableData()[0];
    const input = inputBus.getChannelData()[0];
    const value = this._value;

    output.set(input);

    if (value !== 0) {
      for (let i = 0; i < blockSize; i++) {
        output[i] += value;
      }
    }

    this._prevValue = NaN;
    this._hasSampleAccurateValues = true;
  },

  dspEvents(currentSample) {
    const outputBus = this.outputBus;
    const output = outputBus.getMutableData()[0];

    this.dspValuesForTimeRange(currentSample, output);

    this._prevValue = NaN;
    this._hasSampleAccurateValues = true;
  },

  dspEventsAndInput(currentSample, inputBus) {
    const blockSize = this.blockSize;
    const outputBus = this.outputBus;
    const output = outputBus.getMutableData()[0];
    const input = inputBus.getChannelData()[0];

    this.dspValuesForTimeRange(currentSample, output);

    for (let i = 0; i < blockSize; i++) {
      output[i] += input[i];
    }

    this._prevValue = NaN;
    this._hasSampleAccurateValues = true;
  },

  dspValuesForTimeRange(currentSample, output) {
    const blockSize = this.blockSize;
    const sampleRate = this.sampleRate;
    const timeline = this._timeline;
    const nextSample = currentSample + blockSize;

    let value = this._value;
    let writeIndex = 0;

    // processing until the first event
    if (this._currentEventIndex === -1) {
      const firstEventSample = timeline[0].startSample;

      // timeline
      // |----------------|----------------|-------*--------|----------------|
      // ^                ^                        ^
      // currentSample    nextSample               firstEventSample
      // <---------------> fill 'value'
      if (nextSample <= firstEventSample) {
        for (let i = 0; i < blockSize; i++) {
          output[i] = value;
        }
        this._hasSampleAccurateValues = false;
        return;
      }

      // timeline
      // |----------------|----------------|-------*--------|----------------|
      //                                   ^       ^        ^
      //                                   |       |        nextSample
      //                                   |       firstEventSample
      //                                   currentSample
      //                                   <------> fill 'value'
      for (let i = 0, imax = firstEventSample - currentSample; i < imax; i++) {
        output[writeIndex++] = value;
      }
      this._currentEventIndex = 0;
    }

    this._hasSampleAccurateValues = true;

    let remainSamples = this._expectedCurrentSample === currentSample ? this._remainSamples : 0;
    let schedParams = this._schedParams;

    if (remainSamples === Infinity && this._currentEventIndex + 1 !== timeline.length) {
      remainSamples = timeline[this._currentEventIndex + 1].startSample - currentSample;
    }

    while (writeIndex < blockSize && this._currentEventIndex < timeline.length) {
      const eventItem = timeline[this._currentEventIndex];
      const startSample = eventItem.startSample;
      const endSample = eventItem.endSample;

      // timeline
      // |-------*--------|-------*--------|----------------|----------------|
      //         ^                ^        ^                ^
      //         |<-------------->|        currentSample    nextSample
      //         startSample      endSample
      // skip event if
      // (endSample < currentSample): past event
      //  or
      // (startSample === endSample): setValueAtTime before linearRampToValueAtTime or exponentialRampToValueAtTime.
      if (endSample < currentSample || startSample === endSample) {
        remainSamples = 0;
        this._currentEventIndex += 1;
        continue;
      }

      if (remainSamples <= 0) {
        const processedSamples = Math.max(0, currentSample - startSample);

        switch (eventItem.type) {
        case SET_VALUE_AT_TIME:
          {
            value = eventItem.startValue;
            schedParams = { type: SET_VALUE_AT_TIME };
          }
        break;
        case LINEAR_RAMP_TO_VALUE_AT_TIME:
          {
            const valueRange = eventItem.endValue - eventItem.startValue;
            const frameRange = eventItem.endSample - eventItem.startSample;
            const grow = valueRange / frameRange;

            if (grow) {
              value = eventItem.startValue + processedSamples * grow;
              schedParams = { type: LINEAR_RAMP_TO_VALUE_AT_TIME, grow };
            } else {
              value = eventItem.startValue;
              schedParams = { type: SET_VALUE_AT_TIME };
            }
          }
          break;
        case EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
          {
            const valueRatio = eventItem.endValue / eventItem.startValue;
            const frameRange = eventItem.endSample - eventItem.startSample;
            const grow = Math.pow(valueRatio, 1 / frameRange);

            if (grow) {
              value = eventItem.startValue * Math.pow(grow, processedSamples);
              schedParams = { type: EXPONENTIAL_RAMP_TO_VALUE_AT_TIME, grow };
            } else {
              value = eventItem.startValue;
              schedParams = { type: SET_VALUE_AT_TIME };
            }
          }
          break;
        case SET_TARGET_AT_TIME:
          {
            const target = Math.fround(eventItem.args[0]);
            const timeConstant = eventItem.args[2];
            const discreteTimeConstant = 1 - Math.exp(-1 / (sampleRate * timeConstant));
            const time = (currentSample + writeIndex) / sampleRate;

            value = audioParamUtil.computeValueAtTime(timeline, time, this._userValue);

            if (discreteTimeConstant !== 1) {
              schedParams = { type: SET_TARGET_AT_TIME, target, discreteTimeConstant };
            } else {
              schedParams = { type: SET_VALUE_AT_TIME };
            }
          }
          break;
        case SET_VALUE_CURVE_AT_TIME:
          {
            const curve = eventItem.args[0];

            schedParams = { type: SET_VALUE_CURVE_AT_TIME, curve, startSample, endSample };
          }
          break;
        }

        remainSamples = endSample - startSample - processedSamples;
      } // if (remainSamples === 0)

      const fillFrames = Math.min(blockSize - writeIndex, remainSamples);

      switch (schedParams.type) {
      case SET_VALUE_AT_TIME:
        {
          for (let i = 0; i < fillFrames; i++) {
            output[writeIndex++] = value;
          }
        }
        break;
      case LINEAR_RAMP_TO_VALUE_AT_TIME:
        {
          for (let i = 0; i < fillFrames; i++) {
            output[writeIndex++] = value;
            value += schedParams.grow;
          }
        }
        break;
      case EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
        {
          for (let i = 0; i < fillFrames; i++) {
            output[writeIndex++] = value;
            value *= schedParams.grow;
          }
        }
        break;
      case SET_TARGET_AT_TIME:
        {
          for (let i = 0; i < fillFrames; i++) {
            output[writeIndex++] = value;
            value += (schedParams.target - value) * schedParams.discreteTimeConstant;
          }
        }
        break;
      case SET_VALUE_CURVE_AT_TIME:
        {
          const curve = schedParams.curve;
          const schedRange = schedParams.endSample - schedParams.startSample;
          const schedStartFrame = schedParams.startSample;

          for (let i = 0; i < fillFrames; i++) {
            const xx = (currentSample + writeIndex - schedStartFrame) / schedRange;
            const ix = xx * (curve.length - 1);
            const i0 = ix | 0;
            const i1 = i0 + 1;

            value = curve[i0] + (ix % 1) * (curve[i1] - curve[i0]);
            output[writeIndex++] = value;
          }

          if (remainSamples === fillFrames) {
            value = curve[curve.length - 1];
          }
        }
        break;
      }

      remainSamples -= fillFrames;

      if (remainSamples === 0) {
        this._currentEventIndex += 1;
      }
    } // while (writeIndex < blockSize)

    while (writeIndex < blockSize) {
      output[writeIndex++] = value;
    }

    this._value = value;
    this._schedParams = schedParams;
    this._remainSamples = remainSamples;
    this._expectedCurrentSample = nextSample;
  }
};

AudioParamDSP.SET_VALUE_AT_TIME = SET_VALUE_AT_TIME;
AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME = LINEAR_RAMP_TO_VALUE_AT_TIME;
AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME = EXPONENTIAL_RAMP_TO_VALUE_AT_TIME;
AudioParamDSP.SET_TARGET_AT_TIME = SET_TARGET_AT_TIME;
AudioParamDSP.SET_VALUE_CURVE_AT_TIME = SET_VALUE_CURVE_AT_TIME;
AudioParamDSP.CONTROL = CONTROL;
AudioParamDSP.AUDIO = AUDIO;

module.exports = AudioParamDSP;
