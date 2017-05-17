"use strict";

require("run-with-mocha");

const assert = require("assert");
const normalize = require("../../../src/utils/utils/normalize");

describe("utils/normalize(val, min, max)", () => {
  it("normalize a value to something between 0 - 1", () => {
    assert(normalize(0, -100, 100) === 0.5);
    assert(normalize(-100, -100, 100) === 0);
    assert(normalize(-200, -100, 100) === 0);
    assert(normalize(100, -100, 100) === 1);
    assert(normalize(200, -100, 100) === 1);
    assert(normalize(50, -100, 100) === 0.75);
  });
});
