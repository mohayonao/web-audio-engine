"use strict";

const assert = require("power-assert");
const toImpl = require("../../src/util/toImpl");

describe("util.toImpl(value)", () => {
  it("convert to impl", () => {
    const impl = {};
    const value = { _impl: impl };
    const actual = toImpl(value);
    const expected = impl;

    assert(actual === expected);
  });
  it("nothing to do", () => {
    const impl = {};
    const actual = toImpl(impl);
    const expected = impl;

    assert(actual === expected);
  });
});
