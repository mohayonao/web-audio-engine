"use strict";

const util = require("../util");
const AudioSourceNode = require("./AudioSourceNode");
const AudioBuffer = require("./AudioBuffer");
const AudioBufferSourceNodeDSP = require("./dsp/AudioBufferSourceNode");

class AudioBufferSourceNode extends AudioSourceNode {
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
    this._startTime = Infinity;
    this._stopTime = Infinity;
    this._implicitStopTime = Infinity;
  }

  getBuffer() {
    return this._buffer;
  }

  setBuffer(value) {
    value = util.toImpl(value);

    /* istanbul ignore else */
    if (value instanceof AudioBuffer) {
      this._buffer = value;
      this._audioData = this._buffer.getAudioData();
      this.getOutput(0).setNumberOfChannels(this._audioData.numberOfChannels);
    }
  }

  getPlaybackRate() {
    return this._playbackRate;
  }

  getDetune() {
    return this._detune;
  }

  getLoop() {
    return this._loop;
  }

  setLoop(value) {
    this._loop = !!value;
  }

  getLoopStart() {
    return this._loopStart;
  }

  setLoopStart(value) {
    value = Math.max(0, util.toNumber(value));
    this._loopStart = value;
  }

  getLoopEnd() {
    return this._loopEnd;
  }

  setLoopEnd(value) {
    value = Math.max(0, util.toNumber(value));
    this._loopEnd = value;
  }

  start(when, offset, duration) {
    /* istanbul ignore else */
    if (this._startTime === Infinity && this._audioData !== null) {
      when = Math.max(this.context.currentTime, util.toNumber(when));
      offset = offset|0;
      this._startTime = when;
      this._offset = offset;
      if (typeof duration !== "undefined") {
        duration = Math.max(0, util.toNumber(duration));
        this._implicitStopTime = when + duration;
      }
      this.dspStart();
      this.getOutput(0).enable();
    }
  }

  stop(when) {
    /* istanbul ignore else */
    if (this._startTime !== Infinity && this._stopTime === Infinity) {
      when = Math.max(this.context.currentTime, this._startTime, util.toNumber(when));
      this._stopTime = when;
      this._implicitStopTime = Math.min(this._implicitStopTime, when);
    }
  }
}

module.exports = util.mixin(AudioBufferSourceNode, AudioBufferSourceNodeDSP);
