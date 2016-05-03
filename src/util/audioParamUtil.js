"use strict";

const SET_VALUE_AT_TIME = 1;
const LINEAR_RAMP_TO_VALUE_AT_TIME = 2;
const EXPONENTIAL_RAMP_TO_VALUE_AT_TIME = 3;
const SET_TARGET_AT_TIME = 4;
const SET_VALUE_CURVE_AT_TIME = 5;

/**
 * @param {object[]} timeline
 * @param {number}   time
 * @param {number}   defaultValue
 */
function computeValueAtTime(timeline, time, defaultValue) {
  let value = defaultValue;

  for (let i = 0, imax = timeline.length; i < imax; i++) {
    const e0 = timeline[i];
    const e1 = timeline[i + 1];
    const t0 = Math.min(time, e1 ? e1.time : time);

    if (time < e0.time) {
      break;
    }

    switch (e0.type) {
    case SET_VALUE_AT_TIME:
    case LINEAR_RAMP_TO_VALUE_AT_TIME:
    case EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
      value = e0.args[0];
      break;
    case SET_TARGET_AT_TIME:
      value = getTargetValueAtTime(t0, value, e0.args[0], e0.args[1], e0.args[2]);
      break;
    case SET_VALUE_CURVE_AT_TIME:
      value = getValueCurveAtTime(t0, e0.args[0], e0.args[1], e0.args[2]);
      break;
    }
    if (e1) {
      switch (e1.type) {
      case LINEAR_RAMP_TO_VALUE_AT_TIME:
        value = getLinearRampToValueAtTime(t0, value, e1.args[0], e0.time, e1.args[1]);
        break;
      case EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
        value = getExponentialRampToValueAtTime(t0, value, e1.args[0], e0.time, e1.args[1]);
        break;
      }
    }
  }

  return value;
}

function getLinearRampToValueAtTime(t, v0, v1, t0, t1) {
  var a;

  if (t <= t0) {
    return v0;
  }
  if (t1 <= t) {
    return v1;
  }

  a = (t - t0) / (t1 - t0);

  return v0 + a * (v1 - v0);
}

function getExponentialRampToValueAtTime(t, v0, v1, t0, t1) {
  var a;

  if (t <= t0) {
    return v0;
  }
  if (t1 <= t) {
    return v1;
  }

  a = (t - t0) / (t1 - t0);

  return v0 * Math.pow(v1 / v0, a);
}

function getTargetValueAtTime(t, v0, v1, t0, timeConstant) {
  if (t <= t0) {
    return v0;
  }
  return v1 + (v0 - v1) * Math.exp((t0 - t) / timeConstant);
}

function getValueCurveAtTime(t, curve, t0, duration) {
  var x, ix, i0, i1;
  var y0, y1, a;

  x = (t - t0) / duration;
  ix = x * (curve.length - 1);
  i0 = ix|0;
  i1 = i0 + 1;

  if (curve.length <= i1) {
    return curve[curve.length - 1];
  }

  y0 = curve[i0];
  y1 = curve[i1];
  a = ix % 1;

  return y0 + a * (y1 - y0);
}

module.exports = { computeValueAtTime, getLinearRampToValueAtTime, getExponentialRampToValueAtTime, getTargetValueAtTime, getValueCurveAtTime };
