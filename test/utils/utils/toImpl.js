"use strict";

require("run-with-mocha");

const assert = require("assert");
const toImpl = require("../../../src/utils/utils/toImpl");

describe("utils/toImpl(value)", () => {
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
