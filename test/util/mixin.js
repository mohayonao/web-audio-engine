"use strict";

const assert = require("power-assert");
const mixin = require("../../src/util/mixin");

describe("util.mixin", () => {
  describe("create mixin class", () => {
    it("works", () => {
      class A {}
      class PartialA { foo() {} }

      const MixedClass = mixin(A, PartialA);

      assert(MixedClass === A);
      assert(typeof MixedClass.prototype.foo === "function");
      assert(MixedClass.prototype.foo === PartialA.prototype.foo);
    });

    it("works with super call", () => {
      class S { bar() { return 1234; } }
      class A extends S {}
      class PartialA extends S { foo() { return super.bar() } }

      mixin(A, PartialA);

      const a = new A();

      assert(a.foo() === 1234);
    });
  });

  describe("exceptional cases", () => {
    it("throw AssertionError when superclass are unmatched", () => {
      class A {}
      class PartialA extends Number { foo() {} }

      assert.throws(() => {
        mixin(A, PartialA);
      }, assert.AssertionError);
    });

    it("throws AssertionError when property is already defined", () => {
      class A { foo() {} }
      class PartialA { foo() {} }

      assert.throws(() => {
        mixin(A, PartialA);
      }, assert.AssertionError);
    });
  });
});
