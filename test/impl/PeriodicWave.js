"use strict";

require("run-with-mocha");

const assert = require("power-assert");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const PeriodicWave = require("../../src/impl/PeriodicWave");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
const real = new Float32Array([ 0, 0 ]);
const imag = new Float32Array([ 0, 1 ]);
const testSpec = {};

testSpec.constraints = {
  testCase: [ { expected: false } ]
};

testSpec.real = {
  testCase: [ { expected: real } ]
};

testSpec.imag = {
  testCase: [ { expected: imag } ]
};

describe("PeriodicWave", () => {
  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: PeriodicWave,
      create: context => new PeriodicWave(context, { real, imag }),
      testSpec
    });
  });

  describe("generate basic waveform", () => {
    const periodicWave = new PeriodicWave(context, { real: [ 0, 0 ], imag: [ 0, 1 ] });

    [
      { type: "sine", expected: "sine" },
      { type: "sawtooth", expected: "sawtooth" },
      { type: "triangle", expected: "triangle" },
      { type: "square", expected: "square" },
      { type: "unknown", expected: "custom" }
    ].forEach((opts) => {
      let type = opts.type;
      let expected = opts.expected;

      it(type, () => {
        periodicWave.generateBasicWaveform(type);
        assert(periodicWave.getName() === expected);
      });
    });
  });
});
