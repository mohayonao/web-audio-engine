"use strict";

const assert = require("power-assert");
const clip = require("../../src/util/clip");

describe("util.clip(value, minValue, maxValue)", () => {
  it("return clipped value in the range [minValue, maxValue]", () => {
    assert(clip(0, 2, 4) === 2);
    assert(clip(1, 2, 4) === 2);
    assert(clip(2, 2, 4) === 2);
    assert(clip(3, 2, 4) === 3);
    assert(clip(4, 2, 4) === 4);
    assert(clip(5, 2, 4) === 4);
    assert(clip(6, 2, 4) === 4);
  });
});
