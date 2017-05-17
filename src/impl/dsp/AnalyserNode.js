"use strict";

const fft = require("fourier-transform");
const blackman = require("scijs-window-functions/blackman");
const AudioBus = require("../core/AudioBus");
const { toDecibel, normalize } = require("../../utils");

const MAX_FFT_SIZE = 32768;

const AnalyserNodeDSP = {
  dspInit(sampleRate) {
    this._timeDomainBuffer = [];
    this._analyserBus = new AudioBus(1, MAX_FFT_SIZE, sampleRate);
    this._analyserBusOffset = 0;
    this._audioData = this._analyserBus.audioData.channelData[0];
  },
  dspUpdateSizes(fftSize) {
    const previousSmooth = new Float32Array(fftSize / 2);
    const blackmanTable = new Float32Array(fftSize);

    for (let i = 0; i < fftSize; i++) {
      blackmanTable[i] = blackman(i, fftSize);
    }

    this._previousSmooth = previousSmooth;
    this._blackmanTable = blackmanTable;
  },
  dspGetFloatFrequencyData(array) {
      const fftSize = this._fftSize;
      const blackmanTable = this._blackmanTable;
      const previousSmooth = this._previousSmooth;
      const waveform = new Float32Array(fftSize);
      const length = Math.min(array.length, fftSize / 2);
      const s = this._smoothingTimeConstant;

      // 1. down-mix
      this.dspGetFloatTimeDomainData(waveform);

      // 2. Apply Blackman window
      for (let i = 0; i < fftSize; i++) {
        waveform[i] = (waveform[i] * blackmanTable[i]) || 0;
      }

      // 3. FFT
      const spectrum = fft(waveform);

      // re-size to frequencyBinCount, then do more processing
      for (let i = 0; i < length; i++) {
        const v0 = spectrum[i];
        // 4. Smooth over data
        previousSmooth[i] = (s * previousSmooth[i]) + ((1 - s) * v0);
        // 5. Convert to dB
        const v1 = toDecibel(previousSmooth[i]);
        // store in array
        array[i] = Number.isFinite(v1) ? v1 : 0;
      }
  },
  dspGetByteFrequencyData(array) {
    const length = Math.min(array.length, this._fftSize / 2);
    const dBMin = this._minDecibels;
    const dBMax = this._maxDecibels;
    const spectrum = new Float32Array(length);

    this.dspGetFloatFrequencyData(spectrum);

    for (let i = 0; i < length; i++) {
      array[i] = Math.round(normalize(spectrum[i], dBMin, dBMax) * 255);
    }
  },
  dspGetByteTimeDomainData(array) {
    const length = Math.min(array.length, this._fftSize);
    const waveform = new Float32Array(length);

    this.dspGetFloatTimeDomainData(waveform);

    for (let i = 0; i < length; i++) {
      array[i] = Math.round(normalize(waveform[i], -1, 1) * 255);
    }
  },
  dspGetFloatTimeDomainData(array) {
    const audioData = this._audioData;
    const fftSize = this._fftSize;
    const i0 = (this._analyserBusOffset - fftSize + MAX_FFT_SIZE) % MAX_FFT_SIZE;
    const i1 = Math.min(i0 + fftSize, MAX_FFT_SIZE);
    const copied = i1 - i0;

    array.set(audioData.subarray(i0, i1));

    if (copied !== fftSize) {
      const remain = fftSize - copied;
      const subarray2 = audioData.subarray(0, remain);

      array.set(subarray2, copied);
    }
  },
  dspProcess() {
    const inputBus = this.inputs[0].bus;
    const outputBus = this.outputs[0].bus;
    const analyserBus = this._analyserBus;
    const blockSize = inputBus.audioData.length;

    // just pass data through
    outputBus.copyFrom(inputBus);

    // merge and store data in our buffer
    analyserBus.copyFromWithOffset(inputBus, this._analyserBusOffset);

    this._analyserBusOffset += blockSize;
    if (MAX_FFT_SIZE <= this._analyserBusOffset) {
      this._analyserBusOffset = 0;
    }
  }
};

module.exports = AnalyserNodeDSP;
