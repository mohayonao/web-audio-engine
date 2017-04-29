"use strict";

const util = require("../../util");
const AudioBuffer = require("../AudioBuffer");

const ScriptProcessorNodeDSP = {
  dspInit() {
    this._eventItem = null;
    this._inputChannelData = null;
    this._outputChannelData = null;
    this._writeIndex = 0;
  },

  dspSetEventItem(eventItem) {
    const numberOfInputChannels = this.inputs[0].getNumberOfChannels();
    const numberOfOutputChannels = this.outputs[0].getNumberOfChannels();
    const inputBuffer = new AudioBuffer({
      numberOfChannels: numberOfInputChannels, length: this._bufferSize, sampleRate: this.sampleRate
    });
    const outputBuffer = new AudioBuffer({
      numberOfChannels: numberOfOutputChannels, length: this._bufferSize, sampleRate: this.sampleRate
    });

    eventItem.inputBuffer._impl = inputBuffer;
    eventItem.outputBuffer._impl = outputBuffer

    this._inputChannelData = inputBuffer.audioData.channelData;
    this._outputChannelData = outputBuffer.audioData.channelData;

    this._eventItem = eventItem;
  },

  dspProcess() {
    const blockSize = this.blockSize;
    const quantumStartFrame = this.context.currentSampleFrame;
    const quantumEndFrame = quantumStartFrame + blockSize;
    const inputs = this.inputs[0].bus.getChannelData();
    const outputs = this.outputs[0].bus.getMutableData();
    const inputChannelData = this._inputChannelData;
    const outputChannelData = this._outputChannelData;
    const numberOfInputChannels = inputs.length;
    const numberOfOutputChannels = outputs.length;
    const copyFrom = this._writeIndex;
    const copyTo = copyFrom + blockSize;

    for (let ch = 0; ch < numberOfInputChannels; ch++) {
      inputChannelData[ch].set(inputs[ch], copyFrom);
    }
    for (let ch = 0; ch < numberOfOutputChannels; ch++) {
      outputs[ch].set(outputChannelData[ch].subarray(copyFrom, copyTo));
    }

    this._writeIndex += blockSize;

    if (this._writeIndex === this._bufferSize) {
      const playbackTime = quantumEndFrame / this.sampleRate;

      this.context.addPostProcess(() => {
        for (let ch = 0; ch < numberOfOutputChannels; ch++) {
          util.fill(outputChannelData[ch], 0);
        }
        this._eventItem.playbackTime = playbackTime;
        this.dispatchEvent(this._eventItem);
      });
      this._writeIndex = 0;
    }
  }
};

module.exports = ScriptProcessorNodeDSP;
