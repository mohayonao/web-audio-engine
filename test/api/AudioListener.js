"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const api = require("../../src/api");
const AudioContext = require("../../src/api/BaseAudioContext");

describe("api/AudioListener", () => {
  it("context.listener", () => {
    const context = new AudioContext();
    const target = context.listener;

    assert(target instanceof api.AudioListener);
  });

  describe("methods", () => {
    it(".setPosition(x, y, z)", () => {
      const context = new AudioContext();
      const target = context.listener;
      const x = 0;
      const y = 1;
      const z = 2;

      target._impl.setPosition = sinon.spy();

      target.setPosition(x, y, z);
      assert(target._impl.setPosition.callCount === 1);
      assert(target._impl.setPosition.args[0][0] === x);
      assert(target._impl.setPosition.args[0][1] === y);
      assert(target._impl.setPosition.args[0][2] === z);
    });

    it(".setOrientation(x, y, z, xUp, yUp, zUp)", () => {
      const context = new AudioContext();
      const target = context.listener;
      const x = 0;
      const y = 1;
      const z = 2;
      const xUp = 3;
      const yUp = 4;
      const zUp = 5;

      target._impl.setOrientation = sinon.spy();

      target.setOrientation(x, y, z, xUp, yUp, zUp);
      assert(target._impl.setOrientation.callCount === 1);
      assert(target._impl.setOrientation.args[0][0] === x);
      assert(target._impl.setOrientation.args[0][1] === y);
      assert(target._impl.setOrientation.args[0][2] === z);
      assert(target._impl.setOrientation.args[0][3] === xUp);
      assert(target._impl.setOrientation.args[0][4] === yUp);
      assert(target._impl.setOrientation.args[0][5] === zUp);
    });
  });
});
