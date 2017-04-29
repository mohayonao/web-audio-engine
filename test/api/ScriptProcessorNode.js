"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const api = require("../../src/api");
const AudioContext = require("../../src/api/BaseAudioContext");

describe("api/ScriptProcessorNode", () => {
  it("context.createScriptProcessor(bufferSize, numberOfInputChannels, numberOfOutputChannels)", () => {
    const context = new AudioContext();
    const target = context.createScriptProcessor(256, 1, 1);

    assert(target instanceof api.ScriptProcessorNode);
  });

  describe("attributes", () => {
    it(".bufferSize", () => {
      const context = new AudioContext();
      const target = context.createScriptProcessor(256, 1, 1);
      const bufferSize = 256;

      target._impl.getBufferSize = sinon.spy(() => bufferSize);

      assert(target.bufferSize === bufferSize);
      assert(target._impl.getBufferSize.callCount === 1);
    });

    it(".onaudioprocess=", () => {
      const context = new AudioContext();
      const target = context.createScriptProcessor(256, 1, 1);
      const callback1 = sinon.spy();
      const callback2 = sinon.spy();
      const callback3 = sinon.spy();
      const event = { type: "audioprocess" };

      target.onaudioprocess = callback1;
      target.onaudioprocess = callback2;
      target.addEventListener("audioprocess", callback3);
      target._impl.dispatchEvent(event);

      assert(target.onaudioprocess === callback2);
      assert(callback1.callCount === 0);
      assert(callback2.callCount === 1);
      assert(callback3.callCount === 1);
      assert(callback2.args[0][0] === event);
      assert(callback3.args[0][0] === event);
    });
  });
});
