"use strict";

const util = require("../util");
const AudioSourceNode = require("./AudioSourceNode");

class AudioScheduledSourceNode extends AudioSourceNode {
  /**
   * @param {AudioContext} context
   */
  constructor(context) {
    super(context);

    this._startTime = Infinity;
    this._stopTime = Infinity;
    this._startSample = Infinity;
    this._stopSample = Infinity;
  }

  /**
   * @param {number} when
   */
  start(when) {
    /* istanbul ignore next */
    if (this._startTime !== Infinity) {
      return;
    }

    when = Math.max(this.context.currentTime, util.toNumber(when));

    this._startTime = when;
    this._startSample = Math.round(when * this.sampleRate);

    this.context.sched(when, () => {
      this.outputs[0].enable();
    });
  }

  /**
   * @param {number} when
   */
  stop(when) {
    /* istanbul ignore next */
    if (this._startTime === Infinity && this._stopTime !== Infinity) {
      return;
    }

    when = Math.max(this.context.currentTime, this._startTime, util.toNumber(when));

    this._stopTime = when;
    this._stopSample = Math.round(when * this.sampleRate);
  }
}

module.exports = AudioScheduledSourceNode;
