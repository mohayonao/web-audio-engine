"use strict";

require("run-with-mocha");

const assert = require("assert");
const defineProp = require("../../../src/utils/utils/defineProp");

describe("utils/defineProp", () => {
  it("define property", () => {
    const a = {};

    defineProp(a, "value", 100);

    assert(a.value === 100);
  });

  it("not enumerable", () => {
    const a = {};

    defineProp(a, "value", 100);

    assert(Object.keys(a).length === 0);
  });

  it("writable", () => {
    const a = {};

    defineProp(a, "value", 100);

    a.value = 200;
    assert(a.value === 200);
  });

  it("configurable", () => {
    const a = {};

    defineProp(a, "value", 100);
    defineProp(a, "value", 300);

    assert(a.value === 300);
  });
});
