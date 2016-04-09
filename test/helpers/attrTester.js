"use strict";

const assert = require("power-assert");

function makeTests(context, opts) {
  const Klass = opts.class;
  const proto = Klass.prototype;
  const createInstance = opts.create || (context => new Klass(context));
  const testSpec = opts.testSpec;

  Object.keys(testSpec).forEach((attrName) => {
    const spec = testSpec[attrName];
    const getMethodName = toGetMethodName(attrName);
    const setMethodName = toSetMethodName(attrName);

    if (typeof proto[getMethodName] !== "function") {
      throw new Error(`${ getMethodName } is not function`);
    }

    const testTitle = proto[setMethodName] ? "." + attrName + "=" : "." + attrName;

    it(testTitle, () => {
      const target = createInstance(context);
      const getter = target[getMethodName].bind(target);
      const setter = target[setMethodName] && target[setMethodName].bind(target);

      if (spec.hasOwnProperty("defaultValue")) {
        const defaultValue = getter();

        assert(defaultValue === spec.defaultValue);
      }

      spec.testCase.forEach((opts) => {
        const value = opts.value;
        const expected = opts.expected;

        let message = opts.message;

        if (setter) {
          setter(value);
        }

        const actual = getter();

        if (typeof expected === "function") {
          message = message || "failed to " + expected.toString();
          assert(expected(actual), message);
        } else {
          if (!message && setter) {
            message = `${ attrName } = ${ value }; expected: ${ expected }, but got ${ actual }`;
          }
          assert(actual === expected, message);
        }
      });
    });
  });
}

function toGetMethodName(name) {
  return "get" + toLetterCase(name);
}

function toSetMethodName(name) {
  return "set" + toLetterCase(name);
}

function toLetterCase(str) {
  return str[0].toUpperCase() + str.slice(1);
}

module.exports = { makeTests };
