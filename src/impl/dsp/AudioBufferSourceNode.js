"use strict";

const AudioSourceNode = require("../AudioSourceNode");

class AudioBufferSourceNode extends AudioSourceNode {
  dspInit() {
    this._phase = 0;
  }

  dspStart() {
    const bufferSampleRate = this._audioData.sampleRate;
    const bufferDuration = this._audioData.length / bufferSampleRate;

    this._phase = Math.max(0, Math.min(this._offset, bufferDuration)) * bufferSampleRate;
  }

  dspProcess(e) {
    const currentTime = e.currentTime;
    const nextCurrentTime = e.nextCurrentTime;

    if (nextCurrentTime < this._startTime) {
      return;
    }

    if (this._implicitStopTime <= currentTime) {
      return;
    }

    const sampleRate = e.sampleRate;
    const inNumSamples = e.inNumSamples;
    const frameOffset = Math.max(0, Math.round((this._startTime - currentTime) * sampleRate));
    const fillToTime = Math.min(nextCurrentTime, this._implicitStopTime);
    const fillToFrame = Math.round((fillToTime - currentTime) * sampleRate)|0;
    const outputs = this.getOutput(0).getAudioBus().getMutableData();
    const numberOfChannels = outputs.length;

    let writeIndex = 0;

    writeIndex = this.dspBufferRendering(outputs, frameOffset, fillToFrame, sampleRate);

    if (writeIndex < inNumSamples) {
      while (writeIndex < inNumSamples) {
        for (let ch = 0; ch < numberOfChannels; ch++) {
          outputs[ch][writeIndex] = 0;
        }
        writeIndex += 1;
      }
      this.context.addPostProcess(() => {
        this.getOutput(0).getAudioBus().zeros();
        this.getOutput(0).disable();
        this.dispatchEvent({ type: "ended" });
      });
    }
  }

  dspBufferRendering(outputs, writeIndex, inNumSamples, sampleRate) {
    const playbackRateValues = this._playbackRate.getSampleAccurateValues();
    const detuneValues = this._detune.getSampleAccurateValues();
    const numberOfChannels = this._audioData.numberOfChannels;
    const bufferLength = this._audioData.length;
    const bufferSampleRate = this._audioData.sampleRate;
    const bufferChannelData = this._audioData.channelData;
    const playbackRateToPhaseIncr = bufferSampleRate / sampleRate;

    let phase = this._phase;

    while (writeIndex < inNumSamples) {
      const playbackRateValue = playbackRateValues[writeIndex];
      const detuneValue = detuneValues[writeIndex];
      const computedPlaybackRate = playbackRateValue * Math.pow(2, detuneValue / 1200);

      for (let ch = 0; ch < numberOfChannels; ch++) {
        const v0 = bufferChannelData[ch][(phase|0)] || 0;
        const v1 = bufferChannelData[ch][(phase|0) + 1] || 0;

        outputs[ch][writeIndex] = v0 + (phase % 1) * (v1 - v0);
      }
      writeIndex += 1;

      phase += playbackRateToPhaseIncr * Math.max(0, computedPlaybackRate);

      const phaseTime = phase / bufferSampleRate;
      const bufferDuration = bufferLength / bufferSampleRate;

      if (this._loop) {
        if (bufferDuration <= phaseTime || (0 < this._loopEnd && this._loopEnd <= phaseTime)) {
          phase = Math.max(0, Math.min(this._loopStart, bufferDuration)) * bufferSampleRate;
        }
      } else {
        if (bufferDuration <= phaseTime) {
          break;
        }
      }
    }

    this._phase = phase;

    return writeIndex;
  }
}

module.exports = AudioBufferSourceNode;
