"use strict";

/**
 * @param {object} value
 * @return {object}
 */
function toImpl(value) {
  return value._impl || value;
}

module.exports = toImpl;
