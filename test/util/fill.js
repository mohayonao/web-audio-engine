"use strict";

require("run-with-mocha");

const assert = require("power-assert");
const deepEqual = require("deep-equal");
const fill = require("../../src/util/fill");

describe("util.fill(list, value)", () => {
  it("fill value", () => {
    const list = new Float32Array(8);
    const actual = fill(list, 1);
    const expected = new Float32Array([ 1, 1, 1, 1, 1, 1, 1, 1 ]);

    assert(deepEqual(actual, expected));
    assert(deepEqual(list, expected));
  });
  it("fill value - polyfill ver", () => {
    const list = new Float32Array(8);

    // kill native function
    Object.defineProperty(list, "fill", { value: null });

    const actual = fill(list, 1);
    const expected = new Float32Array([ 1, 1, 1, 1, 1, 1, 1, 1 ]);

    assert(deepEqual(actual, expected));
    assert(deepEqual(list, expected));
  });
});
