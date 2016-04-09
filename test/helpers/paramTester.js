"use strict";

function toValues(str) {
  str = str.replace(/^\s*\|/gm, "").trimRight();

  const lines = str.split("\n");
  const length = lines.reduce((a, b) => Math.max(a, b.length), 0);
  const result = new Float32Array(length);

  lines.forEach((line, i) => {
    const value = 1 - (i / (lines.length - 1));

    findIndexes(line, "*").forEach((i) => {
      result[i] = value;
    });
  });

  return result;
}

function findIndexes(str, ch) {
  const result = [];

  for (let i = 0, imax = str.length; i < imax; i++) {
    if (str[i] === ch) {
      result.push(i);
    }
  }

  return result;
}

module.exports = { toValues };
