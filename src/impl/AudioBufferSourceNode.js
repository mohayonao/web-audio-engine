"use strict";

const util = require("../util");
const AudioScheduledSourceNode = require("./AudioScheduledSourceNode");
const AudioBuffer = require("./AudioBuffer");
const AudioBufferSourceNodeDSP = require("./dsp/AudioBufferSourceNode");

class AudioBufferSourceNode extends AudioScheduledSourceNode {
  /**
   * @param {AudioContext} context
   */
  constructor(context) {
    super(context);
    this._buffer = null;
    this._audioData = null;
    this._playbackRate = this.addParam("control", 1);
    this._detune = this.addParam("control", 0);
    this._loop = false;
    this._loopStart = 0;
    this._loopEnd = 0;
    this._offset = 0;
    this._duration = Infinity;
    this._done = false;
  }

  /**
   * @return {AudioBuffer}
   */
  getBuffer() {
    return this._buffer;
  }

  /**
   * @param {AudioBuffer} value
   */
  setBuffer(value) {
    value = util.toImpl(value);

    /* istanbul ignore else */
    if (value instanceof AudioBuffer) {
      this._buffer = value;
      this._audioData = this._buffer.audioData;
      this.outputs[0].setNumberOfChannels(this._audioData.numberOfChannels);
    }
  }

  /**
   * @return {number}
   */
  getStartOffset() {
    return this._offset;
  }

  /**
   * @return {number}
   */
  getStartDuration() {
    if (this._duration !== Infinity) {
      return this._duration;
    }
  }

  /**
   * @return {string}
   */
  getPlaybackState() {
    if (this._done) {
      return "finished";
    }
    return super.getPlaybackState();
  }

  /**
   * @return {AudioParam}
   */
  getPlaybackRate() {
    return this._playbackRate;
  }

  /**
   * @return {AudioParam}
   */
  getDetune() {
    return this._detune;
  }

  /**
   * @return {boolean}
   */
  getLoop() {
    return this._loop;
  }

  /**
   * @param {boolean}
   */
  setLoop(value) {
    this._loop = !!value;
  }

  /**
   * @return {number}
   */
  getLoopStart() {
    return this._loopStart;
  }

  /**
   * @param {number} value
   */
  setLoopStart(value) {
    value = Math.max(0, util.toNumber(value));
    this._loopStart = value;
  }

  /**
   * @return {number}
   */
  getLoopEnd() {
    return this._loopEnd;
  }

  /**
   * @param {number} value
   */
  setLoopEnd(value) {
    value = Math.max(0, util.toNumber(value));
    this._loopEnd = value;
  }

  /**
   * @param {number} when
   * @param {number} offset
   * @param {number} duration
   */
  start(when, offset, duration) {
    /* istanbul ignore next */
    if (this._startTime !== Infinity) {
      return;
    }

    offset = util.defaults(offset, 0);
    duration = util.defaults(duration, Infinity);

    when = Math.max(this.context.currentTime, util.toNumber(when));
    offset = Math.max(0, offset);
    duration = Math.max(0, util.toNumber(duration));

    this._startTime = when;
    this._startFrame = Math.round(when * this.sampleRate);
    this._offset = offset;

    if (duration !== Infinity) {
      this._duration = duration;
      this._stopFrame = Math.round((this._startTime + duration) * this.sampleRate);
    }

    this.context.sched(when, () => {
      this.dspStart();
      this.outputs[0].enable();
    });
  }
}

Object.assign(AudioBufferSourceNode.prototype, AudioBufferSourceNodeDSP);

module.exports = AudioBufferSourceNode;
