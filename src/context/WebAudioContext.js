"use strict";

const util = require("../util");
const config = require("../config");
const BaseAudioContext = require("../api/BaseAudioContext");

const DSPAlgorithm = [];

class WebAudioContext extends BaseAudioContext {
  /**
   * @param {object}  opts
   * @param {AudioContext} opts.context
   * @param {AudioNode}    opts.destination
   * @param {number}       opts.blockSize
   * @param {number}       opts.numberOfChannels
   * @param {number}       opts.bufferSize
   */
  constructor(opts = {}) {
    let destination = opts.destination || opts.context.destination;
    let context = destination.context;
    let sampleRate = context.sampleRate;
    let blockSize = util.defaults(opts.blockSize, config.blockSize);
    let numberOfChannels = util.defaults(opts.numberOfChannels, config.numberOfChannels);
    let bufferSize = util.defaults(opts.bufferSize, 1024);

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
  const channelData = new Array(numberOfChannels);

  return (e) => {
    const outputBuffer = e.outputBuffer;

    for (let ch = 0; ch < numberOfChannels; ch++) {
      channelData[ch] = outputBuffer.getChannelData(ch);
    }

    for (let i = 0; i < iterations; i++) {
      impl.process(channelData, i * blockSize);
    }
  };
};

DSPAlgorithm[1] = (impl, numberOfChannels, bufferSize) => {
  const blockSize = impl.blockSize;
  const iterations = bufferSize / blockSize;

  return (e) => {
    const channelData = [ e.outputBuffer.getChannelData(0) ];

    for (let i = 0; i < iterations; i++) {
      impl.process(channelData, i * blockSize);
    }
  };
};

DSPAlgorithm[2] = (impl, numberOfChannels, bufferSize) => {
  const blockSize = impl.blockSize;
  const iterations = bufferSize / blockSize;

  return (e) => {
    const outputBuffer = e.outputBuffer;
    const channelData = [ outputBuffer.getChannelData(0), outputBuffer.getChannelData(1) ]

    for (let i = 0; i < iterations; i++) {
      impl.process(channelData, i * blockSize);
    }
  };
};

module.exports = WebAudioContext;
