"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const AudioContext = require("../../src/api/AudioContext");

describe("api/AudioNode", () => {
  it(".context", () => {
    const context = new AudioContext();
    const target = context.createGain();

    assert(target.context === context);
  });

  describe("attributes", () => {
    it(".numberOfInputs", () => {
      const context = new AudioContext();
      const target = context.createGain();
      const numberOfInputs = 1;

      target._impl.getNumberOfInputs = sinon.spy(() => numberOfInputs);

      assert(target.numberOfInputs === numberOfInputs);
      assert(target._impl.getNumberOfInputs.callCount === 1);
    });

    it(".numberOfOutputs", () => {
      const context = new AudioContext();
      const target = context.createGain();
      const numberOfOutputs = 1;

      target._impl.getNumberOfOutputs = sinon.spy(() => numberOfOutputs);

      assert(target.numberOfOutputs === numberOfOutputs);
      assert(target._impl.getNumberOfOutputs.callCount === 1);
    });

    it(".channelCount=", () => {
      const context = new AudioContext();
      const target = context.createGain();
      const channelCount1 = 1;
      const channelCount2 = 2;

      target._impl.getChannelCount = sinon.spy(() => channelCount1);
      target._impl.setChannelCount = sinon.spy();

      assert(target.channelCount === channelCount1);
      assert(target._impl.getChannelCount.callCount === 1);

      target.channelCount = channelCount2;
      assert(target._impl.setChannelCount.callCount === 1);
      assert(target._impl.setChannelCount.args[0][0] === channelCount2);
    });

    it(".channelCountMode=", () => {
      const context = new AudioContext();
      const target = context.createGain();
      const channelCountMode1 = "max";
      const channelCountMode2 = "explicit";

      target._impl.getChannelCountMode = sinon.spy(() => channelCountMode1);
      target._impl.setChannelCountMode = sinon.spy();

      assert(target.channelCountMode === channelCountMode1);
      assert(target._impl.getChannelCountMode.callCount === 1);

      target.channelCountMode = channelCountMode2;
      assert(target._impl.setChannelCountMode.callCount === 1);
      assert(target._impl.setChannelCountMode.args[0][0] === channelCountMode2);
    });

    it(".channelInterpretation=", () => {
      const context = new AudioContext();
      const target = context.createGain();
      const channelInterpretation1 = "max";
      const channelInterpretation2 = "explicit";

      target._impl.getChannelInterpretation = sinon.spy(() => channelInterpretation1);
      target._impl.setChannelInterpretation = sinon.spy();

      assert(target.channelInterpretation === channelInterpretation1);
      assert(target._impl.getChannelInterpretation.callCount === 1);

      target.channelInterpretation = channelInterpretation2;
      assert(target._impl.setChannelInterpretation.callCount === 1);
      assert(target._impl.setChannelInterpretation.args[0][0] === channelInterpretation2);
    });
  });

  describe("methods", () => {
    it(".connect(destination: AudioNode, output, input)", () => {
      const context = new AudioContext();
      const target = context.createGain();
      const destination = context.createGain();
      const output = 0;
      const input = 0;

      target._impl.connect = sinon.spy();

      const retVal = target.connect(destination, output, input);

      assert(retVal === destination);
      assert(target._impl.connect.callCount === 1);
      assert(target._impl.connect.args[0][0] === destination._impl);
      assert(target._impl.connect.args[0][1] === output);
      assert(target._impl.connect.args[0][2] === input);
    });

    it(".connect(destination: AudioParam, output)", () => {
      const context = new AudioContext();
      const target = context.createGain();
      const destination = context.createGain().gain;
      const output = 0;

      target._impl.connect = sinon.spy();

      const retVal = target.connect(destination, output);

      assert(retVal === undefined);
      assert(target._impl.connect.callCount === 1);
      assert(target._impl.connect.args[0][0] === destination._impl);
      assert(target._impl.connect.args[0][1] === output);
    });

    it(".disconnect(...args)", () => {
      const context = new AudioContext();
      const target = context.createGain();
      const output = 0;

      target._impl.disconnect = sinon.spy();

      target.disconnect(output);
      assert(target._impl.disconnect.callCount === 1);
      assert(target._impl.disconnect.args[0][0] === output);
    });
  });
});
