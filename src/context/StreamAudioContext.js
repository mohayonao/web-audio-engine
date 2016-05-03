"use strict";

const util = require("../util");
const config = require("../config");
const AudioContext = require("../api/AudioContext");
const Buffer = global.Buffer;
const setImmediate = global.setImmediate || /* istanbul ignore next */ (fn => setTimeout(fn, 0));
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

    const encoder = createEncoder(numberOfChannels, blockSize, bitDepth, floatingPoint);

    util.defineProp(this, "_numberOfChannels", numberOfChannels);
    util.defineProp(this, "_encoder", encoder);
    util.defineProp(this, "_blockSize", blockSize);
    util.defineProp(this, "_stream", noopWriter);
    util.defineProp(this, "_isPlaying", false);
  }

  /**
   * @return {number}
   */
  get blockSize() {
    return this._impl.blockSize;
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
    if (this.state === "suspended") {
      this._resume();
    }
    return super.resume();
  }

  /**
   * @return {Promise<void>}
   */
  suspend() {
    if (this.state === "running") {
      this._suspend();
    }
    return super.suspend();
  }


  /**
   * @return {Promise<void>}
   */
  close() {
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
    const channelData = Array.from({ length: this._numberOfChannels }, () => new Float32Array(this._blockSize));

    const renderingProcess = () => {
      if (impl.state === "running") {
        const contextElapsed = impl.currentTime - contextStartTime;
        const timerElapsed = (Date.now() - timerStartTime) / 1000;

        if (this._isPlaying && contextElapsed < timerElapsed + aheadTime) {
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
    if (this._stream !== null) {
      this._stream.end();
      this._stream = null;
    }
  }
}

function createEncoder(numberOfChannels, length, bitDepth, floatingPoint) {
  bitDepth = floatingPoint ? 32 : bitDepth;
  floatingPoint = floatingPoint ? "f" : "";

  const bytes = bitDepth >> 3;
  const bufferLength = numberOfChannels * length * bytes;
  const methodName = "pcm" + bitDepth + floatingPoint;
  const allocBuffer = Buffer.alloc ? Buffer.alloc : (size) => new Buffer(size);

  return {
    encode(channelData) {
      const buffer = allocBuffer(bufferLength);
      const writer = createBufferWriter(buffer);

      for (let i = 0, imax = length; i < imax; i++) {
        for (let ch = 0; ch < numberOfChannels; ch++) {
          writer[methodName](channelData[ch][i]);
        }
      }

      return buffer;
    }
  };
}

function createBufferWriter(buffer) {
  let pos = 0;

  return {
    pcm8(value) {
      value = Math.max(-1, Math.min(value, +1));
      value = (value * 0.5 + 0.5) * 128;
      buffer.writeUInt8(value|0, pos);
      pos += 1;
    },
    pcm16(value) {
      value = Math.max(-1, Math.min(value, +1));
      value = value < 0 ? value * 32768 : value * 32767;
      buffer.writeInt16LE(value|0, pos);
      pos += 2;
    },
    pcm24(value) {
      value = Math.max(-1, Math.min(value, +1));
      value = value < 0 ? 0x1000000 + value * 8388608 : value * 8388607;
      value = value|0;

      const x0 = (value >>  0) & 0xFF;
      const x1 = (value >>  8) & 0xFF;
      const x2 = (value >> 16) & 0xFF;

      buffer.writeUInt8(x0, pos + 0);
      buffer.writeUInt8(x1, pos + 1);
      buffer.writeUInt8(x2, pos + 2);
      pos += 3;
    },
    pcm32(value) {
      value = Math.max(-1, Math.min(value, +1));
      value = value < 0 ? value * 2147483648 : value * 2147483647;
      buffer.writeInt32LE(value|0, pos);
      pos += 4;
    },
    pcm32f(value) {
      buffer.writeFloatLE(value, pos);
      pos += 4;
    }
  };
}

module.exports = StreamAudioContext;
