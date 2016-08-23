"use strict";

require("run-with-mocha");

const assert = require("power-assert");
const toGain = require("../../src/util/toGain");

describe("util.toGain(decibel)", () => {
  it("convert decibel to gain", () => {
    assert(toGain(10).toFixed(3) === '3.162');
    assert( toGain(6).toFixed(3) === '1.995');
    assert( toGain(3).toFixed(3) === '1.413');
    assert( toGain(1).toFixed(3) === '1.122');
    assert( toGain(0).toFixed(3) === '1.000');
    assert(toGain(-1).toFixed(3) === '0.891');
    assert(toGain(-3).toFixed(3) === '0.708');
    assert(toGain(-6).toFixed(3) === '0.501');
  });
});
