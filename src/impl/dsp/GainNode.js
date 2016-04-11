"use strict";

const AudioNode = require("../AudioNode");
const DSPAlgorithm = {};

class GainNode extends AudioNode {
  dspProcess(e) {
    const inputBus = this.getInput(0).getAudioBus();
    const outputBus = this.getOutput(0).getAudioBus();

    if (inputBus.isSilent()) {
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

      dsp(inputs, outputs, gainValues, e.inNumSamples);

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

    dsp(inputs, outputs, gainValue, e.inNumSamples);
  }
}

function selectAlgorithm(numberOfChannels, base) {
  const algorithmIndex = numberOfChannels + base;

  if (DSPAlgorithm[algorithmIndex]) {
    return DSPAlgorithm[algorithmIndex];
  }

  return DSPAlgorithm[base];
}

DSPAlgorithm[1000] = (inputs, outputs, gainValues, inNumSamples) => {
  const numberOfChannels = inputs.length;

  for (let ch = 0; ch < numberOfChannels; ch++) {
    for (let i = 0; i < inNumSamples; i++) {
      outputs[ch][i] = inputs[ch][i] * gainValues[i];
    }
  }
};

DSPAlgorithm[1001] = (inputs, outputs, gainValues, inNumSamples) => {
  const input = inputs[0];
  const output = outputs[0];

  for (let i = 0; i < inNumSamples; i++) {
    output[i] = input[i] * gainValues[i];
  }
};

DSPAlgorithm[1002] = (inputs, outputs, gainValues, inNumSamples) => {
  const inputL = inputs[0];
  const inputR = inputs[1];
  const outputL = outputs[0];
  const outputR = outputs[1];

  for (let i = 0; i < inNumSamples; i++) {
    outputL[i] = inputL[i] * gainValues[i];
    outputR[i] = inputR[i] * gainValues[i];
  }
};

DSPAlgorithm[2000] = (inputs, outputs, gainValue, inNumSamples) => {
  const numberOfChannels = inputs.length;

  for (let ch = 0; ch < numberOfChannels; ch++) {
    for (let i = 0; i < inNumSamples; i++) {
      outputs[ch][i] = inputs[ch][i] * gainValue;
    }
  }
};

DSPAlgorithm[2001] = (inputs, outputs, gainValue, inNumSamples) => {
  const input = inputs[0];
  const output = outputs[0];

  for (let i = 0; i < inNumSamples; i++) {
    output[i] = input[i] * gainValue;
  }
};

DSPAlgorithm[2002] = (inputs, outputs, gainValue, inNumSamples) => {
  const inputL = inputs[0];
  const inputR = inputs[1];
  const outputL = outputs[0];
  const outputR = outputs[1];

  for (let i = 0; i < inNumSamples; i++) {
    outputL[i] = inputL[i] * gainValue;
    outputR[i] = inputR[i] * gainValue;
  }
};

module.exports = GainNode;
