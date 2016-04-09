"use strict";

const impl = require("../impl");
const AudioNode = require("./AudioNode");
const AudioParam = require("./AudioParam");

class AudioBufferSourceNode extends AudioNode {
  constructor(context, opts) {
    super(context);

    this._impl = new impl.AudioBufferSourceNode(context._impl, opts);
    this._impl.$playbackRate = new AudioParam(context, this._impl.getPlaybackRate());
    this._impl.$detune = new AudioParam(context, this._impl.getDetune());
    this._impl.$buffer = null;
    this._impl.$onended = null;
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

  get onended() {
    return this._impl.$onended;
  }

  set onended(callback) {
    this._impl.replaceEventListener("ended", this._impl.$onended, callback);
    this._impl.$onended = callback;
  }

  start(when, offset, duration) {
    this._impl.start(when, offset, duration);
  }

  stop(when) {
    this._impl.stop(when);
  }
}

module.exports = AudioBufferSourceNode;
