"use strict";

const DSPAlgorithm = {};

const GainNodeDSP = {
  dspProcess() {
    const inputBus = this.inputs[0].bus;
    const outputBus = this.outputs[0].bus;

    if (inputBus.isSilent) {
      outputBus.zeros();
      return;
    }

    const gainParam = this._gain;

    if (gainParam.hasSampleAccurateValues()) {
      const inputs = inputBus.getChannelData();
      const outputs = outputBus.getMutableData();
      const gainValues = gainParam.getSampleAccurateValues();
      const numberOfChannels = inputs.length;
      const dsp = selectAlgorithm(numberOfChannels, 1000);

      dsp(inputs, outputs, gainValues, this.blockSize);

      return;
    }

    const gainValue = gainParam.getValue();

    if (gainValue === 0) {
      outputBus.zeros();
      return;
    }

    if (gainValue === 1) {
      outputBus.copyFrom(inputBus);
      return;
    }

    const inputs = inputBus.getChannelData();
    const outputs = outputBus.getMutableData();
    const numberOfChannels = outputs.length;
    const dsp = selectAlgorithm(numberOfChannels, 2000);

    dsp(inputs, outputs, gainValue, this.blockSize);
  }
};

function selectAlgorithm(numberOfChannels, base) {
  const algorithmIndex = numberOfChannels + base;

  if (DSPAlgorithm[algorithmIndex]) {
    return DSPAlgorithm[algorithmIndex];
  }

  return DSPAlgorithm[base];
}

DSPAlgorithm[1000] = (inputs, outputs, gainValues, blockSize) => {
  const numberOfChannels = inputs.length;

  for (let ch = 0; ch < numberOfChannels; ch++) {
    for (let i = 0; i < blockSize; i++) {
      outputs[ch][i] = inputs[ch][i] * gainValues[i];
    }
  }
};

DSPAlgorithm[1001] = (inputs, outputs, gainValues, blockSize) => {
  const input = inputs[0];
  const output = outputs[0];

  for (let i = 0; i < blockSize; i++) {
    output[i] = input[i] * gainValues[i];
  }
};

DSPAlgorithm[1002] = (inputs, outputs, gainValues, blockSize) => {
  const inputL = inputs[0];
  const inputR = inputs[1];
  const outputL = outputs[0];
  const outputR = outputs[1];

  for (let i = 0; i < blockSize; i++) {
    outputL[i] = inputL[i] * gainValues[i];
    outputR[i] = inputR[i] * gainValues[i];
  }
};

DSPAlgorithm[2000] = (inputs, outputs, gainValue, blockSize) => {
  const numberOfChannels = inputs.length;

  for (let ch = 0; ch < numberOfChannels; ch++) {
    for (let i = 0; i < blockSize; i++) {
      outputs[ch][i] = inputs[ch][i] * gainValue;
    }
  }
};

DSPAlgorithm[2001] = (inputs, outputs, gainValue, blockSize) => {
  const input = inputs[0];
  const output = outputs[0];

  for (let i = 0; i < blockSize; i++) {
    output[i] = input[i] * gainValue;
  }
};

DSPAlgorithm[2002] = (inputs, outputs, gainValue, blockSize) => {
  const inputL = inputs[0];
  const inputR = inputs[1];
  const outputL = outputs[0];
  const outputR = outputs[1];

  for (let i = 0; i < blockSize; i++) {
    outputL[i] = inputL[i] * gainValue;
    outputR[i] = inputR[i] * gainValue;
  }
};

module.exports = GainNodeDSP;
