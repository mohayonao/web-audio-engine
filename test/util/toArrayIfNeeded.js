"use strict";

const assert = require("power-assert");
const deepEqual = require("deep-equal");
const toArrayIfNeeded = require("../../src/util/toArrayIfNeeded");

describe("util.toArrayIfNeeded(value)", () => {
  it("convert to array if not array", () => {
    const value = 1;
    const actual = toArrayIfNeeded(value);
    const expected = [ value ];

    assert(deepEqual(actual, expected));
  });
  it("nothing to do if array", () => {
    const value = [ 1 ];
    const actual = toArrayIfNeeded(value);
    const expected = value;

    assert(actual === expected);
  });
});
