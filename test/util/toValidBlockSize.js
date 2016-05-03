"use strict";

const assert = require("power-assert");
const toValidBlockSize = require("../../src/util/toValidBlockSize");

describe("util.toValidBitDepth()", () => {
  it("return valid block size", () => {
    assert(toValidBlockSize(0) === 8);
    assert(toValidBlockSize(8) === 8);
    assert(toValidBlockSize(128) === 128);
    assert(toValidBlockSize(500) === 512);
    assert(toValidBlockSize(2000) === 1024);
  });
});
