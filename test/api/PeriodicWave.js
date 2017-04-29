"use strict";

require("run-with-mocha");

const assert = require("assert");
const api = require("../../src/api");
const AudioContext = require("../../src/api/BaseAudioContext");

describe("api/PeriodicWave", () => {
  it("context.createPeriodicWave(real, imag)", () => {
    const context = new AudioContext();
    const real = new Float32Array(16);
    const imag = new Float32Array(16);
    const target = context.createPeriodicWave(real, imag);

    assert(target instanceof api.PeriodicWave);
  });
});
