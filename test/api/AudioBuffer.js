"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const api = require("../../src/api");
const AudioContext = require("../../src/api/AudioContext");

describe("api/AudioBuffer", () => {
  it("context.createBuffer(numberOfChannels, length, sampleRate)", () => {
    const context = new AudioContext();
    const target = context.createBuffer(1, 16, 8000);

    assert(target instanceof api.AudioBuffer);
  });

  describe("attributes", () => {
    it(".sampleRate", () => {
      const context = new AudioContext();
      const target = context.createBuffer(1, 16, 8000);
      const sampleRate = 8000;

      target._impl.getSampleRate = sinon.spy(() => sampleRate);

      assert(target.sampleRate === sampleRate);
      assert(target._impl.getSampleRate.callCount === 1);
    });

    it(".length", () => {
      const context = new AudioContext();
      const target = context.createBuffer(1, 16, 8000);
      const length = 16;

      target._impl.getLength = sinon.spy(() => length);

      assert(target.length === length);
      assert(target._impl.getLength.callCount === 1);
    });

    it(".duration", () => {
      const context = new AudioContext();
      const target = context.createBuffer(1, 16, 8000);
      const duration = 16 / 8000;

      target._impl.getDuration = sinon.spy(() => duration);

      assert(target.duration === duration);
      assert(target._impl.getDuration.callCount === 1);
    });

    it(".numberOfChannels", () => {
      const context = new AudioContext();
      const target = context.createBuffer(1, 16, 8000);
      const numberOfChannels = 1;

      target._impl.getNumberOfChannels = sinon.spy(() => numberOfChannels);

      assert(target.numberOfChannels === numberOfChannels);
      assert(target._impl.getNumberOfChannels.callCount === 1);
    });
  });

  describe("methods", () => {
    it(".getChannelData(channel)", () => {
      const context = new AudioContext();
      const target = context.createBuffer(1, 16, 8000);
      const channel = 0;

      target._impl.getChannelData = sinon.spy();

      target.getChannelData(channel);
      assert(target._impl.getChannelData.callCount === 1);
      assert(target._impl.getChannelData.args[0][0] === channel);
    });

    it(".copyFromChannel(destination, channelNumber, startInChannel)", () => {
      const context = new AudioContext();
      const target = context.createBuffer(1, 16, 8000);
      const destination = new Float32Array(128);
      const channelNumber = 0;
      const startInChannel = 2;

      target._impl.copyFromChannel = sinon.spy();

      target.copyFromChannel(destination, channelNumber, startInChannel);
      assert(target._impl.copyFromChannel.callCount === 1);
      assert(target._impl.copyFromChannel.args[0][0] === destination);
      assert(target._impl.copyFromChannel.args[0][1] === channelNumber);
      assert(target._impl.copyFromChannel.args[0][2] === startInChannel);
    });

    it(".copyToChannel(source, channelNumber, startInChannel)", () => {
      const context = new AudioContext();
      const target = context.createBuffer(1, 16, 8000);
      const source = new Float32Array(128);
      const channelNumber = 0;
      const startInChannel = 2;

      target._impl.copyToChannel = sinon.spy();

      target.copyToChannel(source, channelNumber, startInChannel);
      assert(target._impl.copyToChannel.callCount === 1);
      assert(target._impl.copyToChannel.args[0][0] === source);
      assert(target._impl.copyToChannel.args[0][1] === channelNumber);
      assert(target._impl.copyToChannel.args[0][2] === startInChannel);
    });
  });
});
