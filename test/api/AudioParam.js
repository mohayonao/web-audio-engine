"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const AudioContext = require("../../src/api/BaseAudioContext");

describe("api/AudioParam", () => {
  describe("attributes", () => {
    it(".value=", () => {
      const context = new AudioContext();
      const target = context.createGain().gain;
      const value1 = 1;
      const value2 = 0.5;

      target._impl.getValue = sinon.spy(() => value1);
      target._impl.setValue = sinon.spy();

      assert(target.value === value1);
      assert(target._impl.getValue.callCount === 1);

      target.value = value2;
      assert(target._impl.setValue.callCount === 1);
      assert(target._impl.setValue.args[0][0] === value2);
    });

    it(".defaultValue", () => {
      const context = new AudioContext();
      const target = context.createGain().gain;
      const defaultValue = 1;

      target._impl.getDefaultValue = sinon.spy(() => defaultValue);

      assert(target.defaultValue === defaultValue);
      assert(target._impl.getDefaultValue.callCount === 1);
    });
  });

  describe("methods", () => {
    it(".setValueAtTime(value, startTime)", () => {
      const context = new AudioContext();
      const target = context.createGain().gain;
      const value = 0;
      const startTime = 0.5;

      target._impl.setValueAtTime = sinon.spy();

      target.setValueAtTime(value, startTime);
      assert(target._impl.setValueAtTime.callCount === 1);
      assert(target._impl.setValueAtTime.args[0][0] === value);
      assert(target._impl.setValueAtTime.args[0][1] === startTime);
    });

    it(".linearRampToValueAtTime(value, endTime)", () => {
      const context = new AudioContext();
      const target = context.createGain().gain;
      const value = 0;
      const endTime = 0.5;

      target._impl.linearRampToValueAtTime = sinon.spy();

      target.linearRampToValueAtTime(value, endTime);
      assert(target._impl.linearRampToValueAtTime.callCount === 1);
      assert(target._impl.linearRampToValueAtTime.args[0][0] === value);
      assert(target._impl.linearRampToValueAtTime.args[0][1] === endTime);
    });

    it(".exponentialRampToValueAtTime(value, endTime)", () => {
      const context = new AudioContext();
      const target = context.createGain().gain;
      const value = 0;
      const endTime = 0.5;

      target._impl.exponentialRampToValueAtTime = sinon.spy();

      target.exponentialRampToValueAtTime(value, endTime);
      assert(target._impl.exponentialRampToValueAtTime.callCount === 1);
      assert(target._impl.exponentialRampToValueAtTime.args[0][0] === value);
      assert(target._impl.exponentialRampToValueAtTime.args[0][1] === endTime);
    });

    it(".setTargetAtTime(target, startTime, timeConstant)", () => {
      const context = new AudioContext();
      const target = context.createGain().gain;
      const targetValue = 0;
      const startTime = 0.5;
      const timeConstant = 2;

      target._impl.setTargetAtTime = sinon.spy();

      target.setTargetAtTime(targetValue, startTime, timeConstant);
      assert(target._impl.setTargetAtTime.callCount === 1);
      assert(target._impl.setTargetAtTime.args[0][0] === targetValue);
      assert(target._impl.setTargetAtTime.args[0][1] === startTime);
      assert(target._impl.setTargetAtTime.args[0][2] === timeConstant);
    });

    it(".setValueCurveAtTime(values, startTime, duration)", () => {
      const context = new AudioContext();
      const target = context.createGain().gain;
      const values = new Float32Array(128);
      const startTime = 0.5;
      const duration = 2;

      target._impl.setValueCurveAtTime = sinon.spy();

      target.setValueCurveAtTime(values, startTime, duration);
      assert(target._impl.setValueCurveAtTime.callCount === 1);
      assert(target._impl.setValueCurveAtTime.args[0][0] === values);
      assert(target._impl.setValueCurveAtTime.args[0][1] === startTime);
      assert(target._impl.setValueCurveAtTime.args[0][2] === duration);
    });

    it(".cancelScheduledValues(startTime)", () => {
      const context = new AudioContext();
      const target = context.createGain().gain;
      const startTime = 0.5;

      target._impl.cancelScheduledValues = sinon.spy();

      target.cancelScheduledValues(startTime);
      assert(target._impl.cancelScheduledValues.callCount === 1);
      assert(target._impl.cancelScheduledValues.args[0][0] === startTime);
    });
  });
});
