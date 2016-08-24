"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const api = require("../../src/api");
const AudioContext = require("../../src/api/AudioContext");

describe("api/ConvolverNode", () => {
  it("context.createConvolver()", () => {
    const context = new AudioContext();
    const target = context.createConvolver();

    assert(target instanceof api.ConvolverNode);
  });

  describe("attributes", () => {
    it(".buffer=", () => {
      const context = new AudioContext();
      const target = context.createConvolver();
      const buffer = context.createBuffer(1, 16, 8000);

      target._impl.setBuffer = sinon.spy();

      target.buffer = buffer;
      assert(target.buffer === buffer);
      assert(target._impl.setBuffer.callCount === 1);
      assert(target._impl.setBuffer.args[0][0] === buffer);
    });

    it(".normalize=", () => {
      const context = new AudioContext();
      const target = context.createConvolver();
      const normalize1 = true;
      const normalize2 = false;

      target._impl.getNormalize = sinon.spy(() => normalize1);
      target._impl.setNormalize = sinon.spy();

      assert(target.normalize === normalize1);
      assert(target._impl.getNormalize.callCount === 1);

      target.normalize = normalize2;
      assert(target._impl.setNormalize.callCount === 1);
      assert(target._impl.setNormalize.args[0][0] === normalize2);
    });
  });
});
