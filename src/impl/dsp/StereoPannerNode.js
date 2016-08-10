"use strict";

const StereoPannerNodeDSP = {
  dspProcess() {
    const inputBus = this.inputs[0].bus;
    const outputBus = this.outputs[0].bus;

    if (inputBus.isSilent) {
      outputBus.zeros();
      return;
    }

    const panParam = this._pan;

    if (panParam.hasSampleAccurateValues()) {
      this.dspSampleAccurateValues(inputBus, outputBus, panParam.getSampleAccurateValues(), this.blockSize);
    } else {
      this.dspStaticValue(inputBus, outputBus, panParam.getValue(), this.blockSize);
    }
  },

  dspSampleAccurateValues(inputBus, outputBus, panValues, blockSize) {
    const outputs = outputBus.getMutableData();
    const numberOfChannels = inputBus.getNumberOfChannels();

    if (numberOfChannels === 1) {
      const input = inputBus.getChannelData()[0];

      for (let i = 0; i < blockSize; i++) {
        const panValue = Math.max(-1, Math.min(panValues[i], +1));
        const panRadian = (panValue * 0.5 + 0.5) * 0.5 * Math.PI
        const gainL = Math.cos(panRadian);
        const gainR = Math.sin(panRadian);

        outputs[0][i] = input[i] * gainL;
        outputs[1][i] = input[i] * gainR;
      }
    } else {
      const inputs = inputBus.getChannelData();

      for (let i = 0; i < blockSize; i++) {
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
  },

  dspStaticValue(inputBus, outputBus, panValue, blockSize) {
    const outputs = outputBus.getMutableData();
    const numberOfChannels = inputBus.getNumberOfChannels();

    panValue = Math.max(-1, Math.min(panValue, +1));

    if (numberOfChannels === 1) {
      const input = inputBus.getChannelData()[0];
      const panRadian = (panValue * 0.5 + 0.5) * 0.5 * Math.PI
      const gainL = Math.cos(panRadian);
      const gainR = Math.sin(panRadian);

      for (let i = 0; i < blockSize; i++) {
        outputs[0][i] = input[i] * gainL;
        outputs[1][i] = input[i] * gainR;
      }
    } else {
      const inputs = inputBus.getChannelData();
      const panRadian = (panValue <= 0 ? panValue + 1: panValue) * 0.5 * Math.PI
      const gainL = Math.cos(panRadian);
      const gainR = Math.sin(panRadian);

      if (panValue <= 0) {
        for (let i = 0; i < blockSize; i++) {
          outputs[0][i] = inputs[0][i] + inputs[1][i] * gainL;
          outputs[1][i] = inputs[1][i] * gainR;
        }
      } else {
        for (let i = 0; i < blockSize; i++) {
          outputs[0][i] = inputs[0][i] * gainL;
          outputs[1][i] = inputs[1][i] + inputs[0][i] * gainR;
        }
      }
    }
  }
};

module.exports = StereoPannerNodeDSP;
