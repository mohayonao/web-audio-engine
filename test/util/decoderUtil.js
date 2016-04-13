"use strict";

const assert = require("power-assert");
const sinon = require("sinon");
const decoderUtil = require("../../src/util/decoderUtil");

describe("util/decoderUtil", () => {
  describe("decode(decodeFn: function, audioData: arrayBuffer, opts?: object): Promise<AudioData>", () => {
    it("should return promise and resolve", () => {
      const source = new Uint8Array(128);
      const sampleRate = 44100;
      const channelData = [ new Float32Array(128), new Float32Array(128) ];
      const decodeFn = sinon.spy(() => {
        return Promise.resolve({ sampleRate, channelData });
      });

      return decoderUtil.decode(decodeFn, source, { sampleRate: 44100 }).then((audioData) => {
        assert(decodeFn.callCount === 1);
        assert(decodeFn.calledWith(source));
        assert(audioData.sampleRate === 44100);
        assert(audioData.channelData === channelData);
      });
    });

    it("should return promise and resolve - resampling", () => {
      const source = new Uint8Array(128);
      const sampleRate = 44100;
      const channelData = [ new Float32Array(128), new Float32Array(128) ];
      const decodeFn = sinon.spy(() => {
        return Promise.resolve({ sampleRate, channelData });
      });

      return decoderUtil.decode(decodeFn, source, { sampleRate: 22050 }).then((audioData) => {
        assert(decodeFn.callCount === 1);
        assert(decodeFn.calledWith(source));
        assert(audioData.sampleRate === 22050);
        assert(audioData.length === channelData[0].length / 2);
      });
    });

    it("should reject if provided invalid data", () => {
      const source = new Uint8Array(128);
      const decodeFn = sinon.spy(() => {
        return Promise.reject("ERROR!");
      });

      return decoderUtil.decode(decodeFn, source, { sampleRate: 44100 }).then(() => {
        throw new TypeError("NOT REACHED");
      }, (e) => {
        assert(decodeFn.callCount === 1);
        assert(decodeFn.calledWith(source));
        assert(e === "ERROR!");
      });
    });

    it("should reject if invalid return", () => {
      const source = new Uint8Array(128);
      const decodeFn = sinon.spy(() => {
        return Promise.resolve(null);
      });

      return decoderUtil.decode(decodeFn, source, { sampleRate: 44100 }).then(() => {
        throw new TypeError("NOT REACHED");
      }, (e) => {
        assert(decodeFn.callCount === 1);
        assert(decodeFn.calledWith(source));
        assert(e instanceof TypeError);
      });
    });
  });
});
