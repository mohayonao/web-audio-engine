"use strict";

const BasePannerNode = require("./BasePannerNode");

class StereoPannerNode extends BasePannerNode {
  constructor(context) {
    super(context);
    this._pan = this.addParam("audio", 0);
  }

  getPan() {
    return this._pan;
  }
}

module.exports = StereoPannerNode;
