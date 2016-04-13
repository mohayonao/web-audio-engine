"use strict";

const util = require("../util");
const impl = require("../impl");

class PeriodicWave {
  constructor(context, opts) {
    util.defineProp(this, "_impl", new impl.PeriodicWave(context._impl, opts));
  }
}

module.exports = PeriodicWave;
