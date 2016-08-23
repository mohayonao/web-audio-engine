"use strict";

require("run-with-mocha");

const assert = require("power-assert");
const defineProp = require("../../src/util/defineProp");

describe("util.defineProp", () => {
  let a;

  beforeEach(() => {
    a = {};
    defineProp(a, "value", 100);
  });

  it("define property", () => {
    assert(a.value === 100);
  });

  it("not enumerable", () => {
    assert(Object.keys(a).length === 0);
  });

  it("writable", () => {
    a.value = 200;
    assert(a.value === 200);
  });

  it("configurable", () => {
    defineProp(a, "value", 300);
    assert(a.value === 300);
  });
});
