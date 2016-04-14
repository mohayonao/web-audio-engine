"use strict";

const util = require("../util");
const AudioContext = require("../api/AudioContext");
const setImmediate = global.setImmediate || /* istanbul ignore next */ (fn => setTimeout(fn, 0));
const noopWriter = { write: () => true };

class StreamAudioContext extends AudioContext {
  constructor(opts) {
    opts = opts || /* istanbul ignore next */ {};

    let sampleRate = util.defaults(opts.sampleRate, 44100);
    let blockSize = util.defaults(opts.blockSize, 128);
    let numberOfChannels = util.defaults(opts.channels || opts.numberOfChannels, 2);
    let bitDepth = util.defaults(opts.bitDepth, 16);
    let floatingPoint = opts.float || opts.floatingPoint;

    sampleRate = util.toValidSampleRate(sampleRate);
    blockSize = util.toValidBlockSize(blockSize);
    numberOfChannels = util.toValidNumberOfChannels(numberOfChannels);
    bitDepth = util.toValidBitDepth(bitDepth);
    floatingPoint = !!floatingPoint;

    super({ sampleRate, blockSize, numberOfChannels });

    const encoder = createEncoder(numberOfChannels, blockSize, bitDepth, floatingPoint);

    util.defineProp(this, "_encoder", encoder);
    util.defineProp(this, "_blockSize", blockSize);
    util.defineProp(this, "_stream", noopWriter);
    util.defineProp(this, "_isPlaying", false);
  }

  get blockSize() {
    return this._impl.blockSize;
  }

  pipe(stream) {
    this._stream = stream;
    return stream;
  }

  resume() {
    if (this.state === "suspended") {
      this._resume();
    }
    return super.resume();
  }

  suspend() {
    if (this.state === "running") {
      this._suspend();
    }
    return super.suspend();
  }

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

    const renderingProcess = () => {
      if (this.state !== "running") {
        return;
      }
      const contextElapsed = this.currentTime - contextStartTime;
      const timerElapsed = (Date.now() - timerStartTime) / 1000;

      if (contextElapsed < timerElapsed + aheadTime) {
        if (this._isPlaying) {
          const buffer = encoder.encode(impl.process());

          if (!this._stream.write(buffer)) {
            this._stream.once("drain", renderingProcess);
            return;
          }
        }
      }

      setImmediate(renderingProcess);
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
  const buffer = new global.Buffer(new Uint8Array(bufferLength));
  const writer = createBufferWriter(buffer);
  const methodName = "pcm" + bitDepth + floatingPoint;

  if (!writer[methodName]) {
    throw new TypeError("Not supported bit depth: " + bitDepth);
  }

  const write = writer[methodName].bind(writer);

  return {
    encode(audioData) {
      const channelData = audioData.channelData;

      writer.rewind();

      for (let i = 0, imax = audioData.length; i < imax; i++) {
        for (let ch = 0; ch < numberOfChannels; ch++) {
          write(channelData[ch][i]);
        }
      }

      return buffer;
    }
  };
}

function createBufferWriter(buffer) {
  let pos = 0;

  return {
    rewind() {
      pos = 0;
    },
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
