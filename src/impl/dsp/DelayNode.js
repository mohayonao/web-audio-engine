"use strict";

const assert = require("assert");

const DelayNodeDSP = {
  dspInit(maxDelayTime) {
    this._kernels = [];
    this._delayBufferLength = this.dspComputeDelayBufferLength(maxDelayTime);
    this._delayIndices = new Float32Array(this.blockSize);
  },

  dspComputeDelayBufferLength(delayTime) {
    return Math.ceil(delayTime * this.sampleRate / this.blockSize) * this.blockSize + this.blockSize;
  },

  dspUpdateKernel(numberOfChannels) {
    if (numberOfChannels < this._kernels.length) {
      this._kernels.splice(numberOfChannels);
    } else if (this._kernels.length < numberOfChannels) {
      while (numberOfChannels !== this._kernels.length) {
        this._kernels.push(new DelayKernel(this, this._kernels.length));
      }
    }

    assert(numberOfChannels === this._kernels.length);

    switch (numberOfChannels) {
    case 1:
      this.dspProcess = this.dspProcess1;
      break;
    case 2:
      this.dspProcess = this.dspProcess2;
      break;
    default:
      this.dspProcess = this.dspProcessN;
      break;
    }
  },

  dspProcess1() {
    const blockSize = this.blockSize;
    const inputs = this.inputs[0].bus.getChannelData();
    const outputs = this.outputs[0].bus.getMutableData();
    const delayIndices = this._delayIndices;
    const kernel = this._kernels[0];

    if (this._delayTime.hasSampleAccurateValues()) {
      kernel.computeAccurateDelayIndices(delayIndices, this._delayTime.getSampleAccurateValues());
      kernel.processWithAccurateDelayIndices(inputs[0], outputs[0], delayIndices, blockSize);
    } else {
      kernel.computeStaticDelayIndices(delayIndices, this._delayTime.getValue());
      kernel.processWithStaticDelayIndices(inputs[0], outputs[0], delayIndices, blockSize);
    }
  },

  dspProcess2() {
    const blockSize = this.blockSize;
    const inputs = this.inputs[0].bus.getChannelData();
    const outputs = this.outputs[0].bus.getMutableData();
    const delayIndices = this._delayIndices;
    const kernels = this._kernels;

    if (this._delayTime.hasSampleAccurateValues()) {
      kernels[0].computeAccurateDelayIndices(delayIndices, this._delayTime.getSampleAccurateValues());
      kernels[0].processWithAccurateDelayIndices(inputs[0], outputs[0], delayIndices, blockSize);
      kernels[1].processWithAccurateDelayIndices(inputs[1], outputs[1], delayIndices, blockSize);
    } else {
      kernels[0].computeStaticDelayIndices(delayIndices, this._delayTime.getValue());
      kernels[0].processWithStaticDelayIndices(inputs[0], outputs[0], delayIndices, blockSize);
      kernels[1].processWithStaticDelayIndices(inputs[1], outputs[1], delayIndices, blockSize);
    }
  },

  dspProcessN() {
    const blockSize = this.blockSize;
    const inputs = this.inputs[0].bus.getChannelData();
    const outputs = this.outputs[0].bus.getMutableData();
    const delayIndices = this._delayIndices;
    const kernels = this._kernels;

    if (this._delayTime.hasSampleAccurateValues()) {
      kernels[0].computeAccurateDelayIndices(delayIndices, this._delayTime.getSampleAccurateValues());

      for (let i = 0, imax = kernels.length; i < imax; i++) {
        kernels[i].processWithAccurateDelayIndices(inputs[i], outputs[i], delayIndices, blockSize);
      }
    } else {
      kernels[0].computeStaticDelayIndices(delayIndices, this._delayTime.getValue());

      for (let i = 0, imax = kernels.length; i < imax; i++) {
        kernels[i].processWithStaticDelayIndices(inputs[i], outputs[i], delayIndices, blockSize);
      }
    }
  }
};

class DelayKernel {
  constructor(delayNode) {
    this._sampleRate = delayNode.sampleRate;
    this._maxDelayTime = delayNode._maxDelayTime;
    this._delayBufferLength = delayNode._delayBufferLength;
    this._delayBuffer = new Float32Array(this._delayBufferLength);
    this._virtualDelayIndex = 0;
  }

  computeStaticDelayIndices(delayIndices, delayTime) {
    const sampleRate = this._sampleRate;
    const maxDelayTime = this._maxDelayTime;
    const delayBufferLength = this._delayBufferLength;
    const virtualReadIndex = this._virtualDelayIndex;

    delayTime = Math.max(0, Math.min(delayTime, maxDelayTime));

    let delayIndex = virtualReadIndex - delayTime * sampleRate;

    if (delayIndex < 0) {
      delayIndex += delayBufferLength;
    }

    for (let i = 0, imax = delayIndices.length; i < imax; i++) {
      delayIndices[i] = delayIndex++;
      if (delayBufferLength <= delayIndex) {
        delayIndex -= delayBufferLength;
      }
    }

    return delayIndices;
  }

  computeAccurateDelayIndices(delayIndices, delayTimes) {
    const sampleRate = this._sampleRate;
    const maxDelayTime = this._maxDelayTime;
    const delayBufferLength = this._delayBufferLength;
    const virtualReadIndex = this._virtualDelayIndex;

    for (let i = 0, imax = delayIndices.length; i < imax; i++) {
      const delayTime = Math.max(0, Math.min(delayTimes[i], maxDelayTime));

      let delayIndex = (virtualReadIndex + i) - delayTime * sampleRate;

      if (delayIndex < 0) {
        delayIndex += delayBufferLength;
      }

      delayIndices[i] = delayIndex;
    }

    return delayIndices;
  }

  processWithStaticDelayIndices(input, output, delayIndices, inNumSamples) {
    const delayBufferLength = this._delayBufferLength;
    const delayBuffer = this._delayBuffer;

    this._delayBuffer.set(input, this._virtualDelayIndex);

    const ia = delayIndices[0] % 1;

    if (ia === 0) {
      for (let i = 0; i < inNumSamples; i++) {
        output[i] = delayBuffer[delayIndices[i]];
      }
    } else {
      for (let i = 0; i < inNumSamples; i++) {
        const i0 = delayIndices[i]|0;
        const i1 = (i0 + 1) % delayBufferLength;

        output[i] = delayBuffer[i0] + ia * (delayBuffer[i1] - delayBuffer[i0]);
      }
    }

    this._virtualDelayIndex += inNumSamples;

    if (this._virtualDelayIndex === delayBufferLength) {
      this._virtualDelayIndex = 0;
    }
  }

  processWithAccurateDelayIndices(input, output, delayIndices, inNumSamples) {
    const delayBufferLength = this._delayBufferLength;
    const delayBuffer = this._delayBuffer;

    delayBuffer.set(input, this._virtualDelayIndex);

    for (let i = 0; i < inNumSamples; i++) {
      const ix = delayIndices[i];
      const i0 = ix|0;
      const ia = ix % 1;

      if (ia === 0) {
        output[i] = delayBuffer[i0];
      } else {
        const i1 = (i0 + 1) % delayBufferLength;

        output[i] = delayBuffer[i0] + ia * (delayBuffer[i1] - delayBuffer[i0]);
      }
    }

    this._virtualDelayIndex += inNumSamples;

    if (this._virtualDelayIndex === delayBufferLength) {
      this._virtualDelayIndex = 0;
    }
  }
}

module.exports = DelayNodeDSP;
