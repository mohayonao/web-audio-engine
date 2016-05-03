"use strict";

const assert = require("power-assert");
const toNumber = require("../../src/util/toNumber");

describe("util.toNumber(value)", () => {
  it("convert to number", () => {
    assert(toNumber(1) === 1);
    assert(toNumber(Infinity) === Infinity);
    assert(toNumber("1") === 1);
    assert(toNumber(NaN) === 0);
  });
});
