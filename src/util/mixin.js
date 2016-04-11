"use strict";

const assert = require("power-assert");

function mixin(targetKlass, partialKlass) {
  const partialProto = partialKlass.prototype;
  const targetProto = targetKlass.prototype;

  assert(Object.getPrototypeOf(partialProto) === Object.getPrototypeOf(targetProto));

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
