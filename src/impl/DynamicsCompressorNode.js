"use strict";

const AudioNode = require("./AudioNode");

class DynamicsCompressorNode extends AudioNode {
  constructor(context) {
    super(context, {
      inputs: [ 1 ],
      outputs: [ 2 ],
      channelCount: 2,
      channelCountMode: "explicit"
    });
    this._threshold = this.addParam("control", -24);
    this._knee = this.addParam("control", 30);
    this._ratio = this.addParam("control", 12);
    this._attack = this.addParam("control", 0.003);
    this._release = this.addParam("control", 0.250);
  }

  getThreshold() {
    return this._threshold;
  }

  getKnee() {
    return this._knee;
  }

  getRatio() {
    return this._ratio;
  }

  /* istanbul ignore next */
  getReduction() {
    throw new TypeError("NOT YET IMPLEMENTED");
  }

  getAttack() {
    return this._attack;
  }

  getRelease() {
    return this._release;
  }

  dspProcess() {
    const inputBus = this.getInput(0).getAudioBus();
    const outputBus = this.getOutput(0).getAudioBus();

    outputBus.zeros();
    outputBus.sumFrom(inputBus);
  }
}

module.exports = DynamicsCompressorNode;
