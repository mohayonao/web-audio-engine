"use strict";

const assert = require("power-assert");
const AudioData = require("./AudioData");
const DSPAlgorithm = {};

class AudioBus {
  constructor(numberOfChannels, length, sampleRate) {
    this._audioData = new AudioData(numberOfChannels, length, sampleRate);
    this._channelInterpretation = "discrete";
    this._isSilent = true;
  }

  getAudioData() {
    return this._audioData;
  }

  getChannelInterpretation() {
    return this._channelInterpretation;
  }

  setChannelInterpretation(value) {
    if (value !== this._channelInterpretation && isValidChannelInterpretation(value)) {
      this._channelInterpretation = value;
    }
  }

  isSilent() {
    return this._isSilent;
  }

  getNumberOfChannels() {
    return this._audioData.numberOfChannels;
  }

  setNumberOfChannels(numberOfChannels) {
    const audioBus = new AudioBus(numberOfChannels, this.getLength(), this.getSampleRate());

    audioBus._channelInterpretation = this._channelInterpretation;
    audioBus.sumFrom(this);

    this._audioData = audioBus._audioData;
  }

  getLength() {
    return this._audioData.length;
  }

  getSampleRate() {
    return this._audioData.sampleRate;
  }

  getChannelData() {
    return this._audioData.channelData;
  }

  getMutableData() {
    this._isSilent = false;
    return this._audioData.channelData;
  }

  zeros() {
    /* istanbul ignore else */
    if (!this._isSilent) {
      const channelData = this._audioData.channelData;

      for (let i = 0, imax = channelData.length; i < imax; i++) {
        channelData[i].fill(0);
      }
    }
    this._isSilent = true;
  }

  copyFrom(audioBus) {
    const source = audioBus._audioData.channelData;
    const destination = this._audioData.channelData;
    const numberOfChannels = destination.length;

    assert(audioBus instanceof AudioBus);
    assert(audioBus._audioData.numberOfChannels === this._audioData.numberOfChannels);
    assert(audioBus._audioData.length === this._audioData.length);

    for (let ch = 0; ch < numberOfChannels; ch++) {
      destination[ch].set(source[ch]);
    }

    this._isSilent = audioBus._isSilent;
  }

  copyFromWithOffset(audioBus, offset) {
    const source = audioBus._audioData.channelData;
    const destination = this._audioData.channelData;
    const numberOfChannels = destination.length;

    assert(audioBus instanceof AudioBus);
    assert(audioBus._audioData.numberOfChannels === this._audioData.numberOfChannels);

    offset = offset|0;

    for (let ch = 0; ch < numberOfChannels; ch++) {
      destination[ch].set(source[ch], offset);
    }

    this._isSilent = this._isSilent && audioBus._isSilent;
  }

  sumFrom(audioBus) {
    assert(audioBus instanceof AudioBus);

    /* istanbul ignore next */
    if (audioBus._isSilent) {
      return;
    }

    const source = audioBus._audioData.channelData;
    const destination = this._audioData.channelData;

    this._sumFrom(source, destination, audioBus.getLength());
  }

  sumFromWithOffset(audioBus, offset) {
    assert(audioBus instanceof AudioBus);

    /* istanbul ignore next */
    if (audioBus._isSilent) {
      return;
    }

    offset = offset|0;

    const source = audioBus._audioData.channelData;
    const destination = this._audioData.channelData.map(data => data.subarray(offset))

    this._sumFrom(source, destination, audioBus.getLength());
  }

  _sumFrom(source, destination, length) {
    let mixFunction;
    let algoIndex = source.length * 1000 + destination.length;

    if (this._channelInterpretation === "discrete") {
      algoIndex += 2000000;
    } else {
      algoIndex += 1000000;
    }

    mixFunction = DSPAlgorithm[algoIndex] || DSPAlgorithm[0];

    if (this._isSilent && mixFunction.set) {
      mixFunction = mixFunction.set;
    }

    mixFunction(source, destination, length);

    this._isSilent = false;
  }
}

DSPAlgorithm[0] = (source, destination, length) => {
  const numberOfChannels = Math.min(source.length, destination.length);

  for (let ch = 0; ch < numberOfChannels; ch++) {
    for (let i = 0; i < length; i++) {
      destination[ch][i] += source[ch][i];
    }
  }
};
DSPAlgorithm[0].set = (source, destination) => {
  const numberOfChannels = Math.min(source.length, destination.length);

  for (let ch = 0; ch < numberOfChannels; ch++) {
    destination[ch].set(source[ch]);
  }
};

DSPAlgorithm[1001001] = (source, destination, length) => {
  const output = destination[0];
  const input = source[0];

  for (let i = 0; i < length; i++) {
    output[i] += input[i];
  }
};
DSPAlgorithm[1001001].set = (source, destination) => {
  destination[0].set(source[0]);
};
DSPAlgorithm[2001001] = DSPAlgorithm[1001001];
DSPAlgorithm[2001001].set = DSPAlgorithm[1001001].set;

DSPAlgorithm[1001002] = (source, destination, length) => {
  const outputL = destination[0];
  const outputR = destination[1];
  const input = source[0];

  for (let i = 0; i < length; i++) {
    outputL[i] += input[i];
    outputR[i] += input[i];
  }
};
DSPAlgorithm[1001002].set = (source, destination) => {
  destination[0].set(source[0]);
  destination[1].set(source[0]);
};

DSPAlgorithm[1001004] = DSPAlgorithm[1001002];
DSPAlgorithm[1001004].set = DSPAlgorithm[1001002].set;

DSPAlgorithm[1001006] = (source, destination, length) => {
  const outputC = destination[2];
  const input = source[0];

  for (let i = 0; i < length; i++) {
    outputC[i] += input[i];
  }
};
DSPAlgorithm[1001006].set = (source, destination) => {
  destination[2].set(source[0]);
};

DSPAlgorithm[1002002] = (source, destination, length) => {
  const outputL = destination[0];
  const outputR = destination[1];
  const inputL = source[0];
  const inputR = source[1];

  for (let i = 0; i < length; i++) {
    outputL[i] += inputL[i];
    outputR[i] += inputR[i];
  }
};
DSPAlgorithm[1002002].set = (source, destination) => {
  destination[0].set(source[0]);
  destination[1].set(source[1]);
};
DSPAlgorithm[2002002] = DSPAlgorithm[1002002];
DSPAlgorithm[2002002].set = DSPAlgorithm[1002002].set;

DSPAlgorithm[1002004] = DSPAlgorithm[1002002];
DSPAlgorithm[1002004].set = DSPAlgorithm[1002002].set;

DSPAlgorithm[1002006] = DSPAlgorithm[1002004];
DSPAlgorithm[1002006].set = DSPAlgorithm[1002004].set;

DSPAlgorithm[1004006] = (source, destination, length) => {
  const outputL = destination[0];
  const outputR = destination[1];
  const outputSL = destination[4];
  const outputSR = destination[5];
  const inputL = source[0];
  const inputR = source[1];
  const inputSL = source[2];
  const inputSR = source[3];

  for (let i = 0; i < length; i++) {
    outputL[i] += inputL[i];
    outputR[i] += inputR[i];
    outputSL[i] += inputSL[i];
    outputSR[i] += inputSR[i];
  }
};
DSPAlgorithm[1004006].set = (source, destination) => {
  destination[0].set(source[0]);
  destination[1].set(source[1]);
  destination[4].set(source[2]);
  destination[5].set(source[3]);
};

DSPAlgorithm[1002001] = (source, destination, length) => {
  const output = destination[0];
  const inputL = source[0];
  const inputR = source[1];

  for (let i = 0; i < length; i++) {
    output[i] += 0.5 * (inputL[i] + inputR[i]);
  }
};

DSPAlgorithm[1004001] = (source, destination, length) => {
  const output = destination[0];
  const inputL = source[0];
  const inputR = source[1];
  const inputSL = source[2];
  const inputSR = source[3];

  for (let i = 0; i < length; i++) {
    output[i] += 0.25 * (inputL[i] + inputR[i] + inputSL[i] + inputSR[i]);
  }
};

DSPAlgorithm[1006001] = (source, destination, length) => {
  const output = destination[0];
  const inputL = source[0];
  const inputR = source[1];
  const inputC = source[2];
  const inputSL = source[4];
  const inputSR = source[5];

  for (let i = 0; i < length; i++) {
    output[i] += 0.7071 * (inputL[i] + inputR[i]) + inputC[i] + 0.5 * (inputSL[i] + inputSR[i]);
  }
};

DSPAlgorithm[1004002] = (source, destination, length) => {
  const outputL = destination[0];
  const outputR = destination[1];
  const inputL = source[0];
  const inputR = source[1];
  const inputSL = source[2];
  const inputSR = source[3];

  for (let i = 0; i < length; i++) {
    outputL[i] += 0.5 * (inputL[i] + inputSL[i]);
    outputR[i] += 0.5 * (inputR[i] + inputSR[i]);
  }
};

DSPAlgorithm[1006002] = (source, destination, length) => {
  const outputL = destination[0];
  const outputR = destination[1];
  const inputL = source[0];
  const inputR = source[1];
  const inputC = source[2];
  const inputSL = source[4];
  const inputSR = source[5];

  for (let i = 0; i < length; i++) {
    outputL[i] += inputL[i] + 0.7071 * (inputC[i] + inputSL[i]);
    outputR[i] += inputR[i] + 0.7071 * (inputC[i] + inputSR[i]);
  }
};

DSPAlgorithm[1006004] = (source, destination, length) => {
  const outputL = destination[0];
  const outputR = destination[1];
  const outputSL = destination[2];
  const outputSR = destination[3];
  const inputL = source[0];
  const inputR = source[1];
  const inputC = source[2];
  const inputSL = source[4];
  const inputSR = source[5];

  for (let i = 0; i < length; i++) {
    outputL[i] += inputL[i] + 0.7071 * inputC[i];
    outputR[i] += inputR[i] + 0.7071 * inputC[i];
    outputSL[i] += inputSL[i];
    outputSR[i] += inputSR[i];
  }
};

function isValidChannelInterpretation(value) {
  return value === "speakers" || value === "discrete";
}

module.exports = AudioBus;
