"use strict";

function getFilterResponse(b, a, frequencyHz, magResponse, phaseResponse, sampleRate) {
  for (let i = 0, imax = frequencyHz.length; i < imax; i++) {
    const w0 = 2 * Math.PI * (frequencyHz[i] / sampleRate);
    const ca = compute(a, Math.cos, w0);
    const sa = compute(a, Math.sin, w0);
    const cb = compute(b, Math.cos, w0);
    const sb = compute(b, Math.sin, w0);

    magResponse[i]   = Math.sqrt((cb * cb + sb * sb) / (ca * ca + sa * sa));
    phaseResponse[i] =  Math.atan2(sa, ca) - Math.atan2(sb, cb);
  }
}

function compute(values, fn, w0) {
  let result = 0;

  for (let i = 0, imax = values.length; i < imax; i++) {
    result += values[i] * fn(w0 * i);
  }

  return result;
}

module.exports = { getFilterResponse };
