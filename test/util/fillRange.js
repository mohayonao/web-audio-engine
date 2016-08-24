"use strict";

require("run-with-mocha");

const assert = require("assert");
const fillRange = require("../../src/util/fillRange");

describe("util/fillRange(list, value, start, end)", () => {
  it("fill value", () => {
    const list = new Float32Array(8);
    const actual = fillRange(list, 1, 2, 6);
    const expected = new Float32Array([ 0, 0, 1, 1, 1, 1, 0, 0 ]);

    assert.deepEqual(actual, expected);
    assert.deepEqual(list, expected);
  });

  it("fill value - polyfill ver", () => {
    const list = new Float32Array(8);

    // kill native function
    Object.defineProperty(list, "fill", { value: null });

    const actual = fillRange(list, 1, 2, 6);
    const expected = new Float32Array([ 0, 0, 1, 1, 1, 1, 0, 0 ]);

    assert.deepEqual(actual, expected);
    assert.deepEqual(list, expected);
  });
});
