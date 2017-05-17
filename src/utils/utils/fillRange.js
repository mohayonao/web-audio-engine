"use strict";

/**
 * @param {number[]} list
 * @param {number}   value
 * @param {number}   start
 * @param {number}   end
 * @return {number[]}
 */
function fillRange(list, value, start, end) {
  if (list.fill) {
    return list.fill(value, start, end);
  }

  for (let i = start; i < end; i++) {
    list[i] = value;
  }

  return list;
}

module.exports = fillRange;
