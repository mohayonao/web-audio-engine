"use strict";

const assert = require("power-assert");
const sinon = require("sinon");
const encodeAudioDataAPI = require("../../src/_util/encodeAudioDataAPI");

describe("_util/encodeAudioDataAPI", () => {
  let saved;

  before(() => {
    saved = encodeAudioDataAPI.getEncodeAudioData();
  });
  afterEach(() => {
    encodeAudioDataAPI.setEncodeAudioData(saved);
  });

  describe("getEncodeAudioData()", () => {
    it("should return a function", () => {
      assert(typeof encodeAudioDataAPI.getEncodeAudioData() === "function");
    });
  });

  describe("setEncodeAudioData(fn: function)", () => {
    it("should set the provided function", () => {
      const fn = sinon.spy();

      encodeAudioDataAPI.setEncodeAudioData(fn);

      assert(encodeAudioDataAPI.getEncodeAudioData() === fn);
    });
  });

  describe("encodeAudioData(audioData: AudioData, opts?: object): Promise<ArrayBuffer>", () => {
    it("should return promise and resolve", () => {
      const source = new Uint8Array(128);
      const sampleRate = 44100;
      const channelData = [ new Float32Array(128), new Float32Array(128) ];
      const audioData = { sampleRate, channelData };
      const fn = sinon.spy(() => {
        return Promise.resolve(source.buffer);
      });

      encodeAudioDataAPI.setEncodeAudioData(fn);

      return encodeAudioDataAPI.encodeAudioData(audioData).then((arrayBuffer) => {
        assert(fn.callCount === 1);
        assert(fn.calledWith(audioData));
        assert(arrayBuffer instanceof ArrayBuffer);
      });
    });

    it("should reject if provided invalid data", () => {
      return encodeAudioDataAPI.encodeAudioData(null).then(() => {
        throw new TypeError("NOT REACHED");
      }, (e) => {
        assert(e instanceof TypeError);
      });
    });
  });
});
