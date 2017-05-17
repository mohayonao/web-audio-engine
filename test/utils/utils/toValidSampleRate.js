"use strict";

require("run-with-mocha");

const assert = require("assert");
const toValidSampleRate = require("../../../src/utils/utils/toValidSampleRate");

describe("utils/toValidSampleRate()", () => {
  it("return valid sampleRate", () => {
    assert(toValidSampleRate(0) === 3000);
    assert(toValidSampleRate(5512.5) === 5512);
    assert(toValidSampleRate(44100) === 44100);
    assert(toValidSampleRate(48000) === 48000);
    assert(toValidSampleRate(Infinity) === 192000);
  });
});
