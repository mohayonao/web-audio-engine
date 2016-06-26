"use strict";

const assert = require("power-assert");
const toDecibel = require("../../src/util/toDecibel");

describe("util.toDecibel(gainValue)", () => {
  it("convert gainValue to decibel", () => {
    assert(Math.round(toDecibel(3.162)) === 10);
    assert(Math.round(toDecibel(1.995)) ===  6);
    assert(Math.round(toDecibel(1.413)) ===  3);
    assert(Math.round(toDecibel(1.122)) ===  1);
    assert(Math.round(toDecibel(1.000)) ===  0);
    assert(Math.round(toDecibel(0.891)) === -1);
    assert(Math.round(toDecibel(0.708)) === -3);
    assert(Math.round(toDecibel(0.501)) === -6);
  });
});
