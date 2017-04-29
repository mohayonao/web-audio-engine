"use strict";

const impl = require("../impl");
const AudioNode = require("./AudioNode");

class ConvolverNode extends AudioNode {
  constructor(context, opts) {
    super(context);

    this._impl = new impl.ConvolverNode(context._impl, opts);
    this._impl.$buffer = null;

    if (opts && opts.buffer) {
      this.buffer = opts.buffer;
    }
  }

  get buffer() {
    return this._impl.$buffer;
  }

  set buffer(value) {
    this._impl.$buffer = value;
    this._impl.setBuffer(value);
  }

  get normalize() {
    return this._impl.getNormalize();
  }

  set normalize(value) {
    this._impl.setNormalize(value);
  }
}

module.exports = ConvolverNode;
