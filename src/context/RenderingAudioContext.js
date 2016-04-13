"use strict";

const util = require("../util");
const AudioContext = require("../api/AudioContext");
const encoder = require("../encoder");

class RenderingAudioContext extends AudioContext {
  constructor(opts) {
    opts = opts || /* istanbul ignore next */ {};

    let sampleRate = opts.sampleRate;
    let numberOfChannels = opts.channels || opts.numberOfChannels;
    let bitDepth = opts.bitDepth;
    let floatingPoint = opts.float || opts.floatingPoint;

    sampleRate = util.defaults(sampleRate, 44100);
    numberOfChannels = util.defaults(numberOfChannels, 2);
    bitDepth = util.defaults(bitDepth, 16);
    floatingPoint = !!floatingPoint;

    super({ sampleRate, numberOfChannels });

    util.defineProp(this, "_format", { sampleRate, numberOfChannels, bitDepth, floatingPoint });
    util.defineProp(this, "_rendered", []);

    this.resume();
  }

  get blockSize() {
    return this._impl.blockSize;
  }

  processTo(time) {
    time = util.toAudioTime(time);

    const duration = time - this.currentTime;

    if (duration <= 0) {
      return;
    }

    const impl = this._impl;
    const blockSize = impl.blockSize;
    const numberOfProcessing = Math.ceil(duration / blockSize);
    const bufferLength = blockSize * numberOfProcessing;
    const numberOfChannels = this._format.numberOfChannels;
    const buffers = new Array(numberOfChannels).fill().map(() => new Float32Array(bufferLength));

    for (let i = 0; i < numberOfProcessing; i++) {
      const audioData = impl.process();

      for (let ch = 0; ch < numberOfChannels; ch++) {
        buffers[ch].set(audioData.channelData[ch], i * blockSize);
      }
    }

    this._rendered.push(buffers);
  }

  exportAsAudioData() {
    const numberOfChannels = this._format.numberOfChannels;
    const length = this._rendered.reduce((length, buffers) => length + buffers[0].length, 0);
    const sampleRate = this._format.sampleRate;
    const channelData = new Array(numberOfChannels).fill().map(() => new Float32Array(length));
    const audioData = { numberOfChannels, length, sampleRate, channelData };

    let offset = 0;

    this._rendered.forEach((buffers) => {
      for (let ch = 0; ch < numberOfChannels; ch++) {
        channelData[ch].set(buffers[ch], offset);
      }
      offset += buffers[0].length;
    });

    return audioData;
  }

  encodeAudioData(audioData, opts) {
    opts = Object.assign({}, this._format, opts);
    return encoder.encode(audioData, opts);
  }
}

module.exports = RenderingAudioContext;
