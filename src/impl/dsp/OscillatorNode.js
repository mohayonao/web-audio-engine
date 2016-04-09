"use strict";

class OscillatorNode {
  dspInit() {
    this._phase = 0;
  }

  dspProcess(e) {
    const currentTime = e.currentTime;
    const nextCurrentTime = e.nextCurrentTime;

    if (nextCurrentTime < this._startTime) {
      return;
    }

    if (this._stopTime <= currentTime) {
      return;
    }

    const sampleRate = e.sampleRate;
    const inNumSamples = e.inNumSamples;
    const frameOffset = Math.max(0, Math.round((this._startTime - currentTime) * sampleRate));
    const fillToTime = Math.min(nextCurrentTime, this._stopTime);
    const fillToFrame = Math.round((fillToTime - currentTime) * sampleRate)|0;
    const output = this.getOutput(0).getAudioBus().getMutableData()[0];

    let writeIndex = 0;

    if (this._type === "sine") {
      writeIndex = this.dspSine(output, frameOffset, fillToFrame, sampleRate);
    } else {
      writeIndex = this.dspWave(output, writeIndex, fillToFrame, sampleRate);
    }

    if (writeIndex < inNumSamples) {
      while (writeIndex < inNumSamples) {
        output[writeIndex++] = 0;
      }
      this.context.addPostProcess(() => {
        this.getOutput(0).getAudioBus().zeros();
        this.getOutput(0).disable();
        this.dispatchEvent({ type: "ended" });
      });
    }
  }

  dspSine(output, writeIndex, inNumSamples, sampleRate) {
    const frequency = this._frequency;
    const detune = this._detune;
    const algorithm = frequency.hasSampleAccurateValues() * 2 + detune.hasSampleAccurateValues();
    const frequencyToPhaseIncr = 2 * Math.PI / sampleRate;

    let phase = this._phase;

    if (algorithm === 0) {
      const frequencyValue = frequency.getValue();
      const detuneValue = detune.getValue();
      const computedFrequency = frequencyValue * Math.pow(2, detuneValue / 1200);
      const phaseIncr = frequencyToPhaseIncr * computedFrequency;

      while (writeIndex < inNumSamples) {
        output[writeIndex++] = Math.sin(phase);
        phase += phaseIncr;
      }
    } else {
      const frequencyValues = frequency.getSampleAccurateValues();
      const detuneValues = detune.getSampleAccurateValues();

      while (writeIndex < inNumSamples) {
        const frequencyValue = frequencyValues[writeIndex];
        const detuneValue = detuneValues[writeIndex];
        const computedFrequency = frequencyValue * Math.pow(2, detuneValue / 1200);

        output[writeIndex++] = Math.sin(phase);
        phase += frequencyToPhaseIncr * computedFrequency;
      }
    }

    this._phase = phase;

    return writeIndex;
  }

  dspWave(output, writeIndex, inNumSamples, sampleRate) {
    const frequency = this._frequency;
    const detune = this._detune;
    const algorithm = frequency.hasSampleAccurateValues() * 2 + detune.hasSampleAccurateValues();
    const waveTable = this._waveTable;
    const waveTableLength = waveTable.length - 1;
    const frequencyToPhaseIncr = 1 / sampleRate;

    let phase = this._phase;

    if (algorithm === 0) {
      const frequencyValue = frequency.getValue();
      const detuneValue = detune.getValue();
      const computedFrequency = frequencyValue * Math.pow(2, detuneValue / 1200);
      const phaseIncr = frequencyToPhaseIncr * computedFrequency;

      while (writeIndex < inNumSamples) {
        const idx = (phase * waveTableLength) % waveTableLength;
        const v0 = waveTable[(idx|0)];
        const v1 = waveTable[(idx|0) + 1];

        output[writeIndex++] = v0 + (idx % 1) * (v1 - v0);
        phase += phaseIncr;
      }
    } else {
      const frequencyValues = frequency.getSampleAccurateValues();
      const detuneValues = detune.getSampleAccurateValues();

      while (writeIndex < inNumSamples) {
        const frequencyValue = frequencyValues[writeIndex];
        const detuneValue = detuneValues[writeIndex];
        const computedFrequency = frequencyValue * Math.pow(2, detuneValue / 1200);
        const idx = (phase * waveTableLength) % waveTableLength;
        const v0 = waveTable[(idx|0)];
        const v1 = waveTable[(idx|0) + 1];

        output[writeIndex++] = v0 + (idx % 1) * (v1 - v0);
        phase += frequencyToPhaseIncr * computedFrequency;
      }
    }

    this._phase = phase;

    return writeIndex;
  }
}

module.exports = OscillatorNode;
