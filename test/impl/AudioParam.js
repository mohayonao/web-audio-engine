"use strict";

const assert = require("power-assert");
const sinon = require("sinon");
const deepEqual = require("deep-equal");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const AudioParam = require("../../src/impl/AudioParam");
const AudioNode = require("../../src/impl/AudioNode");
const GainNode = require("../../src/impl/GainNode")

const context = new AudioContext({ sampleRate: 8000, processingSizeInFrames: 16 });
const testSpec = {};

testSpec.context = {
  testCase: [ { expected: context } ]
};

testSpec.value = {
  testCase: [
    { value: 1, expected: 1 }
  ]
};

testSpec.defaultValue = {
  testCase: [ { expected: 0} ]
};

describe("AudioParam", () => {
  describe("inherits", () => {
    const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

    assert(param instanceof AudioParam);
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: AudioParam,
      create: context => new AudioParam(context, { rate: "control", defaultValue: 0 }),
      testSpec
    });

    it(".rate - audio rate", () => {
      const param = new AudioParam(context, { rate: "audio", defaultValue: 0 });

      assert(param.getRate() === "audio");
    });

    it(".rate - control rate", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

      assert(param.getRate() === "control");
    });
  });

  describe("scheduling", () => {
    it("works", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });
      const curve = new Float32Array(44100);

      param.setValueAtTime(0.2, 0);
      param.setValueAtTime(0.3, 0.1);
      param.setValueAtTime(0.4, 0.2);
      param.linearRampToValueAtTime(1, 0.3);
      param.linearRampToValueAtTime(0.8, 0.325);
      param.setTargetAtTime(0.5, 0.325, 0.1);
      param.setValueAtTime(0.55, 0.5);
      param.exponentialRampToValueAtTime(0.75, 0.6);
      param.exponentialRampToValueAtTime(0.05, 0.7);
      param.setValueCurveAtTime(curve, 0.7, 0.3);

      assert(deepEqual(param.getEvents(), [
        { type: "setValueAtTime", time: 0, args: [ 0.2, 0 ] },
        { type: "setValueAtTime", time: 0.1, args: [ 0.3, 0.1 ] },
        { type: "setValueAtTime", time: 0.2, args: [ 0.4, 0.2 ] },
        { type: "linearRampToValueAtTime", time: 0.3, args: [ 1, 0.3 ] },
        { type: "linearRampToValueAtTime", time: 0.325, args: [ 0.8, 0.325 ] },
        { type: "setTargetAtTime", time: 0.325, args: [ 0.5, 0.325, 0.1 ] },
        { type: "setValueAtTime", time: 0.5, args: [ 0.55, 0.5 ] },
        { type: "exponentialRampToValueAtTime", time: 0.6, args: [ 0.75, 0.6 ] },
        { type: "exponentialRampToValueAtTime", time: 0.7, args: [ 0.05, 0.7 ] },
        { type: "setValueCurveAtTime", time: 0.7, args: [ curve, 0.7, 0.3 ] }
      ]));
    });

    it("replace", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

      param.setValueAtTime(0.2, 0);
      param.linearRampToValueAtTime(1, 0.5);
      param.linearRampToValueAtTime(0.8, 0.5);
      param.setValueAtTime(1.0, 0.5);

      assert(deepEqual(param.getEvents(), [
        { type: "setValueAtTime", time: 0, args: [ 0.2, 0 ] },
        { type: "linearRampToValueAtTime", time: 0.5, args: [ 0.8, 0.5 ] },
        { type: "setValueAtTime", time: 0.5, args: [ 1.0, 0.5 ] }
      ]));
    });

    it("sort", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

      param.setValueAtTime(1.0, 1.0);
      param.setValueAtTime(0.5, 0.5);
      param.setValueAtTime(0.0, 0.0);

      assert(deepEqual(param.getEvents(), [
        { type: "setValueAtTime", time: 0.0, args: [ 0.0, 0.0 ] },
        { type: "setValueAtTime", time: 0.5, args: [ 0.5, 0.5 ] },
        { type: "setValueAtTime", time: 1.0, args: [ 1.0, 1.0 ] }
      ]));
    });

    it("cancel", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });
      const curve = new Float32Array(44100);

      param.setValueAtTime(0.2, 0);
      param.setValueAtTime(0.3, 0.1);
      param.setValueAtTime(0.4, 0.2);
      param.linearRampToValueAtTime(1, 0.3);
      param.linearRampToValueAtTime(0.8, 0.325);
      param.setTargetAtTime(0.5, 0.325, 0.1);
      param.setValueAtTime(0.55, 0.5);
      param.exponentialRampToValueAtTime(0.75, 0.6);
      param.exponentialRampToValueAtTime(0.05, 0.7);
      param.setValueCurveAtTime(curve, 0.7, 0.3);

      param.cancelScheduledValues(0.4);

      assert(deepEqual(param.getEvents(), [
        { type: "setValueAtTime", time: 0, args: [ 0.2, 0 ] },
        { type: "setValueAtTime", time: 0.1, args: [ 0.3, 0.1 ] },
        { type: "setValueAtTime", time: 0.2, args: [ 0.4, 0.2 ] },
        { type: "linearRampToValueAtTime", time: 0.3, args: [ 1, 0.3 ] },
        { type: "linearRampToValueAtTime", time: 0.325, args: [ 0.8, 0.325 ] },
        { type: "setTargetAtTime", time: 0.325, args: [ 0.5, 0.325, 0.1 ] }
      ]));
    });
  });

  describe("connection", () => {
    it("basic operation", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });
      const node = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ]});

      node.connect(param);

      assert(node.isConnectedTo(param) === true);
      assert(param.isConnectedFrom(node) === true);

      node.disconnect();

      assert(node.isConnectedTo(param) === false);
      assert(param.isConnectedFrom(node) === false);
    });

    it("misc", () => {
      const node = new AudioNode(context, { inputs: [], outputs: [ 1 ] });
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

      assert(param.isConnectedFrom() === false);

      node.connect(param);
      assert(param.isConnectedFrom(node) === true);
    });
  });

  describe("processing", () => {
    //               +-------------------+
    //               | AudioNode (node1) |
    //               +-------------------+
    //                         |
    // +------------------+    |
    // | GainNode (node2) |    |
    // | gain (param)    <-----+
    // +------------------+
    let node1, node2, param, input;

    beforeEach(() => {
      node1 = new AudioNode(context, { inputs: [], outputs: [ 1 ] });
      node2 = new GainNode(context);
      param = node2.getGain();
      input = param.getInput(0);
      input.pull = sinon.spy();
      node1.connect(param);
    });

    it("process when connected node is enabled", () => {
      const e = {};

      node1.getOutput(0).enable();

      param.dspProcess(e);
      assert(input.pull.callCount === 1);
      assert(input.pull.calledWith(e));
    });

    it("NOT process when connected node is not enabled", () => {
      const e = {};

      node1.getOutput(0).disable();

      param.dspProcess(e);
      assert(input.pull.callCount === 0);
    });
  });
});
