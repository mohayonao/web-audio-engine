"use strict";

require("run-with-mocha");

const assert = require("power-assert");
const sinon = require("sinon");
const decoder = require("../src/decoder");
const decoderUtil = require("../src/util/decoderUtil");
const AudioBuffer = require("../src/api/AudioBuffer");

describe("decoder", () => {
  let defaultDecoder, decoderUtil$decode;

  before(() => {
    defaultDecoder = decoder.get();
    decoderUtil$decode = decoderUtil.decode;
    decoderUtil.decode = sinon.spy(decoderUtil.decode);
  });
  afterEach(() => {
    decoder.set(defaultDecoder);
    decoderUtil.decode.reset();
  });
  after(() => {
    decoderUtil.decode = decoderUtil$decode;
  });

  describe("set/get", () => {
    it("works", () => {
      const decodeFn = sinon.spy();

      decoder.set(decodeFn);

      assert(decoder.get() === decodeFn);
    });
  });

  describe(".decode(audioData: ArrayBuffer, opts?:object): Promise<AudioBuffer>", () => {
    it("works", () => {
      const channelData = [ new Float32Array(16), new Float32Array(16) ];
      const decodeFn = sinon.spy(() => {
        return Promise.resolve({ sampleRate: 44100, channelData: channelData });
      });
      const audioData = new Uint8Array(64).buffer;
      const opts = {};

      decoder.set(decodeFn);

      return decoder.decode(audioData, opts).then((audioBuffer) => {
        assert(decodeFn.callCount === 1);
        assert(decodeFn.calledWith(audioData, opts));
        assert(decoderUtil.decode.callCount === 1);
        assert(decoderUtil.decode.calledWith(decodeFn, audioData, opts));
        assert(audioBuffer instanceof AudioBuffer);
        assert(audioBuffer.numberOfChannels === 2);
        assert(audioBuffer.length === 16);
        assert(audioBuffer.sampleRate === 44100);
        assert(audioBuffer.getChannelData(0) === channelData[0]);
        assert(audioBuffer.getChannelData(1) === channelData[1]);
      });
    });
  });
});
