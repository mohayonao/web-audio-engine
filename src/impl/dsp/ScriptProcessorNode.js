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
    const numberOfInputChannels = this.getInput(0).getNumberOfChannels();
    const numberOfOutputChannels = this.getOutput(0).getNumberOfChannels();
    const inputBuffer = new AudioBuffer(this.context, {
      numberOfChannels: numberOfInputChannels, length: this._bufferSize, sampleRate: this.sampleRate
    });
    const outputBuffer = new AudioBuffer(this.context, {
      numberOfChannels: numberOfOutputChannels, length: this._bufferSize, sampleRate: this.sampleRate
    });

    eventItem.inputBuffer._impl = inputBuffer;
    eventItem.outputBuffer._impl = outputBuffer

    this._inputChannelData = inputBuffer.getAudioData().channelData;
    this._outputChannelData = outputBuffer.getAudioData().channelData;

    this._eventItem = eventItem;
  }

  dspProcess(e) {
    const inputs = this.getInput(0).getAudioBus().getChannelData();
    const outputs = this.getOutput(0).getAudioBus().getMutableData();
    const inputChannelData = this._inputChannelData;
    const outputChannelData = this._outputChannelData;
    const numberOfInputChannels = inputs.length;
    const numberOfOutputChannels = outputs.length;
    const inNumSamples = e.inNumSamples;
    const writeIndex = this._writeIndex;

    for (let i = 0; i < inNumSamples; i++) {
      for (let ch = 0; ch < numberOfInputChannels; ch++) {
        inputChannelData[ch][i + writeIndex] = inputs[ch][i];
      }
      for (let ch = 0; ch < numberOfOutputChannels; ch++) {
        outputs[ch][i] = outputChannelData[ch][i + writeIndex];
      }
    }

    this._writeIndex += inNumSamples;

    if (this._writeIndex === this._bufferSize) {
      this.context.addPostProcess(() => {
        for (let ch = 0; ch < numberOfOutputChannels; ch++) {
          outputChannelData[ch].fill(0);
        }
        this._eventItem.playbackTime = e.nextCurrentTime;
        this.dispatchEvent(this._eventItem);
      });
      this._writeIndex = 0;
    }
  }
}

module.exports = ScriptProcessorNode;
