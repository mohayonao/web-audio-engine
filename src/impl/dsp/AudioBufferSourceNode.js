"use strict";

const AudioBufferSourceNodeDSP = {
  dspInit() {
    this._phase = 0;
  },

  dspStart() {
    const bufferSampleRate = this._audioData.sampleRate;
    const bufferDuration = this._audioData.length / bufferSampleRate;

    this._phase = Math.max(0, Math.min(this._offset, bufferDuration)) * bufferSampleRate;
  },

  dspProcess(currentSample) {
    const blockSize = this.blockSize;
    const nextSample = currentSample + blockSize;
    const sampleOffset = Math.max(0, this._startSample - currentSample);
    const endSample = Math.min(nextSample, this._stopSample);
    const fillToSample = endSample - currentSample;
    const outputs = this.outputs[0].bus.getMutableData();

    let writeIndex = 0;

    writeIndex = this.dspBufferRendering(outputs, sampleOffset, fillToSample, this.sampleRate);

    if (this._stopSample <= currentSample + writeIndex) {
      const numberOfChannels = outputs.length;

      while (writeIndex < blockSize) {
        for (let ch = 0; ch < numberOfChannels; ch++) {
          outputs[ch][writeIndex] = 0;
        }
        writeIndex += 1;
      }

      this.context.addPostProcess(() => {
        this.outputs[0].bus.zeros();
        this.outputs[0].disable();
        this.dispatchEvent({ type: "ended" });
      });
    }
  },

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
};

module.exports = AudioBufferSourceNodeDSP;
