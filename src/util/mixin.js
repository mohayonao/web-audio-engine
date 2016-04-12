"use strict";

const assert = require("assert");

function mixin(targetKlass, partialKlass) {
  const partialProto = partialKlass.prototype;
  const targetProto = targetKlass.prototype;

  assert.equal(Object.getPrototypeOf(partialProto), Object.getPrototypeOf(targetProto), "SuperClasses aren't matched");

  Object.getOwnPropertyNames(partialProto).forEach((methodName) => {
    if (methodName !== "constructor") {
      assert(!targetProto.hasOwnProperty(methodName), `'${ methodName }' is already defined`);

      const desc = Object.getOwnPropertyDescriptor(partialProto, methodName);

      Object.defineProperty(targetProto, methodName, desc);
    }
  });

  return targetKlass;
}
module.exports = mixin;
