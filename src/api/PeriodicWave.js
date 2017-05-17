"use strict";

const impl = require("../impl");
const { defineProp } = require("../utils");

class PeriodicWave {
  constructor(context, opts) {
    defineProp(this, "_impl", new impl.PeriodicWave(context._impl, opts));
  }
}

module.exports = PeriodicWave;
