"use strict";

const assert = require("power-assert");
const deepEqual = require("deep-equal");
const PCMEncoder = require("../../src/util/PCMEncoder");

describe("util.PCMEncoder", () => {
  describe(".create()", () => {
    it("works", () => {
      const encoder = PCMEncoder.create(8, { channels: 1, bitDepth: 32, float: true });

      assert(encoder);
    });
  });

  describe("channels is 1", () => {
    it("works", () => {
      const encoder = PCMEncoder.create(8, { channels: 1, bitDepth: 32, float: true });
      const channelData1 = [
        new Float32Array([ +0.0, +0.1, +0.2, +0.3, +0.4, +0.5, +0.6, +0.7 ])
      ];
      const channelData2 = [
        new Float32Array([ -0.0, -0.1, -0.2, -0.3, -0.4, -0.5, -0.6, -0.7 ])
      ];
      const buf1 = encoder.encode(channelData1);
      const buf2 = encoder.encode(channelData2);
      const actual1 = new Float32Array(Uint8Array.from(buf1).buffer);
      const actual2 = new Float32Array(Uint8Array.from(buf2).buffer);

      assert(deepEqual(actual1, new Float32Array([ +0.0, +0.1, +0.2, +0.3, +0.4, +0.5, +0.6, +0.7 ])));
      assert(deepEqual(actual2, new Float32Array([ -0.0, -0.1, -0.2, -0.3, -0.4, -0.5, -0.6, -0.7 ])));
    });
  });

  describe("channels is 2", () => {
    it("works", () => {
      const encoder = PCMEncoder.create(4, { channels: 2, bitDepth: 32, float: true });
      const channelData1 = [
        new Float32Array([ +0.0, +0.1, +0.2, +0.3 ]),
        new Float32Array([ +0.4, +0.5, +0.6, +0.7 ])
      ];
      const channelData2 = [
        new Float32Array([ -0.0, -0.1, -0.2, -0.3 ]),
        new Float32Array([ -0.4, -0.5, -0.6, -0.7 ])
      ];

      const buf1 = encoder.encode(channelData1);
      const buf2 = encoder.encode(channelData2);
      const actual1 = new Float32Array(Uint8Array.from(buf1).buffer);
      const actual2 = new Float32Array(Uint8Array.from(buf2).buffer);

      assert(deepEqual(actual1, new Float32Array([ +0.0, +0.4, +0.1, +0.5, +0.2, +0.6, +0.3, +0.7 ])));
      assert(deepEqual(actual2, new Float32Array([ -0.0, -0.4, -0.1, -0.5, -0.2, -0.6, -0.3, -0.7 ])));
    });
  });

  describe("channels is N", () => {
    it("works", () => {
      const encoder = PCMEncoder.create(2, { channels: 4, bitDepth: 32, float: true });
      const channelData1 = [
        new Float32Array([ +0.0, +0.1 ]),
        new Float32Array([ +0.2, +0.3 ]),
        new Float32Array([ +0.4, +0.5 ]),
        new Float32Array([ +0.6, +0.7 ])
      ];
      const channelData2 = [
        new Float32Array([ -0.0, -0.1 ]),
        new Float32Array([ -0.2, -0.3 ]),
        new Float32Array([ -0.4, -0.5 ]),
        new Float32Array([ -0.6, -0.7 ])
      ];

      const buf1 = encoder.encode(channelData1);
      const buf2 = encoder.encode(channelData2);
      const actual1 = new Float32Array(Uint8Array.from(buf1).buffer);
      const actual2 = new Float32Array(Uint8Array.from(buf2).buffer);

      assert(deepEqual(actual1, new Float32Array([ +0.0, +0.2, +0.4, +0.6, +0.1, +0.3, +0.5, +0.7 ])));
      assert(deepEqual(actual2, new Float32Array([ -0.0, -0.2, -0.4, -0.6, -0.1, -0.3, -0.5, -0.7 ])));
    });
  });
});
