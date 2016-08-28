"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../src/impl/AudioContext");
const AudioParam = require("../../src/impl/AudioParam");
const AudioParamDSP = require("../../src/impl/dsp/AudioParam");
const AudioNode = require("../../src/impl/AudioNode");

describe("AudioParam", () => {
  let context;

  beforeEach(() => {
    context = new AudioContext({ sampleRate: 8000, blockSize: 32 });
  });

  it("constructor", () => {
    const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

    assert(param instanceof AudioParam);
  });

  describe("attributes", () => {
    it(".value=", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

      assert(param.getValue() === param.getDefaultValue());

      param.setValue(1);
      assert(param.getValue() === 1);
    });

    it(".defaultValue", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

      assert(param.getDefaultValue() === 0);
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

      assert.deepEqual(param.getEvents(), [
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
      ]);
    });

    it("replace", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

      param.setValueAtTime(0.2, 0);
      param.linearRampToValueAtTime(1, 0.5);
      param.linearRampToValueAtTime(0.8, 0.5);
      param.setValueAtTime(1.0, 0.5);

      assert.deepEqual(param.getEvents(), [
        { type: "setValueAtTime", time: 0, args: [ 0.2, 0 ] },
        { type: "linearRampToValueAtTime", time: 0.5, args: [ 0.8, 0.5 ] },
        { type: "setValueAtTime", time: 0.5, args: [ 1.0, 0.5 ] }
      ]);
    });

    it("sort", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

      param.setValueAtTime(1.0, 1.0);
      param.setValueAtTime(0.5, 0.5);
      param.setValueAtTime(0.0, 0.0);

      assert.deepEqual(param.getEvents(), [
        { type: "setValueAtTime", time: 0.0, args: [ 0.0, 0.0 ] },
        { type: "setValueAtTime", time: 0.5, args: [ 0.5, 0.5 ] },
        { type: "setValueAtTime", time: 1.0, args: [ 1.0, 1.0 ] }
      ]);
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

      assert.deepEqual(param.getEvents(), [
        { type: "setValueAtTime", time: 0, args: [ 0.2, 0 ] },
        { type: "setValueAtTime", time: 0.1, args: [ 0.3, 0.1 ] },
        { type: "setValueAtTime", time: 0.2, args: [ 0.4, 0.2 ] },
        { type: "linearRampToValueAtTime", time: 0.3, args: [ 1, 0.3 ] },
        { type: "linearRampToValueAtTime", time: 0.325, args: [ 0.8, 0.325 ] },
        { type: "setTargetAtTime", time: 0.325, args: [ 0.5, 0.325, 0.1 ] }
      ]);
    });
  });

  describe("timeline", () => {
    const inf = Infinity;

    function pluck(items) {
      const list = [];

      [ "type", "startFrame", "endFrame", "startValue", "endValue" ].forEach((key) => {
        list.push(items[key]);
      });

      return list;
    }

    function fr(value) {
      return Math.round(value * context.sampleRate);
    }

    it("setValueAtTime", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

      param.setValueAtTime(0.0, 0);
      param.setValueAtTime(0.1, 1);
      param.setValueAtTime(0.2, 2);
      param.linearRampToValueAtTime(0.3, 3);
      param.setValueAtTime(0.4, 4);

      assert.deepEqual(param.getTimeline().map(pluck), [
        //                                                 startTime, endTime, startValue, endValue
        [ AudioParamDSP.SET_VALUE_AT_TIME                ,     fr(0),   fr(1),        0.0,      0.0 ],
        [ AudioParamDSP.SET_VALUE_AT_TIME                ,     fr(1),   fr(2),        0.1,      0.1 ],
        [ AudioParamDSP.SET_VALUE_AT_TIME                ,     fr(2),   fr(2),        0.2,      0.2 ],
        [ AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME     ,     fr(2),   fr(3),        0.2,      0.3 ],
        [ AudioParamDSP.SET_VALUE_AT_TIME                ,     fr(4),     inf,        0.4,      0.4 ]
      ]);
    });

    it("linearRampToValueAtTime", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

      param.linearRampToValueAtTime(0.1, 1);
      param.linearRampToValueAtTime(0.2, 2);
      param.setValueAtTime(0.3, 3);
      param.linearRampToValueAtTime(0.4, 4);

      assert.deepEqual(param.getTimeline().map(pluck), [
        //                                                 startTime, endTime, startValue, endValue
        [ AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME     ,     fr(0),   fr(1),        0.0,      0.1 ],
        [ AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME     ,     fr(1),   fr(2),        0.1,      0.2 ],
        [ AudioParamDSP.SET_VALUE_AT_TIME                ,     fr(3),   fr(3),        0.3,      0.3 ],
        [ AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME     ,     fr(3),   fr(4),        0.3,      0.4 ]
      ]);
    });

    it("exponentialRampToValueAtTime", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

      param.exponentialRampToValueAtTime(0.1, 1);
      param.exponentialRampToValueAtTime(0.2, 2);
      param.setValueAtTime(0.3, 3);
      param.exponentialRampToValueAtTime(0.4, 4);

      assert.deepEqual(param.getTimeline().map(pluck), [
        //                                                 startTime, endTime, startValue, endValue
        [ AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME,     fr(0),   fr(1),       1e-6,      0.1 ],
        [ AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME,     fr(1),   fr(2),        0.1,      0.2 ],
        [ AudioParamDSP.SET_VALUE_AT_TIME                ,     fr(3),   fr(3),        0.3,      0.3 ],
        [ AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME,     fr(3),   fr(4),        0.3,      0.4 ]
      ]);
    });

    it("setTargetAtTime", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

      param.setTargetAtTime(0.1, 1, 0.5);
      param.setTargetAtTime(0.2, 2, 0.4);
      param.setTargetAtTime(0.3, 3, 0.3);
      param.setValueAtTime(0.4, 4);
      param.setTargetAtTime(0.5, 5, 0.2);
      param.linearRampToValueAtTime(0.6, 6);
      param.setTargetAtTime(0.7, 7, 0.1);

      assert.deepEqual(param.getTimeline().map(pluck), [
        //                                                 startTime, endTime, startValue, endValue
        [ AudioParamDSP.SET_TARGET_AT_TIME               ,     fr(1),   fr(2),        0.0,      0.1 ],
        [ AudioParamDSP.SET_TARGET_AT_TIME               ,     fr(2),   fr(3),        0.0,      0.2 ],
        [ AudioParamDSP.SET_TARGET_AT_TIME               ,     fr(3),   fr(4),        0.0,      0.3 ],
        [ AudioParamDSP.SET_VALUE_AT_TIME                ,     fr(4),   fr(5),        0.4,      0.4 ],
        [ AudioParamDSP.SET_TARGET_AT_TIME               ,     fr(5),   fr(5),        0.4,      0.5 ],
        [ AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME     ,     fr(5),   fr(6),        0.4,      0.6 ],
        [ AudioParamDSP.SET_TARGET_AT_TIME               ,     fr(7),     inf,        0.6,      0.7 ]
      ]);
    });

    it("setValueCurveAtTime", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });
      const curve1 = new Float32Array([ 0.1, 0.2, 0.3 ]);
      const curve2 = new Float32Array([ 0.4, 0.5, 0.6 ]);
      const f32 = Math.fround;

      param.setValueCurveAtTime(curve1, 0, 1);
      param.setValueAtTime(0.2, 2);
      param.setValueCurveAtTime(curve2, 3, 1);
      param.linearRampToValueAtTime(1.0, 5);

      assert.deepEqual(param.getTimeline().map(pluck), [
        //                                                 startTime, endTime, startValue, endValue
        [ AudioParamDSP.SET_VALUE_CURVE_AT_TIME          ,     fr(0),   fr(1),   f32(0.1), f32(0.3) ],
        [ AudioParamDSP.SET_VALUE_AT_TIME                ,     fr(2),   fr(3),       0.2 ,     0.2  ],
        [ AudioParamDSP.SET_VALUE_CURVE_AT_TIME          ,     fr(3),   fr(4),   f32(0.4), f32(0.6) ],
        [ AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME     ,     fr(4),   fr(5),   f32(0.6),     1.0  ]
      ]);
    });

    it("cancel", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

      param.setValueAtTime(0.0, 0);
      param.setValueAtTime(0.1, 1);
      param.setValueAtTime(0.2, 2);
      param.cancelScheduledValues(2);

      assert.deepEqual(param.getTimeline().map(pluck), [
        //                                                 startTime, endTime, startValue, endValue
        [ AudioParamDSP.SET_VALUE_AT_TIME                ,     fr(0),   fr(1),        0.0,      0.0 ],
        [ AudioParamDSP.SET_VALUE_AT_TIME                ,     fr(1),     inf,        0.1,      0.1 ]
      ]);
    });
  });

  describe("connection", () => {
    it("basic operation", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });
      const node = new AudioNode(context, { outputs: [ 1 ] });

      node.outputs[0].enable();
      node.connect(param);

      assert(node.outputs[0].isConnectedTo(param) === true);
      assert(param.inputs[0].isConnectedFrom(node) === true);

      node.disconnect();

      assert(node.outputs[0].isConnectedTo(param) === false);
      assert(param.inputs[0].isConnectedFrom(node) === false);
    });
  });
});
