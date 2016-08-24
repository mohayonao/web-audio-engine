"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const api = require("../../src/api");
const AudioContext = require("../../src/api/AudioContext");

describe("api/IIRFilterNode", () => {
  it("context.createIIRFilter(feedforward, feedback)", () => {
    const context = new AudioContext();
    const feedforward = new Float32Array(4);
    const feedback = new Float32Array(4);
    const target = context.createIIRFilter(feedforward, feedback);

    assert(target instanceof api.IIRFilterNode);
  });

  describe("methods", () => {
    it(".getFrequencyResponse(frequencyHz, magResponse, phaseResponse)", () => {
      const context = new AudioContext();
      const feedforward = new Float32Array(4);
      const feedback = new Float32Array(4);
      const target = context.createIIRFilter(feedforward, feedback);
      const frequencyHz = new Float32Array(128);
      const magResponse = new Float32Array(128);
      const phaseResponse = new Float32Array(128);

      target._impl.getFrequencyResponse = sinon.spy();

      target.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);
      assert(target._impl.getFrequencyResponse.callCount === 1);
      assert(target._impl.getFrequencyResponse.args[0][0] === frequencyHz);
      assert(target._impl.getFrequencyResponse.args[0][1] === magResponse);
      assert(target._impl.getFrequencyResponse.args[0][2] === phaseResponse);
    });
  });
});
