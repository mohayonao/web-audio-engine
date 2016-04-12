"use strict";

const assert = require("power-assert");
const sinon = require("sinon");
const decodeAudioDataAPI = require("../../src/util/decodeAudioDataAPI");

describe("util/decodeAudioDataAPI", () => {
  let saved;

  before(() => {
    saved = decodeAudioDataAPI.getDecodeAudioData();
  });
  afterEach(() => {
    decodeAudioDataAPI.setDecodeAudioData(saved);
  });

  describe("getDecodeAudioData()", () => {
    it("should return a function", () => {
      assert(typeof decodeAudioDataAPI.getDecodeAudioData() === "function");
    });
  });

  describe("setDecodeAudioData(fn: function)", () => {
    it("should set the provided function", () => {
      const fn = sinon.spy();

      decodeAudioDataAPI.setDecodeAudioData(fn);

      assert(decodeAudioDataAPI.getDecodeAudioData() === fn);
    });
  });

  describe("decodeAudioData(audioData: arrayBuffer, sampleRate: number): Promise<AudioData>", () => {
    it("should return promise and resolve", () => {
      const source = new Uint8Array(128);
      const sampleRate = 44100;
      const channelData = [ new Float32Array(128), new Float32Array(128) ];
      const fn = sinon.spy(() => {
        return Promise.resolve({ sampleRate, channelData });
      });

      decodeAudioDataAPI.setDecodeAudioData(fn);

      return decodeAudioDataAPI.decodeAudioData(source, 44100).then((audioData) => {
        assert(fn.callCount === 1);
        assert(fn.calledWith(source));
        assert(audioData.sampleRate === 44100);
        assert(audioData.channelData === channelData);
      });
    });

    it("should reject if provided invalid data", () => {
      const source = new Uint8Array(128);
      const fn = sinon.spy(() => {
        return Promise.reject("ERROR!");
      });

      decodeAudioDataAPI.setDecodeAudioData(fn);

      return decodeAudioDataAPI.decodeAudioData(source, 44100).then(() => {
        throw new TypeError("NOT REACHED");
      }, (e) => {
        assert(fn.callCount === 1);
        assert(fn.calledWith(source));
        assert(e === "ERROR!");
      });
    });

    it("should reject if invalid return", () => {
      const source = new Uint8Array(128);
      const fn = sinon.spy(() => {
        return Promise.resolve(null);
      });

      decodeAudioDataAPI.setDecodeAudioData(fn);

      return decodeAudioDataAPI.decodeAudioData(source, 44100).then(() => {
        throw new TypeError("NOT REACHED");
      }, (e) => {
        assert(fn.callCount === 1);
        assert(fn.calledWith(source));
        assert(e instanceof TypeError);
      });
    });
  });
});
