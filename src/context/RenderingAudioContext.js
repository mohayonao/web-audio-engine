"use strict";

const nmap = require("nmap");
const config = require("../config");
const BaseAudioContext = require("../api/BaseAudioContext");
const encoder = require("../encoder");
const { defaults, defineProp } = require("../utils");
const { toValidSampleRate, toValidBlockSize, toValidNumberOfChannels, toValidBitDepth, toAudioTime } = require("../utils");
const { RUNNING, SUSPENDED } = require("../constants/AudioContextState");

class RenderingAudioContext extends BaseAudioContext {
  /**
   * @param {object}  opts
   * @param {number}  opts.sampleRate
   * @param {number}  opts.blockSize
   * @param {number}  opts.numberOfChannels
   * @param {number}  opts.bitDepth
   * @param {boolean} opts.floatingPoint
   */
  constructor(opts = {}) {
    let sampleRate = defaults(opts.sampleRate, config.sampleRate);
    let blockSize = defaults(opts.blockSize, config.blockSize);
    let numberOfChannels = defaults(opts.channels || opts.numberOfChannels, config.numberOfChannels);
    let bitDepth = defaults(opts.bitDepth, config.bitDepth);
    let floatingPoint = opts.float || opts.floatingPoint;

    sampleRate = toValidSampleRate(sampleRate);
    blockSize = toValidBlockSize(blockSize);
    numberOfChannels = toValidNumberOfChannels(numberOfChannels);
    bitDepth = toValidBitDepth(bitDepth);
    floatingPoint = !!floatingPoint;

    super({ sampleRate, blockSize, numberOfChannels });

    defineProp(this, "_format", { sampleRate, channels: numberOfChannels, bitDepth, float: floatingPoint });
    defineProp(this, "_rendered", []);
  }

  /**
   * @return {number}
   */
  get numberOfChannels() {
    return this._impl.numberOfChannels;
  }

  /**
   * @return {number}
   */
  get blockSize() {
    return this._impl.blockSize;
  }

  /**
   * @return {object}
   */
  get format() {
    return this._format;
  }

  /**
   * @param {number|string} time
   */
  processTo(time) {
    time = toAudioTime(time);

    const duration = time - this.currentTime;

    /* istanbul ignore next */
    if (duration <= 0) {
      return;
    }

    const impl = this._impl;
    const blockSize = impl.blockSize;
    const iterations = Math.ceil(duration * this.sampleRate / blockSize);
    const bufferLength = blockSize * iterations;
    const numberOfChannels = this._format.channels;
    const buffers = nmap(numberOfChannels, () => new Float32Array(bufferLength));

    impl.changeState(RUNNING);

    for (let i = 0; i < iterations; i++) {
      impl.process(buffers, i * blockSize);
    }

    this._rendered.push(buffers);

    impl.changeState(SUSPENDED);
  }

  /**
   * @return {AudioData}
   */
  exportAsAudioData() {
    const numberOfChannels = this._format.channels;
    const length = this._rendered.reduce((length, buffers) => length + buffers[0].length, 0);
    const sampleRate = this._format.sampleRate;
    const channelData = nmap(numberOfChannels, () => new Float32Array(length));
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

  /**
   * @param {AudioData} audioData
   * @param {object}    opts
   */
  encodeAudioData(audioData, opts) {
    opts = Object.assign({}, this._format, opts);
    return encoder.encode(audioData, opts);
  }
}

module.exports = RenderingAudioContext;
