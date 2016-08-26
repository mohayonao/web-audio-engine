"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../src/impl/AudioContext");
const PeriodicWave = require("../../src/impl/PeriodicWave");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
const real = new Float32Array([ 0, 0 ]);
const imag = new Float32Array([ 0, 1 ]);

describe("impl/PeriodicWave", () => {
  it("constructor", () => {
    const node = new PeriodicWave(context, { real, imag });

    assert(node instanceof PeriodicWave);
  });

  describe("attributes", () => {
    it(".constraints", () => {
      const node = new PeriodicWave(context, { real, imag });

      assert(node.getConstraints() === false);
    });

    it(".real", () => {
      const node = new PeriodicWave(context, { real, imag });

      assert(node.getReal() === real);
    });

    it(".imag", () => {
      const node = new PeriodicWave(context, { real, imag });

      assert(node.getImag() === imag);
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
    ].forEach(({ type, expected }) => {
      it(type, () => {
        periodicWave.generateBasicWaveform(type);
        assert(periodicWave.getName() === expected);
      });
    });
  });
});
