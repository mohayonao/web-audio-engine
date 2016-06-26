"use strict";

const blackman = require("scijs-window-functions/blackman");

const AnalyserNodeDSP = {
  dspInit(fftSize) {
    this._timeDomainBuffer = [];
    this.dspUpdateSizes(fftSize);
  },
  dspUpdateSizes(fftSize) {
    this._previousSmooth = new Float32Array(fftSize / 2);
    this._blackmanTable = (new Float32Array(fftSize)).map((v, i) => {
      return blackman(i, fftSize);
    });
  },
  dspProcess() {
    // just pass data through
    this.outputs[0].bus.copyFrom(this.inputs[0].bus);
    // merge and store data in our buffer
    const channels = this.inputs[0].bus.getChannelData();
    if (channels.length) {
      const len = channels[0].length;
      for (let i = 0; i < len; i++) {
        let data = 0;
        channels.forEach((channel) => {
          data += channel[i];
        });
        this._timeDomainBuffer.push(data / channels.length);
      }
      while (this._timeDomainBuffer.length > this._fftSize) {
        this._timeDomainBuffer.shift();
      }
    }
  }
};

module.exports = AnalyserNodeDSP;
