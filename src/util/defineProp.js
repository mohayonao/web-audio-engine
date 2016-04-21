"use strict";

/**
 * @param {object} target
 * @param {string} name
 * @param {*}      value
 */
function defineProp(target, name, value) {
  Object.defineProperty(target, name, { value: value, enumerable: false, writable: true, configurable: true });
}

module.exports = defineProp;
