"use strict";

require("run-with-mocha");

const assert = require("power-assert");
const defaults = require("../../src/util/defaults");

let undef;

describe("util.defaults(value, defaultValue)", () => {
  it("return value", () => {
    assert(defaults(0, 1) === 0);
    assert(defaults(null, 1) === null);
    assert(defaults(undef, 1) === 1);
  });
});
