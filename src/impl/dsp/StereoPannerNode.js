"use strict";

const BasePannerNode = require("../BasePannerNode");

class StereoPannerNode extends BasePannerNode {
  dspProcess(e) {
    const inputBus = this.getInput(0).getAudioBus();
    const outputBus = this.getOutput(0).getAudioBus();

    if (inputBus.isSilent()) {
      outputBus.zeros();
      return;
    }

    const panParam = this._pan;

    if (panParam.hasSampleAccurateValues()) {
      this.dspSampleAccurateValues(inputBus, outputBus, panParam.getSampleAccurateValues(), e.inNumSamples);
    } else {
      this.dspStaticValue(inputBus, outputBus, panParam.getValue(), e.inNumSamples);
    }
  }

  dspSampleAccurateValues(inputBus, outputBus, panValues, inNumSamples) {
    const outputs = outputBus.getMutableData();
    const numberOfChannels = inputBus.getNumberOfChannels();

    if (numberOfChannels === 1) {
      const input = inputBus.getChannelData()[0];

      for (let i = 0; i < inNumSamples; i++) {
        const panValue = Math.max(-1, Math.min(panValues[i], +1));
        const panRadian = (panValue * 0.5 + 0.5) * 0.5 * Math.PI
        const gainL = Math.cos(panRadian);
        const gainR = Math.sin(panRadian);

        outputs[0][i] = input[i] * gainL;
        outputs[1][i] = input[i] * gainR;
      }
    } else {
      const inputs = inputBus.getChannelData()[0];

      for (let i = 0; i < inNumSamples; i++) {
        const panValue = Math.max(-1, Math.min(panValues[i], +1));
        const panRadian = (panValue <= 0 ? panValue + 1: panValue) * 0.5 * Math.PI
        const gainL = Math.cos(panRadian);
        const gainR = Math.sin(panRadian);

        if (panValue <= 0) {
          outputs[0][i] = inputs[0][i] + inputs[1][i] * gainL;
          outputs[1][i] = inputs[1][i] * gainR;
        } else {
          outputs[0][i] = inputs[0][i] * gainL;
          outputs[1][i] = inputs[1][i] + inputs[0][i] * gainR;
        }
      }
    }
  }

  dspStaticValue(inputBus, outputBus, panValue, inNumSamples) {
    const outputs = outputBus.getMutableData();
    const numberOfChannels = inputBus.getNumberOfChannels();

    panValue = Math.max(-1, Math.min(panValue, +1));

    if (numberOfChannels === 1) {
      const input = inputBus.getChannelData()[0];
      const panRadian = (panValue * 0.5 + 0.5) * 0.5 * Math.PI
      const gainL = Math.cos(panRadian);
      const gainR = Math.sin(panRadian);

      for (let i = 0; i < inNumSamples; i++) {
        outputs[0][i] = input[i] * gainL;
        outputs[1][i] = input[i] * gainR;
      }
    } else {
      const inputs = inputBus.getChannelData()[0];
      const panRadian = (panValue <= 0 ? panValue + 1: panValue) * 0.5 * Math.PI
      const gainL = Math.cos(panRadian);
      const gainR = Math.sin(panRadian);

      if (panValue <= 0) {
        for (let i = 0; i < inNumSamples; i++) {
          outputs[0][i] = inputs[0][i] + inputs[1][i] * gainL;
          outputs[1][i] = inputs[1][i] * gainR;
        }
      } else {
        for (let i = 0; i < inNumSamples; i++) {
          outputs[0][i] = inputs[0][i] * gainL;
          outputs[1][i] = inputs[1][i] + inputs[0][i] * gainR;
        }
      }
    }
  }
}

module.exports = StereoPannerNode;
