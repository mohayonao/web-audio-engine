"use strict";

require("run-with-mocha");

const assert = require("assert");
const clamp = require("../../../src/utils/utils/clamp");

describe("utils/clamp(value, minValue, maxValue)", () => {
  it("return clamped value in the range [minValue, maxValue]", () => {
    assert(clamp(0, 2, 4) === 2);
    assert(clamp(1, 2, 4) === 2);
    assert(clamp(2, 2, 4) === 2);
    assert(clamp(3, 2, 4) === 3);
    assert(clamp(4, 2, 4) === 4);
    assert(clamp(5, 2, 4) === 4);
    assert(clamp(6, 2, 4) === 4);
  });
});
