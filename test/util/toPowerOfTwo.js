"use strict";

const assert = require("power-assert");
const toPowerOfTwo = require("../../src/util/toPowerOfTwo");

describe("util.toPowerOfTwo(value)", () => {
  it("convert to 2^n", () => {
    assert(toPowerOfTwo(1) === 1);
    assert(toPowerOfTwo(2) === 2);
    assert(toPowerOfTwo(3) === 4);
    assert(toPowerOfTwo(3, Math.floor) === 2);
    assert(toPowerOfTwo(3, Math.ceil) === 4);
  });
});
