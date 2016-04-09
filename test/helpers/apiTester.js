"use strict";

const assert = require("power-assert");
const sinon = require("sinon");
const AudioParam = require("../../src/api/AudioParam");

function makeTests(context, opts) {
  const proto = opts.class.prototype;
  const createInstance = opts.create;
  const ignored = opts.ignored || [];

  const targetPropertyNames = Object.getOwnPropertyNames(proto).filter((name) => {
    if (name === "constructor" || match(name, ignored)) {
      return false;
    }
    return true;
  });

  targetPropertyNames.forEach((name) => {
    const desc = Object.getOwnPropertyDescriptor(proto, name);

    if (/^on[a-z]+$/.test(name)) {
      it("." + name + "=", () => {
        const target = createInstance(context);

        callback(target, name);
      });
      return;
    }

    if (typeof desc.value === "function") {
      it("." + name + "()", () => {
        const target = createInstance(context);

        method(target, name);
      });
      return;
    }

    if (typeof desc.set === "function") {
      it("." + name + "=", () => {
        const target = createInstance(context);

        setter(target, name);
        getter(target, name);
      });
      return;
    }

    if (typeof desc.get === "function") {
      it("." + name, () => {
        const target = createInstance(context);

        if (target._impl["$" + name] instanceof AudioParam) {
          param(target, name);
        } else {
          getter(target, name);
        }
      });
      return;
    }
  });
}

function param(target, name) {
  const methodName = toGetMethodName(name);

  assert(typeof target._impl[methodName] === "function", `_impl.${ methodName }() not exists`);

  let retVal;

  assert.doesNotThrow(() => {
    retVal = target[name];
  }, `_impl.${ methodName }() throws`);

  assert(retVal === target._impl["$" + name]);
  assert(target._impl[methodName]() === retVal._impl);
}

function callback(target, name) {
  const callback1 = sinon.spy();
  const callback2 = sinon.spy();
  const callback3 = sinon.spy();
  const type = name.substr(2);
  const event = { type };

  target[name] = callback1;
  target[name] = callback2;
  target.addEventListener(type, callback3);
  target._impl.dispatchEvent(event);

  assert(callback1.callCount === 0);
  assert(callback2.calledWith(event));
  assert(callback3.calledWith(event));
  assert(target[name] === callback2);
}

function method(target, name) {
  const methodName = name;

  assert(typeof target._impl[methodName] === "function", `_impl.${ methodName }() not exists`);

  const spy = target._impl[methodName] = sinon.spy();
  const args = new Array(target[name].length).fill(0);

  assert.doesNotThrow(() => {
    return target[name].apply(target, args);
  }, `_impl.${ methodName }() throws`);

  assert(spy.callCount === 1, `_impl.${ methodName }() not called`);
  assert(spy.args[0].length === args.length, `_impl.${ methodName }() not provided arguments`);
}

function getter(target, name) {
  const methodName = toGetMethodName(name);

  assert(typeof target._impl[methodName] === "function", `_impl.${ methodName }() not exists`);

  const spy = target._impl[methodName] = sinon.spy(() => 0);

  let retVal;

  assert.doesNotThrow(() => {
    retVal = target[name];
  }, `_impl.${ methodName }() throws`);

  assert(spy.callCount === 1, `_impl.${ methodName }() not called`);
  assert(retVal === 0, `_impl.${ methodName }() returned no value`);
}

function setter(target, name) {
  const methodName = toSetMethodName(name);

  assert(typeof target._impl[methodName] === "function", `_impl.${ methodName }() not exists`);

  const spy = target._impl[methodName] = sinon.spy();

  assert.doesNotThrow(() => {
    return (target[name] = 0);
  }, `_impl.${ methodName }() throws`);

  assert(spy.callCount === 1, `_impl.${ methodName }() not called`);
  assert(spy.calledWith(0), `_impl.${ methodName }() called without the provided value`);
}

function match(str, candidates) {
  return candidates.some((matcher) => {
    if (typeof matcher.test === "function") {
      return matcher.test(str);
    }
    return str === matcher;
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
