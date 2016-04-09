"use strict";

const util = require("../_util");
const AudioSourceNode = require("./AudioSourceNode");
const AudioBuffer = require("./AudioBuffer");

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
    this._startTime = -1;
    this._stopTime = -1;
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

  start(when) {
    /* istanbul ignore else */
    if (this._startTime === -1) {
      when = Math.max(this.context.currentTime, util.toNumber(when));
      this._startTime = when;
      this.getOutput(0).enable();
    }
  }

  stop(when) {
    /* istanbul ignore else */
    if (this._startTime !== -1 && this._stopTime === -1) {
      when = Math.max(this.context.currentTime, this._startTime, util.toNumber(when));
      this._stopTime = when;
    }
  }
}

module.exports = AudioBufferSourceNode;
