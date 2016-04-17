"use strict";

const util = require("../util");
const AudioSourceNode = require("./AudioSourceNode");

class AudioScheduledSourceNode extends AudioSourceNode {
  constructor(context) {
    super(context);

    this._startTime = Infinity;
    this._stopTime = Infinity;
    this._startSample = Infinity;
    this._stopSample = Infinity;
  }

  getState() {
    return this._state;
  }

  start(when) {
    /* istanbul ignore else */
    if (this._startTime === Infinity) {
      when = Math.max(this.context.currentTime, util.toNumber(when));
      this._startTime = when;
      this._startSample = Math.round(when * this.sampleRate);

      this.context.addToScheduledSource(this);

      return true;
    }

    return false;
  }

  stop(when) {
    /* istanbul ignore else */
    if (this._startTime !== Infinity && this._stopTime === Infinity) {
      when = Math.max(this.context.currentTime, this._startTime, util.toNumber(when));
      this._stopTime = when;
      this._stopSample = Math.round(when * this.sampleRate);

      return true;
    }

    return false;
  }

  checkSchedule(currentSample) {
    // timeline
    // |----------------|-------*--------|----------------|-----*----------|----------------|
    //                  |       ^                               ^          |
    //                  |       startSample                     stopSample |
    // --- suspended -->|<------------------- running -------------------->|<-- closed ------
    const nextSample = currentSample + this.blockSize;

    if (nextSample < this._startSample) {
      return "suspended";
    }

    if (this._stopSample <= currentSample) {
      return "closed";
    }

    this.outputs[0].enable();

    return "running";
  }
}

module.exports = AudioScheduledSourceNode;
