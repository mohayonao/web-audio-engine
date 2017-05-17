"use strict";

const nmap = require("nmap");
const config = require("../config");
const BaseAudioContext = require("../api/BaseAudioContext");
const PCMEncoder = require("../utils/PCMEncoder");
const setImmediate = require("../utils/setImmediate");
const { defaults, defineProp } = require("../utils");
const { toValidSampleRate, toValidBlockSize, toValidNumberOfChannels, toValidBitDepth } = require("../utils");
const { RUNNING, SUSPENDED, CLOSED } = require("../constants/AudioContextState");
const noopWriter = { write: () => true };

class StreamAudioContext extends BaseAudioContext {
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

    const format = { sampleRate, channels: numberOfChannels, bitDepth, float: floatingPoint };
    const encoder = PCMEncoder.create(blockSize, format);

    defineProp(this, "_numberOfChannels", numberOfChannels);
    defineProp(this, "_encoder", encoder);
    defineProp(this, "_blockSize", blockSize);
    defineProp(this, "_stream", noopWriter);
    defineProp(this, "_isPlaying", false);
    defineProp(this, "_format", format);
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
   * @param {Writable}
   * @return {Writable}
   */
  pipe(stream) {
    this._stream = stream;
    return stream;
  }

  /**
   * @return {Promise<void>}
   */
  resume() {
    /* istanbul ignore else */
    if (this.state === SUSPENDED) {
      this._resume();
    }
    return super.resume();
  }

  /**
   * @return {Promise<void>}
   */
  suspend() {
    /* istanbul ignore else */
    if (this.state === RUNNING) {
      this._suspend();
    }
    return super.suspend();
  }


  /**
   * @return {Promise<void>}
   */
  close() {
    /* istanbul ignore else */
    if (this.state !== CLOSED) {
      this._close();
    }
    return super.close();
  }

  _resume() {
    const contextStartTime = this.currentTime;
    const timerStartTime = Date.now();
    const encoder = this._encoder;
    const impl = this._impl;
    const aheadTime = 0.1;
    const channelData = nmap(this._numberOfChannels, () => new Float32Array(this._blockSize));

    const renderingProcess = () => {
      if (this._isPlaying) {
        const contextElapsed = impl.currentTime - contextStartTime;
        const timerElapsed = (Date.now() - timerStartTime) / 1000;

        if (contextElapsed < timerElapsed + aheadTime) {
          impl.process(channelData, 0);

          const buffer = encoder.encode(channelData);

          if (!this._stream.write(buffer)) {
            this._stream.once("drain", renderingProcess);
            return;
          }
        }

        setImmediate(renderingProcess);
      }
    };
    this._isPlaying = true;
    setImmediate(renderingProcess);
  }

  _suspend() {
    this._isPlaying = false;
  }

  _close() {
    this._suspend();
    /* istanbul ignore else */
    if (this._stream !== null) {
      this._stream = null;
    }
  }
}

module.exports = StreamAudioContext;
