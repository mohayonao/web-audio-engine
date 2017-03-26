"use strict";

const AudioBufferSourceNodeDSP = {
  dspInit() {
    this._phase = 0;
  },

  dspStart() {
    if (this._audioData) {
      const bufferSampleRate = this._audioData.sampleRate;
      const bufferDuration = this._audioData.length / bufferSampleRate;

      this._phase = Math.max(0, Math.min(this._offset, bufferDuration)) * bufferSampleRate;
    }
  },

  dspProcess() {
    if (this._audioData === null) {
      return this.dspEmitEnded();
    }

    const blockSize = this.blockSize;
    const quantumStartFrame = this.context.currentSampleFrame;
    const quantumEndFrame = quantumStartFrame + blockSize;
    const sampleOffset = Math.max(0, this._startFrame - quantumStartFrame);
    const fillToSample = Math.min(quantumEndFrame, this._stopFrame) - quantumStartFrame;
    const outputs = this.outputs[0].bus.getMutableData();

    let writeIndex = 0;

    writeIndex = this.dspBufferRendering(outputs, sampleOffset, fillToSample, this.sampleRate);

    // timeline
    // |----------------|-------*--------|----------------|----------------|
    //                  ^       ^        ^
    //                  |------>|        quantumEndFrame
    //                  | wrote |
    //                  |       stopFrame
    //                  quantumStartFrame
    if (this._stopFrame <= quantumStartFrame + writeIndex) {
      // rest samples fill zero
      const numberOfChannels = outputs.length;

      while (writeIndex < blockSize) {
        for (let ch = 0; ch < numberOfChannels; ch++) {
          outputs[ch][writeIndex] = 0;
        }
        writeIndex += 1;
      }

      this.dspEmitEnded();
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

      if (this._loop) {
        if (0 <= this._loopStart && this._loopStart < this._loopEnd) {
          const loopEndSamples = this._loopEnd * bufferSampleRate;

          if (loopEndSamples <= phase) {
            phase = this._loopStart * bufferSampleRate;
          }
        } else {
          if (bufferLength <= phase) {
            phase = 0;
          }
        }
      } else {
        if (bufferLength <= phase) {
          this.dspEmitEnded();
          break;
        }
      }
    }

    this._phase = phase;

    return writeIndex;
  },

  dspEmitEnded() {
    this._done = true;
    this.context.addPostProcess(() => {
      this.outputs[0].bus.zeros();
      this.outputs[0].disable();
      this.dispatchEvent({ type: "ended" });
    });
  }
};

module.exports = AudioBufferSourceNodeDSP;
