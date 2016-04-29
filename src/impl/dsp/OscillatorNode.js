"use strict";

const OscillatorNodeDSP = {
  dspInit() {
    this._phase = 0;
  },

  dspProcess() {
    const currentSample = this.context.currentSampleFrame;
    const blockSize = this.blockSize;
    const nextSample = currentSample + blockSize;
    const sampleOffset = Math.max(0, this._startSample - currentSample);
    const endSample = Math.min(nextSample, this._stopSample);
    const fillToSample = endSample - currentSample;
    const output = this.outputs[0].bus.getMutableData()[0];

    let writeIndex = 0;

    if (this._type === "sine") {
      writeIndex = this.dspSine(output, sampleOffset, fillToSample, this.sampleRate);
    } else {
      writeIndex = this.dspWave(output, sampleOffset, fillToSample, this.sampleRate);
    }

    if (this._stopSample <= currentSample + writeIndex) {
      while (writeIndex < blockSize) {
        output[writeIndex++] = 0;
      }

      this.context.addPostProcess(() => {
        this.outputs[0].bus.zeros();
        this.outputs[0].disable();
        this.dispatchEvent({ type: "ended" });
      });
    }
  },

  dspSine(output, writeIndex, blockSize, sampleRate) {
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

      while (writeIndex < blockSize) {
        output[writeIndex++] = Math.sin(phase);
        phase += phaseIncr;
      }
    } else {
      const frequencyValues = frequency.getSampleAccurateValues();
      const detuneValues = detune.getSampleAccurateValues();

      while (writeIndex < blockSize) {
        const frequencyValue = frequencyValues[writeIndex];
        const detuneValue = detuneValues[writeIndex];
        const computedFrequency = frequencyValue * Math.pow(2, detuneValue / 1200);

        output[writeIndex++] = Math.sin(phase);
        phase += frequencyToPhaseIncr * computedFrequency;
      }
    }

    this._phase = phase;

    return writeIndex;
  },

  dspWave(output, writeIndex, blockSize, sampleRate) {
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

      while (writeIndex < blockSize) {
        const idx = (phase * waveTableLength) % waveTableLength;
        const v0 = waveTable[(idx|0)];
        const v1 = waveTable[(idx|0) + 1];

        output[writeIndex++] = v0 + (idx % 1) * (v1 - v0);
        phase += phaseIncr;
      }
    } else {
      const frequencyValues = frequency.getSampleAccurateValues();
      const detuneValues = detune.getSampleAccurateValues();

      while (writeIndex < blockSize) {
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
};

module.exports = OscillatorNodeDSP;
