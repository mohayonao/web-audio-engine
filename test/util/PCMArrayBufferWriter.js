"use strict";

require("run-with-mocha");

const assert = require("assert");
const PCMArrayBufferWriter = require("../../src/util/PCMArrayBufferWriter");

describe("util/PCMArrayBufferWriter", () => {
  describe("constructor", () => {
    it("works", () => {
      const buffer = new Uint8Array(16).buffer;
      const writer = new PCMArrayBufferWriter(buffer);

      assert(writer instanceof PCMArrayBufferWriter);
    });
  });

  describe(".pcm8(value)", () => {
    it("works", () => {
      const buffer = new Uint8Array(16).buffer;
      const writer = new PCMArrayBufferWriter(buffer);

      for (let i = 0; i < 16; i++) {
        writer.pcm8(i / 8 - 1);
      }

      const actual = new Uint8Array(buffer);
      const expected = new Uint8Array([ 0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120 ]);

      assert.deepEqual(actual, expected);
    });
  });

  describe(".pcm16(value)", () => {
    it("works", () => {
      const buffer = new Uint8Array(16).buffer;
      const writer = new PCMArrayBufferWriter(buffer);

      for (let i = 0; i < 8; i++) {
        writer.pcm16(i / 4 - 1);
      }

      const actual = new Uint16Array(buffer);
      const expected = new Uint16Array([ 32768, 40960, 49152, 57344, 0, 8191, 16383, 24575 ]);

      assert.deepEqual(actual, expected);
    });
  });

  describe(".pcm32(value)", () => {
    it("works", () => {
      const buffer = new Uint8Array(16).buffer;
      const writer = new PCMArrayBufferWriter(buffer);

      for (let i = 0; i < 4; i++) {
        writer.pcm32(i / 2 - 1);
      }

      const actual = new Uint32Array(buffer);
      const expected = new Uint32Array([ 2147483648, 3221225472, 0, 1073741823 ]);

      assert.deepEqual(actual, expected);
    });
  });

  describe(".pcm32f(value)", () => {
    it("works", () => {
      const buffer = new Uint8Array(16).buffer;
      const writer = new PCMArrayBufferWriter(buffer);

      for (let i = 0; i < 4; i++) {
        writer.pcm32f(i / 2 - 1);
      }

      const actual = new Float32Array(buffer);
      const expected = new Float32Array([ -1, -0.5, 0, 0.5 ]);

      assert.deepEqual(actual, expected);
    });
  });
});
