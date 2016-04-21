"use strict";

const AudioNode = require("../AudioNode");
const AudioBuffer = require("../AudioBuffer");

class ScriptProcessorNode extends AudioNode {
  dspInit() {
    this._eventItem = null;
    this._inputChannelData = null;
    this._outputChannelData = null;
    this._writeIndex = 0;
  }

  dspSetEventItem(eventItem) {
    const numberOfInputChannels = this.inputs[0].getNumberOfChannels();
    const numberOfOutputChannels = this.outputs[0].getNumberOfChannels();
    const inputBuffer = new AudioBuffer(this.context, {
      numberOfChannels: numberOfInputChannels, length: this._bufferSize, sampleRate: this.sampleRate
    });
    const outputBuffer = new AudioBuffer(this.context, {
      numberOfChannels: numberOfOutputChannels, length: this._bufferSize, sampleRate: this.sampleRate
    });

    eventItem.inputBuffer._impl = inputBuffer;
    eventItem.outputBuffer._impl = outputBuffer

    this._inputChannelData = inputBuffer.audioData.channelData;
    this._outputChannelData = outputBuffer.audioData.channelData;

    this._eventItem = eventItem;
  }

  dspProcess(currentSample) {
    const inputs = this.inputs[0].bus.getChannelData();
    const outputs = this.outputs[0].bus.getMutableData();
    const inputChannelData = this._inputChannelData;
    const outputChannelData = this._outputChannelData;
    const numberOfInputChannels = inputs.length;
    const numberOfOutputChannels = outputs.length;
    const blockSize = this.blockSize;
    const writeIndex = this._writeIndex;

    for (let i = 0; i < blockSize; i++) {
      for (let ch = 0; ch < numberOfInputChannels; ch++) {
        inputChannelData[ch][i + writeIndex] = inputs[ch][i];
      }
      for (let ch = 0; ch < numberOfOutputChannels; ch++) {
        outputs[ch][i] = outputChannelData[ch][i + writeIndex];
      }
    }

    this._writeIndex += blockSize;

    if (this._writeIndex === this._bufferSize) {
      const playbackTime = (currentSample + blockSize) / this.sampleRate;

      this.context.addPostProcess(() => {
        for (let ch = 0; ch < numberOfOutputChannels; ch++) {
          outputChannelData[ch].fill(0);
        }
        this._eventItem.playbackTime = playbackTime;
        this.dispatchEvent(this._eventItem);
      });
      this._writeIndex = 0;
    }
  }
}

module.exports = ScriptProcessorNode;
