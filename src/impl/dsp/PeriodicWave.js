"use strict";

const WAVE_TABLE_LENGTH = 8192;

const PeriodicWaveDSP = {
  dspInit() {
    this._waveTable = null;
  },

  dspBuildWaveTable() {
    if (this._waveTable !== null) {
      return this._waveTable;
    }

    const waveTable = new Float32Array(WAVE_TABLE_LENGTH + 1);
    const real = this._real;
    const imag = this._imag;

    let maxAbsValue = 0;
    let periodicWaveLength = Math.min(real.length, 16);

    for (let i = 0; i < WAVE_TABLE_LENGTH; i++) {
      const x = (i / WAVE_TABLE_LENGTH) * Math.PI * 2;

      for (let n = 1; n < periodicWaveLength; n++) {
        waveTable[i] += real[n] * Math.cos(n * x) + imag[n] * Math.sin(n * x);
      }

      maxAbsValue = Math.max(maxAbsValue, Math.abs(waveTable[i]));
    }

    if (!this._constants && maxAbsValue !== 1) {
      for (let i = 0; i < WAVE_TABLE_LENGTH; i++) {
        waveTable[i] *= maxAbsValue;
      }
    }
    waveTable[WAVE_TABLE_LENGTH] = waveTable[0];

    this._waveTable = waveTable;

    return waveTable;
  }
};

module.exports = PeriodicWaveDSP;
