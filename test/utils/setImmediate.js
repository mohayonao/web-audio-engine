"use strict";

require("run-with-mocha");

const setImmediate = require("../../src/utils/setImmediate");

describe("utils/setImmediate(fn)", () => {
  it("works", (done) => {
    setImmediate(done);
  });
});
