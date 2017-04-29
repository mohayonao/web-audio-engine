"use strict";

const impl = require("../impl");
const AudioScheduledSourceNode = require("./AudioScheduledSourceNode");
const AudioParam = require("./AudioParam");

class AudioBufferSourceNode extends AudioScheduledSourceNode {
  constructor(context, opts) {
    super(context);

    this._impl = new impl.AudioBufferSourceNode(context._impl, opts);
    this._impl.$playbackRate = new AudioParam(context, this._impl.getPlaybackRate());
    this._impl.$detune = new AudioParam(context, this._impl.getDetune());
    this._impl.$buffer = null;
    this._impl.$onended = null;

    if (opts && opts.buffer) {
      this.buffer = opts.buffer;
    }
  }

  get buffer() {
    return this._impl.$buffer;
  }

  set buffer(value) {
    this._impl.$buffer = value;
    this._impl.setBuffer(value);
  }

  get playbackRate() {
    return this._impl.$playbackRate;
  }

  get detune() {
    return this._impl.$detune;
  }

  get loop() {
    return this._impl.getLoop();
  }

  set loop(value) {
    this._impl.setLoop(value);
  }

  get loopStart() {
    return this._impl.getLoopStart();
  }

  set loopStart(value) {
    this._impl.setLoopStart(value);
  }

  get loopEnd() {
    return this._impl.getLoopEnd();
  }

  set loopEnd(value) {
    this._impl.setLoopEnd(value);
  }

  start(when, offset, duration) {
    this._impl.start(when, offset, duration);
  }
}

module.exports = AudioBufferSourceNode;
