"use strict";

/**
 * @param {*} value
 * @param {*) defaultValue
 */
function defaults(value, defaultValue) {
  return typeof value !== "undefined" ? value : defaultValue;
}

module.exports = defaults;
