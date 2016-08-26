"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const AudioContext = require("../../src/api/AudioContext");

describe("api/EventTarget", () => {
  describe("methods", () => {
    it(".addEventListener(type, listener)", () => {
      const context = new AudioContext();
      const target = context.createOscillator();
      const type = "ended";
      const listener = () => {};

      target._impl.addEventListener = sinon.spy();

      target.addEventListener(type, listener);
      assert(target._impl.addEventListener.callCount === 1);
      assert(target._impl.addEventListener.args[0][0] === type);
      assert(target._impl.addEventListener.args[0][1] === listener);
    });

    it(".removeEventListener()", () => {
      const context = new AudioContext();
      const target = context.createOscillator();
      const type = "ended";
      const listener = sinon.spy();

      target._impl.removeEventListener = sinon.spy();

      target.removeEventListener(type, listener);
      assert(target._impl.removeEventListener.callCount === 1);
      assert(target._impl.removeEventListener.args[0][0] === type);
      assert(target._impl.removeEventListener.args[0][1] === listener);
    });
  });
});
