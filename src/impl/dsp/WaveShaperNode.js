"use strict";

const AudioNode = require("../AudioNode");

class WaveShaperNode extends AudioNode {
  dspProcess(e) {
    const inputBus = this.getInput(0).getAudioBus();
    const outputBus = this.getOutput(0).getAudioBus();

    if (this._curve === null) {
      outputBus.copyFrom(inputBus);
      return;
    }

    const inputs = inputBus.getChannelData();
    const outputs = outputBus.getMutableData();
    const numberOfChannels = outputs.length;
    const inNumSamples = e.inNumSamples;
    const curve = this._curve;

    for (let ch = 0; ch < numberOfChannels; ch++) {
      for (let i = 0; i < inNumSamples; i++) {
        outputs[ch][i] = this.dspApplyCurve(inputs[ch][i], curve);
      }
    }
  }

  dspApplyCurve(x, curve) {
    x = Math.max(-1, Math.min(x, 1));
    x = (x + 1) * 0.5;

    const ix = x * (curve.length - 1);
    const i0 = ix|0;
    const i1 = i0 + 1;

    if (curve.length <= i1) {
      return curve[curve.length - 1];
    }

    const y0 = curve[i0];
    const y1 = curve[i1];
    const a = ix % 1;

    return y0 + a * (y1 - y0);
  }
}

module.exports = WaveShaperNode;
