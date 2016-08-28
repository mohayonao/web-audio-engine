"use strict";

const nmap = require("nmap");
const util = require("../util");
const config = require("../config");
const AudioContext = require("../api/AudioContext");
const PCMEncoder = require("../util/PCMEncoder");
const setImmediate = require("../util/setImmediate");
const noopWriter = { write: () => true };

class StreamAudioContext extends AudioContext {
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

    const format = { sampleRate, channels: numberOfChannels, bitDepth, float: floatingPoint };
    const encoder = PCMEncoder.create(blockSize, format);

    util.defineProp(this, "_numberOfChannels", numberOfChannels);
    util.defineProp(this, "_encoder", encoder);
    util.defineProp(this, "_blockSize", blockSize);
    util.defineProp(this, "_stream", noopWriter);
    util.defineProp(this, "_isPlaying", false);
    util.defineProp(this, "_format", format);
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
    if (this.state === "suspended") {
      this._resume();
    }
    return super.resume();
  }

  /**
   * @return {Promise<void>}
   */
  suspend() {
    /* istanbul ignore else */
    if (this.state === "running") {
      this._suspend();
    }
    return super.suspend();
  }


  /**
   * @return {Promise<void>}
   */
  close() {
    /* istanbul ignore else */
    if (this.state !== "closed") {
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
