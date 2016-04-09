"use strict";

const impl = require("../impl");

class PeriodicWave {
  constructor(context, opts) {
    this._impl = new impl.PeriodicWave(context._impl, opts);
  }
}

module.exports = PeriodicWave;
