"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const AudioContext = require("../../src/api/AudioContext");
const AudioDestinationNode = require("../../src/api/AudioDestinationNode");
const AudioListener = require("../../src/api/AudioListener");
const AudioBuffer = require("../../src/api/AudioBuffer");

describe("api/AudioContext", () => {
  describe("attributes", () => {
    it(".destination", () => {
      const target = new AudioContext();

      assert(target.destination instanceof AudioDestinationNode);
      assert(target.destination === target._impl.$destination);
    });

    it(".sampleRate", () => {
      const target = new AudioContext();
      const sampleRate = 44100;

      target._impl.getSampleRate = sinon.spy(() => sampleRate);

      assert(target.sampleRate === sampleRate);
      assert(target._impl.getSampleRate.callCount === 1);
    });

    it(".currentTime", () => {
      const target = new AudioContext();
      const currentTime = 0;

      target._impl.getCurrentTime = sinon.spy(() => currentTime);

      assert(target.currentTime === currentTime);
      assert(target._impl.getCurrentTime.callCount === 1);
    });

    it(".listener", () => {
      const target = new AudioContext();

      assert(target.listener instanceof AudioListener);
      assert(target.listener === target._impl.$listener);
    });

    it(".state", () => {
      const target = new AudioContext();
      const state = "suspended";

      target._impl.getState = sinon.spy(() => state);

      assert(target.state === state);
      assert(target._impl.getState.callCount === 1);
    });

    it(".onstatechange=", () => {
      const target = new AudioContext();
      const callback1 = sinon.spy();
      const callback2 = sinon.spy();
      const callback3 = sinon.spy();
      const event = { type: "statechange" };

      target.onstatechange = callback1;
      target.onstatechange = callback2;
      target.addEventListener("statechange", callback3);
      target._impl.dispatchEvent(event);

      assert(target.onstatechange === callback2);
      assert(callback1.callCount === 0);
      assert(callback2.callCount === 1);
      assert(callback3.callCount === 1);
      assert(callback2.args[0][0] === event);
      assert(callback3.args[0][0] === event);
    });
  });

  describe("methods", () => {
    it(".suspend()", () => {
      const target = new AudioContext();

      target._impl.suspend = sinon.spy();

      target.suspend();
      assert(target._impl.suspend.callCount === 1);
    });

    it(".resume()", () => {
      const target = new AudioContext();

      target._impl.resume = sinon.spy();

      target.resume();
      assert(target._impl.resume.callCount === 1);
    });

    it(".close()", () => {
      const target = new AudioContext();

      target._impl.close = sinon.spy();

      target.close();
      assert(target._impl.close.callCount === 1);
    });

    it(".decodeAudioData(audioData)", () => {
      const target = new AudioContext({ sampleRate: 44100 });
      const audioData = new Uint32Array([
        0x46464952, 0x0000002c, 0x45564157, 0x20746d66,
        0x00000010, 0x00020001, 0x0000ac44, 0x0002b110,
        0x00100004, 0x61746164, 0x00000008, 0x8000c000, 0x3fff7fff
      ]).buffer;

      return target.decodeAudioData(audioData).then((audioBuffer) => {
        assert(audioBuffer instanceof AudioBuffer);
      });
    });

    it(".decodeAudioData(audioData, successCallback)", () => {
      const target = new AudioContext({ sampleRate: 44100 });
      const audioData = new Uint32Array([
        0x46464952, 0x0000002c, 0x45564157, 0x20746d66,
        0x00000010, 0x00020001, 0x0000ac44, 0x0002b110,
        0x00100004, 0x61746164, 0x00000008, 0x8000c000, 0x3fff7fff
      ]).buffer;

     return new Promise((resolve) => {
       target.decodeAudioData(audioData, (audioBuffer) => {
         assert(audioBuffer instanceof AudioBuffer);
         resolve();
       });
     });
    });
  });
});
