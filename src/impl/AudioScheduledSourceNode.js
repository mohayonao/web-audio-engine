"use strict";

const util = require("../util");
const AudioSourceNode = require("./AudioSourceNode");
const { UNSCHEDULED, SCHEDULED, PLAYING, FINISHED } = require("../constants/PlaybackState");

class AudioScheduledSourceNode extends AudioSourceNode {
  /**
   * @param {AudioContext} context
   */
  constructor(context, opts) {
    super(context, opts);

    this._startTime = Infinity;
    this._stopTime = Infinity;
    this._startFrame = Infinity;
    this._stopFrame = Infinity;
  }

  /**
   * @return {number}
   */
  getStartTime() {
    if (this._startTime !== Infinity) {
      return this._startTime;
    }
  }

  /**
   * @return {number}
   */
  getStopTime() {
    if (this._stopTime !== Infinity) {
      return this._stopTime;
    }
  }

  /**
   * @return {string}
   */
  getPlaybackState() {
    if (this._startTime === Infinity) {
      return UNSCHEDULED;
    }
    if (this.context.currentTime < this._startTime) {
      return SCHEDULED;
    }
    if (this._stopTime <= this.context.currentTime) {
      return FINISHED;
    }
    return PLAYING;
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
    this._startFrame = Math.round(when * this.sampleRate);

    this.context.sched(when, () => {
      this.outputs[0].enable();
    });
  }

  /**
   * @param {number} when
   */
  stop(when) {
    /* istanbul ignore next */
    if (this._stopTime !== Infinity) {
      return;
    }

    when = Math.max(this.context.currentTime, this._startTime, util.toNumber(when));

    this._stopTime = when;
    this._stopFrame = Math.round(when * this.sampleRate);
  }
}

module.exports = AudioScheduledSourceNode;
