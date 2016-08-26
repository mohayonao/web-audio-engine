"use strict";

require("run-with-mocha");

const assert = require("assert");
const toGain = require("../../src/util/toGain");

function closeTo(a, b, delta) {
  return Math.abs(a - b) <= delta;
}

describe("util/toGain(decibel)", () => {
  it("convert decibel to gain", () => {
    assert(closeTo(toGain(10), 3.1622776985168457, 1e-6));
    assert(closeTo(toGain( 6), 1.9952622652053833, 1e-6));
    assert(closeTo(toGain( 3), 1.4125375747680664, 1e-6));
    assert(closeTo(toGain( 1), 1.1220184564590454, 1e-6));
    assert(toGain(0) === 1);
    assert(closeTo(toGain(-1), 0.8912509083747864, 1e-6));
    assert(closeTo(toGain(-3), 0.7079457640647888, 1e-6));
    assert(closeTo(toGain(-6), 0.5011872053146362, 1e-6));
  });
});
