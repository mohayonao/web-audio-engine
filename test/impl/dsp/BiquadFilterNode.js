"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../../src/impl/AudioContext");
const BiquadFilterNode = require("../../../src/impl/BiquadFilterNode");

function closeTo(a, b, delta) {
  return Math.abs(a - b) <= delta;
}

describe("impl/dsp/BiquadFilterNode", () => {
  describe("getFrequencyResponse(frequencyHz, magResponse, phaseResponse)", () => {
    it("lowpass", () => {
      const context = new AudioContext({ sampleRate: 44100, blockSize: 16 });
      const node = new BiquadFilterNode(context);
      const frequencyHz = new Float32Array([ 1000, 2000, 3000 ]);
      const magResponse = new Float32Array(3);
      const phaseResponse = new Float32Array(3);

      node.setType("lowpass");
      node.getFrequency().setValue(2000);
      node.getQ().setValue(12);
      node.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);

      // computed using Chrome 54
      // a=a||new AudioContext(); b=a.createBiquadFilter(); b.type="lowpass"; b.frequency.value=2000; b.Q.value=12; c=new Float32Array([ 1000, 2000, 3000 ]); d=new Float32Array(3); e=new Float32Array(3); b.getFrequencyResponse(c, d, e); console.log(d); console.log(e);
      const magExpected = new Float32Array([ 1.3108856678009033, 3.9810714721679688, 0.7441331148147583 ]);
      const phaseExpected = new Float32Array([ -0.16454292833805084, -1.5707966089248657, -2.8548853397369385 ]);

      assert(magResponse.every((mag, i) => closeTo(mag, magExpected[i], 1e-6)))
      assert(phaseResponse.every((phase, i) => closeTo(phase, phaseExpected[i], 1e-6)))
    });

    it("highpass", () => {
      const context = new AudioContext({ sampleRate: 44100, blockSize: 16 });
      const node = new BiquadFilterNode(context);
      const frequencyHz = new Float32Array([ 1000, 2000, 3000 ]);
      const magResponse = new Float32Array(3);
      const phaseResponse = new Float32Array(3);

      node.setType("highpass");
      node.getFrequency().setValue(2000);
      node.getQ().setValue(12);
      node.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);

      // computed using Chrome 54
      // a=a||new AudioContext(); b=a.createBiquadFilter(); b.type="highpass"; b.frequency.value=2000; b.Q.value=12; c=new Float32Array([ 1000, 2000, 3000 ]); d=new Float32Array(3); e=new Float32Array(3); b.getFrequencyResponse(c, d, e); console.log(d); console.log(e);
      const magExpected = new Float32Array([ 0.3243924081325531, 3.981071949005127, 1.7033133506774902 ]);
      const phaseExpected = new Float32Array([ 2.9770498275756836, 1.570796012878418, 0.28670740127563477 ]);

      assert(magResponse.every((mag, i) => closeTo(mag, magExpected[i], 1e-6)))
      assert(phaseResponse.every((phase, i) => closeTo(phase, phaseExpected[i], 1e-6)))
    });
  });
});
