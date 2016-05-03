"use strict";

const assert = require("power-assert");
const toValidSampleRate = require("../../src/util/toValidSampleRate");

describe("util.toValidBitDepth()", () => {
  it("return valid number of channels", () => {
    assert(toValidSampleRate(0) === 3000);
    assert(toValidSampleRate(5512.5) === 5512);
    assert(toValidSampleRate(44100) === 44100);
    assert(toValidSampleRate(48000) === 48000);
    assert(toValidSampleRate(Infinity) === 192000);
  });
});
