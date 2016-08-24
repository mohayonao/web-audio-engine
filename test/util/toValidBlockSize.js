"use strict";

require("run-with-mocha");

const assert = require("assert");
const toValidBlockSize = require("../../src/util/toValidBlockSize");

describe("util/toValidBlockSize()", () => {
  it("return valid block size", () => {
    assert(toValidBlockSize(0) === 8);
    assert(toValidBlockSize(8) === 8);
    assert(toValidBlockSize(128) === 128);
    assert(toValidBlockSize(500) === 512);
    assert(toValidBlockSize(2000) === 1024);
  });
});
