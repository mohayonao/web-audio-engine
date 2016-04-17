"use strict";

const util = require("../util");
const AudioScheduledSourceNode = require("./AudioScheduledSourceNode");
const AudioBuffer = require("./AudioBuffer");
const AudioBufferSourceNodeDSP = require("./dsp/AudioBufferSourceNode");

class AudioBufferSourceNode extends AudioScheduledSourceNode {
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
      this.outputs[0].setNumberOfChannels(this._audioData.numberOfChannels);
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
    if (super.start(when)) {
      offset = offset|0;
      this._offset = offset;
      if (typeof duration !== "undefined") {
        duration = Math.max(0, util.toNumber(duration));
        this._stopSample = Math.round((this._startTime + duration) * this.sampleRate);
      }
      this.dspStart();
    }
  }
}

module.exports = util.mixin(AudioBufferSourceNode, AudioBufferSourceNodeDSP);
