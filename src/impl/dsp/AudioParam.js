"use strict";

const assert = require("assert");
const util = require("../../util");
const audioParamUtil = require("../../util/audioParamUtil");
const { SET_VALUE_AT_TIME } = require("../../constants/AudioParamEvent");
const { LINEAR_RAMP_TO_VALUE_AT_TIME } = require("../../constants/AudioParamEvent");
const { EXPONENTIAL_RAMP_TO_VALUE_AT_TIME } = require("../../constants/AudioParamEvent");
const { SET_TARGET_AT_TIME } = require("../../constants/AudioParamEvent");
const { SET_VALUE_CURVE_AT_TIME } = require("../../constants/AudioParamEvent");

const AudioParamDSP = {
  dspInit() {
    this._prevValue = NaN;
    this._hasSampleAccurateValues = false;
    this._currentEventIndex = -1;
    this._quantumStartFrame = -1;
    this._remainSamples = 0;
    this._schedParams = {};
  },

  dspProcess() {
    const input = this.inputs[0];
    const inputBus = input.bus;

    input.pull();

    const hasEvents = !!this._timeline.length;
    const hasInput = !inputBus.isSilent;
    const algorithm = hasEvents * 2 + hasInput;

    switch (algorithm) {
    case 0:
      // events: x / input: x
      return this.dspStaticValue();
    case 1:
      // events: x / input: o
      return this.dspInputAndOffset(inputBus);
    case 2:
      // events: o / input: x
      return this.dspEvents();
    case 3:
      // events: o / input: o
      return this.dspEventsAndInput(inputBus);
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
        util.fill(this.outputBus.getMutableData()[0], value);
      }
      this._prevValue = value;
    }

    this._hasSampleAccurateValues = false;
  },

  dspInputAndOffset(inputBus) {
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

  dspEvents() {
    const outputBus = this.outputBus;
    const output = outputBus.getMutableData()[0];

    this.dspValuesForTimeRange(output);

    this._prevValue = NaN;
    this._hasSampleAccurateValues = true;
  },

  dspEventsAndInput(inputBus) {
    const blockSize = this.blockSize;
    const outputBus = this.outputBus;
    const output = outputBus.getMutableData()[0];
    const input = inputBus.getChannelData()[0];

    this.dspValuesForTimeRange(output);

    for (let i = 0; i < blockSize; i++) {
      output[i] += input[i];
    }

    this._prevValue = NaN;
    this._hasSampleAccurateValues = true;
  },

  dspValuesForTimeRange(output) {
    const blockSize = this.blockSize;
    const quantumStartFrame = this.context.currentSampleFrame;
    const quantumEndFrame = quantumStartFrame + blockSize;
    const sampleRate = this.sampleRate;
    const timeline = this._timeline;

    let value = this._value;
    let writeIndex = 0;

    // processing until the first event
    if (this._currentEventIndex === -1) {
      const firstEventStartFrame = timeline[0].startFrame;

      // timeline
      // |----------------|----------------|-------*--------|----------------|
      // ^                ^                        ^
      // |                quantumEndFrame          firstEventStartFrame
      // quantumStartFrame
      // <---------------> fill value with in range
      if (quantumEndFrame <= firstEventStartFrame) {
        for (let i = 0; i < blockSize; i++) {
          output[i] = value;
        }
        this._hasSampleAccurateValues = false;
        return;
      }

      // timeline
      // |----------------|----------------|-------*--------|----------------|
      //                                   ^       ^        ^
      //                                   |       |        quantumEndFrame
      //                                   |       firstEventStartFrame
      //                                   quantumStartFrame
      //                                   <------> fill value with in range
      for (let i = 0, imax = firstEventStartFrame - quantumStartFrame; i < imax; i++) {
        output[writeIndex++] = value;
      }
      this._currentEventIndex = 0;
    }

    this._hasSampleAccurateValues = true;

    let remainSamples = this._quantumStartFrame === quantumStartFrame ? this._remainSamples : 0;
    let schedParams = this._schedParams;

    // if new event exists, should recalculate remainSamples
    if (remainSamples === Infinity && this._currentEventIndex + 1 !== timeline.length) {
      remainSamples = timeline[this._currentEventIndex + 1].startFrame - quantumStartFrame;
    }

    while (writeIndex < blockSize && this._currentEventIndex < timeline.length) {
      const eventItem = timeline[this._currentEventIndex];
      const startFrame = eventItem.startFrame;
      const endFrame = eventItem.endFrame;

      // timeline
      // |-------*--------|-------*--------|----------------|----------------|
      //         ^                ^        ^                ^
      //         |<-------------->|        |                quantumEndFrame
      //         |                |        quantumStartFrame
      //         startFrame       endFrame
      // skip event if
      // (endFrame < quantumStartFrame): past event
      //  or
      // (startFrame === endFrame): setValueAtTime before linearRampToValueAtTime or exponentialRampToValueAtTime.
      if (endFrame < quantumStartFrame || startFrame === endFrame) {
        remainSamples = 0;
        this._currentEventIndex += 1;
        continue;
      }

      if (remainSamples <= 0) {
        const processedSamples = Math.max(0, quantumStartFrame - startFrame);

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
            const frameRange = eventItem.endFrame - eventItem.startFrame;
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
            const frameRange = eventItem.endFrame - eventItem.startFrame;
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
            const time = (quantumStartFrame + writeIndex) / sampleRate;

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

            schedParams = { type: SET_VALUE_CURVE_AT_TIME, curve, startFrame, endFrame };
          }
          break;
        }

        remainSamples = endFrame - startFrame - processedSamples;
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
          const schedRange = schedParams.endFrame - schedParams.startFrame;
          const schedStartFrame = schedParams.startFrame;

          for (let i = 0; i < fillFrames; i++) {
            const xx = (quantumStartFrame + writeIndex - schedStartFrame) / schedRange;
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
    this._quantumStartFrame = quantumEndFrame;
  }
};

module.exports = AudioParamDSP;
