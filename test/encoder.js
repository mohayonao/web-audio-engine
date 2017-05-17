"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const encoder = require("../src/encoder");
const EncoderUtils = require("../src/utils/EncoderUtils");

describe("encoder", () => {
  let defaultWavEncoder, EncoderUtils$encode;

  before(() => {
    defaultWavEncoder = encoder.get("wav");
    EncoderUtils$encode = EncoderUtils.encode;
    EncoderUtils.encode = sinon.spy(EncoderUtils.encode);
  });
  afterEach(() => {
    encoder.set("wav", defaultWavEncoder);
    EncoderUtils.encode.reset();
  });
  after(() => {
    EncoderUtils.encode = EncoderUtils$encode;
  });

  it(".get(type: string): function", () => {
    const encodeFn1 = encoder.get("wav");
    const encodeFn2 = encoder.get("unknown");

    assert(typeof encodeFn1 === "function");
    assert(typeof encodeFn2 !== "function");
  });


  it(".set(type: string, fn: function)", () => {
    const encodeFn1 = sinon.spy();

    encoder.set("spy", encodeFn1);

    assert(encoder.get("spy") === encodeFn1);
  });

  it(".encode(audioData: object, opts?: object): Promise<ArrayBuffer>", () => {
    const channelData = [ new Float32Array(16), new Float32Array(16) ];
    const audioData = { sampleRate: 44100, channelData: channelData };
    const encodeFn = sinon.spy(() => {
      return Promise.resolve(new Uint8Array(64).buffer);
    });
    const opts = {};

    encoder.set("wav", encodeFn);

    return encoder.encode(audioData, opts).then((arrayBuffer) => {
      assert(encodeFn.callCount === 1);
      assert(encodeFn.calledWith(audioData, opts));
      assert(EncoderUtils.encode.callCount === 1);
      assert(EncoderUtils.encode.calledWith(encodeFn, audioData, opts));
      assert(arrayBuffer instanceof ArrayBuffer);
    });
  });

  it(".encode(audioData: object, opts?: object): Promise<ArrayBuffer> - failed", () => {
    const channelData = [ new Float32Array(16), new Float32Array(16) ];
    const audioData = { sampleRate: 44100, channelData: channelData };
    const opts = { type: "mid" };

    return encoder.encode(audioData, opts).catch((err) => {
      assert(err instanceof TypeError);
    });
  });
});
