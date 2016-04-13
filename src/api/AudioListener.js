"use strict";

const util = require("../util");

class AudioListener {
  constructor(context, impl) {
    util.defineProp(this, "_impl", impl);
  }

  setPosition(x, y, z) {
    this._impl.setPosition(x, y, z);
  }

  setOrientation(x, y, z, xUp, yUp, zUp) {
    this._impl.setOrientation(x, y, z, xUp, yUp, zUp);
  }
}

module.exports = AudioListener;
