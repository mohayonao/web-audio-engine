"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const encoderUtil = require("../../src/util/encoderUtil");

describe("util/encoderUtil.encode(encodeFn: function, audioData: AudioData, opts?: object): Promise<ArrayBuffer>", () => {
  it("should return promise and resolve - from AudioData", () => {
    const source = new Uint8Array(128);
    const sampleRate = 44100;
    const channelData = [ new Float32Array(128), new Float32Array(128) ];
    const audioData = { sampleRate, channelData };
    const opts = {};
    const encodeFn = sinon.spy(() => {
      return Promise.resolve(source.buffer);
    });

    return encoderUtil.encode(encodeFn, audioData, opts).then((arrayBuffer) => {
      assert(encodeFn.callCount === 1);
      assert(encodeFn.calledWith(audioData, opts));
      assert(arrayBuffer instanceof ArrayBuffer);
    });
  });

  it("should return peomise and resolve - from AudioBuffer", () => {
    const source = new Uint8Array(128);
    const numberOfChannels = 2;
    const sampleRate = 44100;
    const channelData = [ new Float32Array(128), new Float32Array(128) ];
    const audioData = { numberOfChannels, sampleRate, getChannelData(ch) { return channelData[ch]; } };
    const opts = {};
    const encodeFn = sinon.spy(() => {
      return Promise.resolve(source.buffer);
    });

    return encoderUtil.encode(encodeFn, audioData, opts).then((arrayBuffer) => {
      assert(encodeFn.callCount === 1);

      const _audioData = encodeFn.args[0][0];

      assert(_audioData.numberOfChannels === numberOfChannels);
      assert(_audioData.length === 128);
      assert(_audioData.sampleRate === 44100);
      assert(_audioData.channelData[0] === channelData[0]);
      assert(_audioData.channelData[1] === channelData[1]);

      assert(arrayBuffer instanceof ArrayBuffer);
    });
  });
});
