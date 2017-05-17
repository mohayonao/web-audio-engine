"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const decoder = require("../src/decoder");
const DecoderUtils = require("../src/utils/DecoderUtils");
const AudioBuffer = require("../src/api/AudioBuffer");

describe("decoder", () => {
  let defaultWavDecoder, DecoderUtils$decode;

  before(() => {
    defaultWavDecoder = decoder.get("wav");
    DecoderUtils$decode = DecoderUtils.decode;
    DecoderUtils.decode = sinon.spy(DecoderUtils.decode);
  });
  afterEach(() => {
    decoder.set("wav", defaultWavDecoder);
    DecoderUtils.decode.reset();
  });
  after(() => {
    DecoderUtils.decode = DecoderUtils$decode;
  });

  it(".get(type: string): function", () => {
    const decodeFn1 = decoder.get("wav");
    const decodeFn2 = decoder.get("unknown");

    assert(typeof decodeFn1 === "function");
    assert(typeof decodeFn2 !== "function");
  });

  it(".set(type: string, fn: function)", () => {
    const decodeFn1 = sinon.spy();

    decoder.set("spy", decodeFn1);

    assert(decoder.get("spy") === decodeFn1);
  });

  it(".decode(audioData: ArrayBuffer, opts?:object): Promise<AudioBuffer>", () => {
    const channelData = [ new Float32Array(16), new Float32Array(16) ];
    const decodeFn = sinon.spy(() => {
      return Promise.resolve({ sampleRate: 44100, channelData: channelData });
    });
    const audioData = new Uint32Array([
      0x46464952, 0x0000002c, 0x45564157, 0x20746d66,
      0x00000010, 0x00020001, 0x0000ac44, 0x0002b110,
      0x00100004, 0x61746164, 0x00000008, 0x8000c000, 0x3fff7fff
    ]).buffer;
    const opts = {};

    decoder.set("wav", decodeFn);

    return decoder.decode(audioData, opts).then((audioBuffer) => {
      assert(decodeFn.callCount === 1);
      assert(decodeFn.calledWith(audioData, opts));
      assert(DecoderUtils.decode.callCount === 1);
      assert(DecoderUtils.decode.calledWith(decodeFn, audioData, opts));
      assert(audioBuffer instanceof AudioBuffer);
      assert(audioBuffer.numberOfChannels === 2);
      assert(audioBuffer.length === 16);
      assert(audioBuffer.sampleRate === 44100);
      assert(audioBuffer.getChannelData(0) === channelData[0]);
      assert(audioBuffer.getChannelData(1) === channelData[1]);
    });
  });

  it(".decode(audioData: ArrayBuffer, opts?:object): Promise<AudioBuffer> - not supported", () => {
    const audioData = new Uint8Array(16).buffer;

    return decoder.decode(audioData).catch((err) => {
      assert(err instanceof TypeError);
    });
  });
});
