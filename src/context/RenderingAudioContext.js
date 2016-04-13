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

    this._format = { sampleRate, numberOfChannels, bitDepth, floatingPoint };
    this._rendered = [];

    this.resume();
  }

  get processingSizeInFrames() {
    return this._impl.processingSizeInFrames;
  }

  processTo(time) {
    time = toAudioTime(time);

    const duration = time - this.currentTime;

    if (duration <= 0) {
      return;
    }

    const impl = this._impl;
    const processingSizeInFrames = impl.processingSizeInFrames;
    const numberOfProcessing = Math.ceil(duration / processingSizeInFrames);
    const bufferLength = processingSizeInFrames * numberOfProcessing;
    const numberOfChannels = this._format.numberOfChannels;
    const buffers = new Array(numberOfChannels).fill().map(() => new Float32Array(bufferLength));

    for (let i = 0; i < numberOfProcessing; i++) {
      const audioData = impl.process();

      for (let ch = 0; ch < numberOfChannels; ch++) {
        buffers[ch].set(audioData.channelData[ch], i * processingSizeInFrames);
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

function toAudioTime(str) {
  if (Number.isFinite(+str)) {
    const time = Math.max(0, +str);

    return Number.isFinite(time) ? time : 0;
  }

  const matched = ("" + str).match(/^(?:(\d\d+):)?(\d\d?):(\d\d?(?:\.\d+)?)$/);

  if (matched) {
    const hours = +matched[1]|0;
    const minutes = +matched[2];
    const seconds = +matched[3];

    return hours * 3600 + minutes * 60 + seconds;
  }

  return 0;
}

module.exports = RenderingAudioContext;
