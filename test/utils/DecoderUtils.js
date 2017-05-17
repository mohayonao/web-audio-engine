"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const DecoderUtils = require("../../src/utils/DecoderUtils");

describe("utils/DecoderUtils.decode(decodeFn: function, audioData: arrayBuffer, opts?: object): Promise<AudioData>", () => {
  it("should return promise and resolve - without resampling", () => {
    const source = new Uint8Array(128);
    const sampleRate = 44100;
    const channelData = [ new Float32Array(128), new Float32Array(128) ];
    const decodeFn = sinon.spy(() => {
      return Promise.resolve({ sampleRate, channelData });
    });

    return DecoderUtils.decode(decodeFn, source).then((audioData) => {
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

    return DecoderUtils.decode(decodeFn, source, { sampleRate: 22050 }).then((audioData) => {
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

    return DecoderUtils.decode(decodeFn, source, { sampleRate: 44100 }).then(() => {
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

    return DecoderUtils.decode(decodeFn, source, { sampleRate: 44100 }).then(() => {
      throw new TypeError("NOT REACHED");
    }, (e) => {
      assert(decodeFn.callCount === 1);
      assert(decodeFn.calledWith(source));
      assert(e instanceof TypeError);
    });
  });
});

describe("utils/DecoderUtils.resample(audioData: AudioData, sampleRate: number): AudioData", () => {
  it("works", () => {
    const source = {
      sampleRate: 8000,
      channelData: [ new Float32Array(128) ]
    };
    const resampled = DecoderUtils.resample(source, 16000);

    assert(resampled.numberOfChannels === 1);
    assert(resampled.length === 256);
    assert(resampled.sampleRate === 16000);
    assert(resampled.channelData.length === resampled.numberOfChannels);
    assert(resampled.channelData[0].length === resampled.length);
  });

  it("nothing to do", () => {
    const source = {
      sampleRate: 8000,
      channelData: [ new Float32Array(128) ]
    };
    const resampled = DecoderUtils.resample(source, 8000);

    assert(resampled === source);
  });
});
