"use strict";

require("run-with-mocha");

const assert = require("power-assert");
const sinon = require("sinon");
const encoder = require("../src/encoder");
const encoderUtil = require("../src/util/encoderUtil");

describe("encoder", () => {
  let defaultEncoder, encoderUtil$encode;

  before(() => {
    defaultEncoder = encoder.get();
    encoderUtil$encode = encoderUtil.encode;
    encoderUtil.encode = sinon.spy(encoderUtil.encode);
  });
  afterEach(() => {
    encoder.set(defaultEncoder);
    encoderUtil.encode.reset();
  });
  after(() => {
    encoderUtil.encode = encoderUtil$encode;
  });

  describe("set/get", () => {
    it("works", () => {
      const encodeFn = sinon.spy();

      encoder.set(encodeFn);

      assert(encoder.get() === encodeFn);
    });
  });

  describe(".encode(audioData: object, opts?: object): Promise<ArrayBuffer>", () => {
    it("works", () => {
      const channelData = [ new Float32Array(16), new Float32Array(16) ];
      const audioData = { sampleRate: 44100, channelData: channelData };
      const encodeFn = sinon.spy(() => {
        return Promise.resolve(new Uint8Array(64).buffer);
      });
      const opts = {};

      encoder.set(encodeFn);

      return encoder.encode(audioData, opts).then((arrayBuffer) => {
        assert(encodeFn.callCount === 1);
        assert(encodeFn.calledWith(audioData, opts));
        assert(encoderUtil.encode.callCount === 1);
        assert(encoderUtil.encode.calledWith(encodeFn, audioData, opts));
        assert(arrayBuffer instanceof ArrayBuffer);
      });
    });
  });
});
