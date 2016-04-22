"use strict";

const AudioBus = require("../core/AudioBus");

const DelayNodeDSP = {
  dspInit(maxDelayTime) {
    const frameToDelay = computeFrameToDelay(maxDelayTime, this.sampleRate, this.blockSize);

    this._delayBus = new AudioBus(1, frameToDelay, this.sampleRate);
    this._delayBusLength = frameToDelay;
    this._delayIndex = 0;
    this._delayIndexes = new Float32Array(this.blockSize);
  },

  dspSetNumberOfChannels(numberOfChannels) {
    this._delayBus.setNumberOfChannels(numberOfChannels);
  },

  dspProcess() {
    const delayBus = this._delayBus;
    const inputBus = this.inputs[0].bus;

    delayBus.copyFromWithOffset(inputBus, this._delayIndex);

    const delayTimeValues = this._delayTime.getSampleAccurateValues();

    this.dspUpdateDelayIndexes(delayTimeValues);

    const buffers = delayBus.getChannelData();
    const outputs = this.outputs[0].bus.getMutableData();
    const numberOfChannels = outputs.length;
    const inNumSamples = this.blockSize;
    const delayIndexes = this._delayIndexes;

    for (let ch = 0; ch < numberOfChannels; ch++) {
      this.dspKernelProcess(buffers[ch], outputs[ch], delayIndexes, inNumSamples);
    }

    this._delayIndex += this.blockSize;

    if (this._delayIndex === this._delayBusLength) {
      this._delayIndex = 0;
    }
  },

  dspUpdateDelayIndexes(delayTimeValues) {
    const baseIndex = this._delayIndex;
    const sampleRate = this.sampleRate;
    const delayIndexes = this._delayIndexes;

    for (let i = 0, imax = delayTimeValues.length; i < imax; i++) {
      delayIndexes[i] = (baseIndex + i) - (delayTimeValues[i] * sampleRate);
    }
  },

  dspKernelProcess(delayBuffer, output, delayIndexes, inNumSamples) {
    const length = delayBuffer.length;

    for (let i = 0; i < inNumSamples; i++) {
      const idx = delayIndexes[i];
      const id0 = idx|0;
      const dx = idx % 1;

     if (dx === 0) {
        output[i] = delayBuffer[tt(id0, length)];
      } else {
        const d0 = delayBuffer[tt(id0 + 1, length)];
        const d1 = delayBuffer[tt(id0    , length)];
        const d2 = delayBuffer[tt(id0 - 1, length)];
        const d3 = delayBuffer[tt(id0 - 2, length)];

        output[i] = cubicinterp(dx, d0, d1, d2, d3);
      }
    }
  }
};

function tt(index, length) {
  if (index < 0) {
    return length + (index % length);
  }
  return index % length;
}

function cubicinterp(x, y0, y1, y2, y3) {
  const c0 = y1;
  const c1 = 0.5 * (y2 - y0);
  const c2 = y0 - 2.5 * y1 + 2 * y2 - 0.5 * y3;
  const c3 = 0.5 * (y3 - y0) + 1.5 * (y1 - y2);

  return ((c3 * x + c2) * x + c1) * x + c0;
}

function computeFrameToDelay(delayTime, sampleRate, blockSize) {
  return Math.ceil(delayTime * sampleRate / blockSize) * blockSize + blockSize;
}

module.exports = DelayNodeDSP;
