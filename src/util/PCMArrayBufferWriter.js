"use strict";

class PCMArrayBufferWriter {
  constructor(buffer) {
    this._view = new DataView(buffer);
    this._pos = 0;
  }

  pcm8(value) {
    value = Math.max(-1, Math.min(value, +1));
    value = (value * 0.5 + 0.5) * 128;
    this._view.setUint8(this._pos, value|0);
    this._pos += 1;
  }

  pcm16(value) {
    value = Math.max(-1, Math.min(value, +1));
    value = value < 0 ? value * 32768 : value * 32767;
    this._view.setInt16(this._pos, value|0, true);
    this._pos += 2;
  }

  pcm32(value) {
    value = Math.max(-1, Math.min(value, +1));
    value = value < 0 ? value * 2147483648 : value * 2147483647;
    this._view.setInt32(this._pos, value|0, true);
    this._pos += 4;
  }

  pcm32f(value) {
    this._view.setFloat32(this._pos, value, true);
    this._pos += 4;
  }
}

module.exports = PCMArrayBufferWriter;
