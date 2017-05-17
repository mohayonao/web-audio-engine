"use strict";

require("run-with-mocha");

const assert = require("assert");
const toValidNumberOfChannels = require("../../../src/utils/utils/toValidNumberOfChannels");

describe("utils/toValidNumberOfChannels()", () => {
  it("return valid number of channels", () => {
    assert(toValidNumberOfChannels(0) === 1);
    assert(toValidNumberOfChannels(2) === 2);
    assert(toValidNumberOfChannels(8) === 8);
    assert(toValidNumberOfChannels(2000) === 32);
  });
});
