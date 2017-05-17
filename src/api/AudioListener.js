"use strict";

const { defineProp } = require("../utils");

class AudioListener {
  constructor(context, impl) {
    defineProp(this, "_impl", impl);
  }

  setPosition(x, y, z) {
    this._impl.setPosition(x, y, z);
  }

  setOrientation(x, y, z, xUp, yUp, zUp) {
    this._impl.setOrientation(x, y, z, xUp, yUp, zUp);
  }
}

module.exports = AudioListener;
