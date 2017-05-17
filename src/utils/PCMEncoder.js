"use strict";

const Buffer = global.Buffer;
const PCMArrayBufferWriter = require("./PCMArrayBufferWriter");
const PCMBufferWriter = require("./PCMBufferWriter");
const PCMWriter = getPCMWriter();
const alloc = getAllocFunction();

function create(length, format) {
  const bitDepth = resolveBitDepth(format.bitDepth, format.float);
  const methodName = resolveWriteMethodName(bitDepth, format.float);
  const bytes = format.bitDepth >> 3;
  const numberOfChannels = format.channels;
  const bufferLength = numberOfChannels * length * bytes;

  if (numberOfChannels === 1) {
    return {
      encode(channelData) {
        const buffer = alloc(bufferLength);
        const writer = new PCMWriter(buffer);
        const output = channelData[0];

        for (let i = 0, imax = length; i < imax; i++) {
          writer[methodName](output[i]);
        }

        return buffer;
      }
    };
  }

  if (numberOfChannels === 2) {
    return {
      encode(channelData) {
        const buffer = alloc(bufferLength);
        const writer = new PCMWriter(buffer);
        const outputL = channelData[0];
        const outputR = channelData[1];

        for (let i = 0, imax = length; i < imax; i++) {
          writer[methodName](outputL[i]);
          writer[methodName](outputR[i]);
        }

        return buffer;
      }
    };
  }

  return {
    encode(channelData) {
      const buffer = alloc(bufferLength);
      const writer = new PCMWriter(buffer);

      for (let i = 0, imax = length; i < imax; i++) {
        for (let ch = 0; ch < numberOfChannels; ch++) {
          writer[methodName](channelData[ch][i]);
        }
      }

      return buffer;
    }
  };
}

/* istanbul ignore next */
function resolveBitDepth(bitDepth, float) {
  return float ? 32 : bitDepth;
}

/* istanbul ignore next */
function resolveWriteMethodName(bitDepth, float) {
  if (float) {
    return "pcm32f";
  }
  return "pcm" + bitDepth;
}

/* istanbul ignore next */
function getPCMWriter() {
  return Buffer ? PCMBufferWriter : PCMArrayBufferWriter;
}

/* istanbul ignore next */
function getAllocFunction() {
  return Buffer ? (Buffer.alloc ? Buffer.alloc : newBuffer) : newArrayBuffer;
}

/* istanbul ignore next */
function newBuffer(size) {
  return new Buffer(size);
}

/* istanbul ignore next */
function newArrayBuffer(size) {
  return new Uint8Array(size).buffer;
}

module.exports = { create };
