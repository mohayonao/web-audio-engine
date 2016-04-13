"use strict";

const util = require("../util");
const audioDataUtil = require("../util/audioDataUtil");
const AudioContext = require("../api/AudioContext");
const AudioBuffer = require("../api/AudioBuffer");
const RENDERING_ITERATIONS = 128;

class OfflineAudioContext extends AudioContext {
  constructor(numberOfChannels, length, sampleRate) {
    numberOfChannels = util.toValidNumberOfChannels(numberOfChannels);
    length = Math.max(0, length|0);
    sampleRate = util.toValidSampleRate(sampleRate);

    super({ sampleRate, numberOfChannels });

    this._impl.$oncomplete = null;

    util.defineProp(this, "_numberOfChannels", numberOfChannels);
    util.defineProp(this, "_length", length);
    util.defineProp(this, "_suspendedTime", Infinity);
    util.defineProp(this, "_suspendPromise", null);
    util.defineProp(this, "_suspendResolve", null);
    util.defineProp(this, "_renderingPromise", null);
    util.defineProp(this, "_renderingResolve", null);
    util.defineProp(this, "_audioData", null);
    util.defineProp(this, "_writeIndex", 0);
  }

  get oncomplete() {
    return this._impl.$oncomplete;
  }

  set oncomplete(callback) {
    this._impl.replaceEventListener("complete", this._impl.$oncomplete, callback);
    this._impl.$oncomplete = callback;
  }

  resume() {
    if (this.state === "suspended" && this._renderingPromise !== null) {
      render.call(this, this._impl);
    }
    return Promise.resolve();
  }

  suspend(time) {
    time = Math.max(0, util.toNumber(time));

    this._suspendedTime = time;

    if (this._suspendPromise === null) {
      this._suspendPromise = new Promise((resolve) => {
        this._suspendResolve = resolve;
      });
    }

    return this._suspendPromise;
  }

  /* istanbul ignore next */
  close() {
    return Promise.reject();
  }

  startRendering() {
    if (this._renderingPromise === null) {
      this._renderingPromise = new Promise((resolve) => {
        const numberOfChannels = this._numberOfChannels;
        const length = this._length;
        const sampleRate = this.sampleRate;
        const blockSize = this._impl.blockSize;

        this._audioData = createRenderingAudioData(numberOfChannels, length, sampleRate, blockSize);
        this._renderingResolve = resolve;

        render.call(this, this._impl);
      });
    }
    return this._renderingPromise;
  }
}

function createRenderingAudioData(numberOfChannels, length, sampleRate, blockSize) {
  length = Math.ceil(length / blockSize) * blockSize;

  const channelData = new Array(numberOfChannels).fill().map(() => new Float32Array(length));

  return { numberOfChannels, length, sampleRate, channelData };
}

function suspendRendering() {
  if (this._suspendResolve !== null) {
    this._suspendResolve();
    this._suspendedTime = Infinity;
    this._suspendPromise = this._suspendResolve = null;
    this._impl.changeState("suspended");
  }
}

function doneRendering(audioData) {
  const numberOfChannels = audioData.numberOfChannels;
  const length = this._length;

  for (let ch = 0; ch < numberOfChannels; ch++) {
    audioData.channelData[ch] = audioData.channelData[ch].subarray(0, length);
  }
  audioData.length = length;

  const audioBuffer = audioDataUtil.toAudioBuffer(audioData, AudioBuffer);

  this._impl.changeState("closed");
  this._impl.dispatchEvent({ type: "complete", renderedBuffer: audioBuffer });

  this._renderingResolve(audioBuffer);
  this._renderingResolve = null;
}

function render(impl) {
  const audioData = this._audioData;
  const numberOfChannels = audioData.numberOfChannels;
  const audioDataLength = audioData.length;
  const channelData = audioData.channelData;
  const blockSize = impl.blockSize;

  const loop = () => {
    let n = RENDERING_ITERATIONS;

    while (n--) {
      if (this._suspendedTime <= this.currentTime) {
        return suspendRendering.call(this);
      }

      const processedChannelData = impl.process().channelData;

      for (let ch = 0; ch < numberOfChannels; ch++) {
        channelData[ch].set(processedChannelData[ch], this._writeIndex);
      }

      this._writeIndex += blockSize;

      if (this._writeIndex === audioDataLength) {
        return doneRendering.call(this, audioData);
      }
    }

    setTimeout(loop, 0);
  };

  impl.changeState("running");

  setTimeout(loop, 0);
}

module.exports = OfflineAudioContext;
