"use strict";

require("run-with-mocha");

const assert = require("power-assert");
const deepEqual = require("deep-equal");
const audioDataUtil = require("../../src/util/audioDataUtil");
const APIAudioBuffer = require("../../src/api/AudioBuffer");
const IMPLAudioBuffer = require("../../src/impl/AudioBuffer");

describe("util.audioDataUtil", () => {
  describe("isAudioData()", () => {
    it("true when .sampleRate is number and .channelData is Float32Array[]", () => {
      const data = { sampleRate: 8000, channelData: [ new Float32Array(16) ] };

      assert(audioDataUtil.isAudioData(data));
    });

    it("false when falsy value", () => {
      assert(audioDataUtil.isAudioData(null) === false);
    });

    it("false when .sampleRate is not finte number", () => {
      const data = { sampleRate: "8000", channelData: [ new Float32Array(16) ] };

      assert(audioDataUtil.isAudioData(data) === false);
    });

    it("false when .channelData is not Array", () => {
      const data = { sampleRate: 8000, channelData: {} };

      assert(audioDataUtil.isAudioData(data) === false);
    });

    it("false when .channelData is not Float32Array[]", () => {
      const data = { sampleRate: 8000, channelData: [ new Uint8Array(16) ] };

      assert(audioDataUtil.isAudioData(data) === false);
    });
  });

  describe("toAudioData()", () => {
    it("convert to full audioData from audioData", () => {
      const data = { sampleRate: 8000, channelData: [ new Float32Array(16) ] };
      const actual = audioDataUtil.toAudioData(data);
      const expected = Object.assign({ numberOfChannels: 1, length: 16 }, data);

      assert(actual !== expected);
      assert(deepEqual(actual, expected));
    });

    it("convert to full audioData from audioData (channelData is empty)", () => {
      const data = { sampleRate: 8000, channelData: [] };
      const actual = audioDataUtil.toAudioData(data);
      const expected = Object.assign({ numberOfChannels: 0, length: 0 }, data);

      assert(actual !== expected);
      assert(deepEqual(actual, expected));
    });

    it("convert to full audioData from audioBuffer", () => {
      const channelData = [ new Float32Array(16) ];
      const data = { numberOfChannels: 1, sampleRate: 8000, getChannelData(ch) { return channelData[ch]; } };
      const actual = audioDataUtil.toAudioData(data);
      const expected = { numberOfChannels: 1, length: 16, sampleRate: 8000, channelData };

      assert(deepEqual(actual, expected));
    });

    it("convert to full audioData from audioBuffer (channelData is empty)", () => {
      const channelData = [];
      const data = { numberOfChannels: 0, sampleRate: 8000, getChannelData() {} };
      const actual = audioDataUtil.toAudioData(data);
      const expected = { numberOfChannels: 0, length: 0, sampleRate: 8000, channelData };

      assert(deepEqual(actual, expected));
    });

    it("convert to full audioData from null", () => {
      const actual = audioDataUtil.toAudioData(null);
      const expected = { numberOfChannels: 0, length: 0, sampleRate: 0, channelData: [] };

      assert(deepEqual(actual, expected));
    });
  });

  describe("isAudioBuffer()", () => {
    it("true when .numberOfChannels is number and .sampleRate is number and .getChannelData is function", () => {
      const channelData = [ new Float32Array(16) ];
      const data = { numberOfChannels: 1, sampleRate: 8000, getChannelData() { return channelData[0]; } };

      assert(audioDataUtil.isAudioBuffer(data));
    });

    it("false when falsy value", () => {
      assert(audioDataUtil.isAudioBuffer(null) === false);
    });

    it("false when .numberOfChannels is not number", () => {
      const channelData = [ new Float32Array(16) ];
      const data = { numberOfChannels: "1", sampleRate: 8000, getChannelData() { return channelData[0]; } };

      assert(audioDataUtil.isAudioBuffer(data) === false);
    });

    it("false when .sampleRate is not number", () => {
      const channelData = [ new Float32Array(16) ];
      const data = { numberOfChannels: 1, sampleRate: "8000", getChannelData() { return channelData[0]; } };

      assert(audioDataUtil.isAudioBuffer(data) === false);
    });

    it("false when .getChannelData is not function", () => {
      const data = { numberOfChannels: 1, sampleRate: 8000, getChannelData: null };

      assert(audioDataUtil.isAudioBuffer(data) === false);
    });
  });

  describe("toAudioBuffer()", () => {
    it("convert AudioBuffer from audioData - api", () => {
      const data = { sampleRate: 8000, channelData: [ new Float32Array(16) ] };
      const actual = audioDataUtil.toAudioBuffer(data, APIAudioBuffer);

      assert(actual instanceof APIAudioBuffer);
      assert(actual.numberOfChannels === 1);
      assert(actual.length === 16);
      assert(actual.sampleRate === 8000);
    });

    it("convert AudioBuffer from audioData - api", () => {
      const data = { sampleRate: 8000, channelData: [ new Float32Array(16) ] };
      const actual = audioDataUtil.toAudioBuffer(data, IMPLAudioBuffer);

      assert(actual instanceof IMPLAudioBuffer);
      assert(actual.getNumberOfChannels() === 1);
      assert(actual.getLength() === 16);
      assert(actual.getSampleRate() === 8000);
    });
  });
});
