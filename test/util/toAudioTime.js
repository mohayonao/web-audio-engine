"use strict";

const assert = require("power-assert");
const toAudioTime = require("../../src/util/toAudioTime");

describe("util.toAudioTime()", () => {
  it("return the provided value when provide positive number", () => {
    assert(toAudioTime(10) === 10);
  });

  it("return 0 when provide a negative number", () => {
    assert(toAudioTime(-1) === 0);
  });

  it("return 0 when provided infinite number", () => {
    assert(toAudioTime(Infinity) === 0);
  });

  it("convert to number when provided format of 'ss.SSS'", () => {
    assert(toAudioTime("23.456") === 23.456);
  });

  it("convert to number when provided format of 'mm:ss.SSS'", () => {
    assert(toAudioTime("01:23.456") === 83.456);
  });

  it("convert to number when provided format of 'hh:mm:ss.SSS'", () => {
    assert(toAudioTime("00:01:23.456") === 83.456);
  });

  it("return 0 when provided case", () => {
    assert(toAudioTime("UNKNOWN") === 0);
  });
});
