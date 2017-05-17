"use strict";

require("run-with-mocha");

const assert = require("assert");
const defaults = require("../../../src/utils/utils/defaults");

describe("utils/defaults(value, defaultValue)", () => {
  it("works", () => {
    assert(defaults(0, 1) === 0);
    assert(defaults(null, 1) === null);
    assert(defaults(undefined, 1) === 1);
  });
});
