"use strict";

class PCMBufferWriter {
  constructor(buffer) {
    this._buffer = buffer;
    this._pos = 0;
  }

  pcm8(value) {
    value = Math.max(-1, Math.min(value, +1));
    value = (value * 0.5 + 0.5) * 128;
    this._buffer.writeUInt8(value|0, this._pos);
    this._pos += 1;
  }

  pcm16(value) {
    value = Math.max(-1, Math.min(value, +1));
    value = value < 0 ? value * 32768 : value * 32767;
    this._buffer.writeInt16LE(value|0, this._pos);
    this._pos += 2;
  }

  pcm32(value) {
    value = Math.max(-1, Math.min(value, +1));
    value = value < 0 ? value * 2147483648 : value * 2147483647;
    this._buffer.writeInt32LE(value|0, this._pos);
    this._pos += 4;
  }

  pcm32f(value) {
    this._buffer.writeFloatLE(value, this._pos);
    this._pos += 4;
  }
}

module.exports = PCMBufferWriter;
