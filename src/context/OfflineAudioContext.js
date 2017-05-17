"use strict";

const nmap = require("nmap");
const AudioDataUtils = require("../utils/AudioDataUtils");
const BaseAudioContext = require("../api/BaseAudioContext");
const AudioBuffer = require("../api/AudioBuffer");
const { defineProp } = require("../utils");
const { toValidNumberOfChannels, toValidSampleRate, toNumber } = require("../utils");
const { RUNNING, SUSPENDED, CLOSED } = require("../constants/AudioContextState");

class OfflineAudioContext extends BaseAudioContext {
  /**
   * @param {number} numberOfChannels
   * @param {number} length
   * @param {number} sampleRate
   */
  constructor(numberOfChannels, length, sampleRate) {
    numberOfChannels = toValidNumberOfChannels(numberOfChannels);
    length = Math.max(0, length|0);
    sampleRate = toValidSampleRate(sampleRate);

    super({ sampleRate, numberOfChannels });

    this._impl.$oncomplete = null;

    defineProp(this, "_numberOfChannels", numberOfChannels);
    defineProp(this, "_length", length);
    defineProp(this, "_suspendedTime", Infinity);
    defineProp(this, "_suspendPromise", null);
    defineProp(this, "_suspendResolve", null);
    defineProp(this, "_renderingPromise", null);
    defineProp(this, "_renderingResolve", null);
    defineProp(this, "_renderingIterations", 128);
    defineProp(this, "_audioData", null);
    defineProp(this, "_writeIndex", 0);
  }

  /**
   * @return {number}
   */
  get length() {
    return this._length;
  }

  /**
   * @return {function}
   */
  get oncomplete() {
    return this._impl.$oncomplete;
  }

  /**
   * @param {function} callback
   */
  set oncomplete(callback) {
    this._impl.replaceEventListener("complete", this._impl.$oncomplete, callback);
    this._impl.$oncomplete = callback;
  }

  /**
   * @return {Promise<void>}
   */
  resume() {
    /* istanbul ignore next */
    if (this._impl.state === CLOSED) {
      return Promise.reject(new TypeError("cannot startRendering when an OfflineAudioContext is closed"));
    }
    /* istanbul ignore next */
    if (this._renderingPromise === null) {
      return Promise.reject(new TypeError("cannot resume an offline context that has not started"));
    }
    /* istanbul ignore else */
    if (this._impl.state === SUSPENDED) {
      render.call(this, this._impl);
    }
    return Promise.resolve();
  }

  /**
   * @param {number} time
   * @return {Promise<void>}
   */
  suspend(time) {
    /* istanbul ignore next */
    if (this._impl.state === CLOSED) {
      return Promise.reject(new TypeError("cannot startRendering when an OfflineAudioContext is closed"));
    }
    /* istanbul ignore next */
    if (this._suspendPromise !== null) {
      return Promise.reject(new TypeError("cannot schedule more than one suspend"));
    }

    time = Math.max(0, toNumber(time));

    this._suspendedTime = time;
    this._suspendPromise = new Promise((resolve) => {
      this._suspendResolve = resolve;
    });

    return this._suspendPromise;
  }

  /**
   * @return {Promise<void>}
   */
  /* istanbul ignore next */
  close() {
    return Promise.reject(new TypeError("cannot close an OfflineAudioContext"));
  }

  /**
   * @return {Promise<AudioBuffer>}
   */
  startRendering() {
    /* istanbul ignore next */
    if (this._impl.state === CLOSED) {
      return Promise.reject(new TypeError("cannot startRendering when an OfflineAudioContext is closed"));
    }
    /* istanbul ignore next */
    if (this._renderingPromise !== null) {
      return Promise.reject(new TypeError("cannot call startRendering more than once"));
    }

    this._renderingPromise = new Promise((resolve) => {
      const numberOfChannels = this._numberOfChannels;
      const length = this._length;
      const sampleRate = this.sampleRate;
      const blockSize = this._impl.blockSize;

      this._audioData = createRenderingAudioData(numberOfChannels, length, sampleRate, blockSize);
      this._renderingResolve = resolve;

      render.call(this, this._impl);
    });

    return this._renderingPromise;
  }
}

function createRenderingAudioData(numberOfChannels, length, sampleRate, blockSize) {
  length = Math.ceil(length / blockSize) * blockSize;

  const channelData = nmap(numberOfChannels, () => new Float32Array(length));

  return { numberOfChannels, length, sampleRate, channelData };
}

function suspendRendering() {
  this._suspendResolve();
  this._suspendedTime = Infinity;
  this._suspendPromise = this._suspendResolve = null;
  this._impl.changeState(SUSPENDED);
}

function doneRendering(audioData) {
  const length = this._length;

  audioData.channelData = audioData.channelData.map((channelData) => {
    return channelData.subarray(0, length);
  });
  audioData.length = length;

  const audioBuffer = AudioDataUtils.toAudioBuffer(audioData, AudioBuffer);

  this._impl.changeState(CLOSED);
  this._impl.dispatchEvent({ type: "complete", renderedBuffer: audioBuffer });

  this._renderingResolve(audioBuffer);
  this._renderingResolve = null;
}

function render(impl) {
  const audioData = this._audioData;
  const audioDataLength = audioData.length;
  const channelData = audioData.channelData;
  const blockSize = impl.blockSize;
  const renderingIterations = this._renderingIterations;

  let writeIndex = this._writeIndex;

  const loop = () => {
    const remainIterations = ((audioDataLength - writeIndex) / blockSize);
    const iterations = Math.min(renderingIterations, remainIterations)|0;

    for (let i = 0; i < iterations; i++) {
      if (this._suspendedTime <= impl.currentTime) {
        this._writeIndex = writeIndex;
        return suspendRendering.call(this);
      } else {
        impl.process(channelData, writeIndex);
        writeIndex += blockSize;
      }
    }
    this._writeIndex = writeIndex;

    if (writeIndex === audioDataLength) {
      doneRendering.call(this, audioData);
    } else {
      setImmediate(loop);
    }
  };

  impl.changeState(RUNNING);

  setImmediate(loop);
}

module.exports = OfflineAudioContext;
