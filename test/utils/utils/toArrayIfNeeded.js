"use strict";

require("run-with-mocha");

const assert = require("assert");
const toArrayIfNeeded = require("../../../src/utils/utils/toArrayIfNeeded");

describe("utils/toArrayIfNeeded(value)", () => {
  it("convert to array if not array", () => {
    const value = 1;
    const actual = toArrayIfNeeded(value);
    const expected = [ value ];

    assert.deepEqual(actual, expected);
  });

  it("nothing to do if array", () => {
    const value = [ 1 ];
    const actual = toArrayIfNeeded(value);
    const expected = value;

    assert(actual === expected);
  });
});
