"use strict";

const assert = require("power-assert");
const AudioParam = require("../../src/impl/AudioParam");

function makeTests(context, expectedValues, sched1, sched2) {
  it("works", () => {
    const param = new AudioParam(context, { rate: "audio", defaultValue: 0 });

    sched1(param);

    for (let i = 0; i < 5; i++) {
      context.currentSampleFrame = i * 16;

      param.dspProcess();

      const expected = expectedValues.subarray(i * 16, (i + 1) * 16);
      const actual = param.getSampleAccurateValues();

      assert(param.hasSampleAccurateValues() === true);
      assert(deepCloseTo(actual, expected, 0.0625));
    }
  });

  it("works partially", () => {
    const param = new AudioParam(context, { rate: "audio", defaultValue: 0 });

    sched1(param);

    for (let i = 1; i < 5; i += 2) {
      context.currentSampleFrame = i * 16;

      param.dspProcess();

      const expected = expectedValues.subarray(i * 16, (i + 1) * 16);
      const actual = param.getSampleAccurateValues();

      assert(param.hasSampleAccurateValues() === true);
      assert(deepCloseTo(actual, expected, 0.0625));
    }
  });

  it("works with dynamic insertion", () => {
    const param = new AudioParam(context, { rate: "audio", defaultValue: 0 });

    sched1(param);

    for (let i = 0; i < 5; i++) {
      context.currentSampleFrame = i * 16;
      param.dspProcess();
    }
    sched2(param);

    context.currentSampleFrame = 5 * 16;
    param.dspProcess();

    const expected = expectedValues.subarray(5 * 16, (5 + 1) * 16);
    const actual = param.getSampleAccurateValues();

    assert(param.hasSampleAccurateValues() === true);
    assert(deepCloseTo(actual, expected, 0.0625));
  });
}

function toValues(str) {
  str = str.replace(/^\s*\|/gm, "").trimRight();

  const lines = str.split("\n");
  const length = lines.reduce((a, b) => Math.max(a, b.length), 0);
  const result = new Float32Array(length);

  lines.forEach((line, i) => {
    const value = 1 - (i / (lines.length - 1));

    findIndexes(line, "*").forEach((i) => {
      result[i] = value;
    });
  });

  return result;
}

function findIndexes(str, ch) {
  const result = [];

  for (let i = 0, imax = str.length; i < imax; i++) {
    if (str[i] === ch) {
      result.push(i);
    }
  }

  return result;
}

function closeTo(a, b ,delta) {
  return Math.abs(a - b) <= delta;
}

function deepCloseTo(a, b, delta) {
  assert(a.length === b.length);

  for (let i = 0, imax = a.length; i < imax; i++) {
    assert(closeTo(a[i], b[i], delta), `a[${i}]=${a[i]}, b[${i}]=${b[i]}`);
  }

  return true;
}

module.exports = { makeTests, toValues };
