"use strict";

const setImmediate = require("../../src/util/setImmediate");

describe("util.setImmediate(fn)", () => {
  it("works", (done) => {
    setImmediate(done);
  });
});
