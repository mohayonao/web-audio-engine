"use strict";

const impl = require("../impl");
const AudioNode = require("./AudioNode");
const AudioParam = require("./AudioParam");

class StereoPannerNode extends AudioNode {
  constructor(context) {
    super(context);

    this._impl = new impl.StereoPannerNode(context._impl);
    this._impl.$pan = new AudioParam(context, this._impl.getPan());
  }

  get pan() {
    return this._impl.$pan;
  }
}

module.exports = StereoPannerNode;
