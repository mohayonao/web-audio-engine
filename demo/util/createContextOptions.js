"use strict";

function createContextOptions(opts) {
  return Object.assign({
    sampleRate: +opts.rate,
    numberOfChannels: Math.max(1, opts.channels|0),
  }, {
    u8: { bitDepth: 8 },
    s16: { bitDepth: 16 },
    s32: { bitDepth: 32 },
    raw: { float: true }
  }[opts.type]);
}

module.exports = createContextOptions;
