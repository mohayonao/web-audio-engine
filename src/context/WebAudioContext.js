"use strict";

const util = require("../util");
const AudioContext = require("../api/AudioContext");
const DSPAlgorithm = [];

class WebAudioContext extends AudioContext {
  /**
   * @param {object}  opts
   * @param {AudioContext} opts.context
   * @param {AudioNode}    opts.destination
   * @param {number}       opts.blockSize
   * @param {number}       opts.numberOfChannels
   * @param {number}       opts.bufferSize
   */
  constructor(opts) {
    opts = opts || /* istanbul ignore next */ {};

    let destination = opts.destination || opts.context.destination;
    let context = destination.context;
    let sampleRate = context.sampleRate;
    let blockSize = util.defaults(opts.blockSize, 128);
    let numberOfChannels = util.defaults(opts.numberOfChannels, 2);
    let bufferSize = util.defaults(bufferSize, 1024);

    blockSize = util.toValidBlockSize(blockSize);
    numberOfChannels = util.toValidNumberOfChannels(numberOfChannels);
    bufferSize = util.toPowerOfTwo(bufferSize);
    bufferSize = Math.max(256, Math.min(bufferSize, 16384));

    super({ sampleRate, blockSize, numberOfChannels });

    const processor = context.createScriptProcessor(bufferSize, 0, numberOfChannels);
    const dspProcess = DSPAlgorithm[numberOfChannels] || DSPAlgorithm[0];

    processor.onaudioprocess = dspProcess(this._impl, numberOfChannels, bufferSize);

    util.defineProp(this, "_originalContext", context);
    util.defineProp(this, "_destination", destination);
    util.defineProp(this, "_processor", processor);
  }

  get originalContext() {
    return this._originalContext;
  }

  /**
   * @return {Promise<void>}
   */
  resume() {
    if (this._processor) {
      this._processor.connect(this._destination);
    }
    return super.resume();
  }

  /**
   * @return {Promise<void>}
   */
  suspend() {
    if (this._processor) {
      this._processor.disconnect();
    }
    return super.suspend();
  }

  /**
   * @return {Promise<void>}
   */
  close() {
    if (this._processor) {
      this._processor.disconnect();
      this._processor = null;
    }
    return super.close();
  }
}

DSPAlgorithm[0] = (impl, numberOfChannels, bufferSize) => {
  const blockSize = impl.blockSize;
  const iterations = bufferSize / blockSize;

  return (e) => {
    const channelData = new Array(numberOfChannels);

    for (let i = 0; i < iterations; i++) {
      const audioData = impl.process();

      for (let ch = 0; ch < numberOfChannels; ch++) {
        const output = channelData[ch] || (channelData[ch] = e.outputBuffer.getChannelData(ch));

        output.set(audioData.channelData[ch], i * blockSize);
      }
    }
  };
};

DSPAlgorithm[1] = (impl, numberOfChannels, bufferSize) => {
  const blockSize = impl.blockSize;
  const iterations = bufferSize / blockSize;

  return (e) => {
    const output = e.outputBuffer.getChannelData(0);

    for (let i = 0; i < iterations; i++) {
      const audioData = impl.process();

      output.set(audioData.channelData[0], i * blockSize);
    }
  };
};

DSPAlgorithm[2] = (impl, numberOfChannels, bufferSize) => {
  const blockSize = impl.blockSize;
  const iterations = bufferSize / blockSize;

  return (e) => {
    const outputL = e.outputBuffer.getChannelData(0);
    const outputR = e.outputBuffer.getChannelData(1);

    for (let i = 0; i < iterations; i++) {
      const audioData = impl.process();

      outputL.set(audioData.channelData[0], i * blockSize);
      outputR.set(audioData.channelData[1], i * blockSize);
    }
  };
};

module.exports = WebAudioContext;
