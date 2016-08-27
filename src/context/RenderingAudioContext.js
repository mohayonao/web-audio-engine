"use strict";

const nmap = require("nmap");
const util = require("../util");
const config = require("../config");
const AudioContext = require("../api/AudioContext");
const encoder = require("../encoder");

class RenderingAudioContext extends AudioContext {
  /**
   * @param {object}  opts
   * @param {number}  opts.sampleRate
   * @param {number}  opts.blockSize
   * @param {number}  opts.numberOfChannels
   * @param {number}  opts.bitDepth
   * @param {boolean} opts.floatingPoint
   */
  constructor(opts) {
    opts = opts || /* istanbul ignore next */ {};

    let sampleRate = util.defaults(opts.sampleRate, config.sampleRate);
    let blockSize = util.defaults(opts.blockSize, config.blockSize);
    let numberOfChannels = util.defaults(opts.channels || opts.numberOfChannels, config.numberOfChannels);
    let bitDepth = util.defaults(opts.bitDepth, config.bitDepth);
    let floatingPoint = opts.float || opts.floatingPoint;

    sampleRate = util.toValidSampleRate(sampleRate);
    blockSize = util.toValidBlockSize(blockSize);
    numberOfChannels = util.toValidNumberOfChannels(numberOfChannels);
    bitDepth = util.toValidBitDepth(bitDepth);
    floatingPoint = !!floatingPoint;

    super({ sampleRate, blockSize, numberOfChannels });

    util.defineProp(this, "_format", { sampleRate, channels: numberOfChannels, bitDepth, float: floatingPoint });
    util.defineProp(this, "_rendered", []);
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
    time = util.toAudioTime(time);

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

    impl.changeState("running");

    for (let i = 0; i < iterations; i++) {
      impl.process(buffers, i * blockSize);
    }

    this._rendered.push(buffers);

    impl.changeState("suspended");
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
