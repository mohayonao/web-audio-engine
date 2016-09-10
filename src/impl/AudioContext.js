"use strict";

const assert = require("assert");
const util = require("../util");
const config = require("../config");
const EventTarget = require("./EventTarget");
const AudioDestinationNode = require("./AudioDestinationNode");
const AudioListener = require("./AudioListener");

/**
 * @prop {number} sampleRate
 * @prop {number} blockSize
 * @prop {number} numberOfChannels
 * @prop {number} currentTime
 * @prop {number} currentSampleFrame
 */
class AudioContext extends EventTarget {
  /**
   * @param {object} opts
   * @param {number} opts.sampleRate
   * @param {number} opts.blockSize
   * @param {number} opts.numberOfChannels
   */
  constructor(opts = {}) {
    super();

    let sampleRate = util.defaults(opts.sampleRate, config.sampleRate);
    let blockSize = util.defaults(opts.blockSize, config.blockSize);
    let numberOfChannels = util.defaults(opts.channels || opts.numberOfChannels, config.numberOfChannels);

    sampleRate = util.toValidSampleRate(sampleRate);
    blockSize = util.toValidBlockSize(blockSize);
    numberOfChannels = util.toValidNumberOfChannels(numberOfChannels);

    this.sampleRate = sampleRate|0;
    this.blockSize = blockSize|0;
    this.numberOfChannels = numberOfChannels|0;
    this.currentTime = 0;
    this.currentSampleFrame = 0;
    this.state = "suspended";
    this._destination = new AudioDestinationNode(this, { numberOfChannels });
    this._listener = new AudioListener(this);
    this._sched = {};
    this._callbacksForPostProcess = null;
    this._currentFrameIndex = 0;
  }

  /**
   * @return {AudioDestinationNode}
   */
  getDestination() {
    return this._destination;
  }

  /**
   * @return {number}
   */
  getSampleRate() {
    return this.sampleRate;
  }

  /**
   * @return {number}
   */
  getCurrentTime() {
    return this.currentTime;
  }

  /**
   * @return {AudioListener}
   */
  getListener() {
    return this._listener;
  }

  /**
   * @return {string}
   */
  getState() {
    return this.state;
  }

  /**
   * @return {Promise<void>}
   */
  suspend() {
    if (this.state === "running") {
      return this.changeState("suspended");
    }
    return this.notChangeState();
  }

  /**
   * @return {Promise<void>}
   */
  resume() {
    if (this.state === "suspended") {
      return this.changeState("running");
    }
    return this.notChangeState();
  }

  /**
   * @return {Promise<void>}
   */
  close() {
    if (this.state !== "closed") {
      return this.changeState("closed");
    }
    return this.notChangeState();
  }

  /**
   * @param {string} state
   * @return {Promise<void>}
   */
  changeState(state) {
    this.state = state;
    return new Promise((resolve) => {
      this.dispatchEvent({ type: "statechange" });
      resolve();
    });
  }

  /**
   * @return {Promise<void>}
   */
  notChangeState() {
    return Promise.resolve();
  }

  /**
   * @param {number}   time
   * @param {function} task
   */
  sched(time, task) {
    const schedSampleFrame = (Math.floor((time * this.sampleRate) / this.blockSize) * this.blockSize)|0;

    if (!this._sched[schedSampleFrame]) {
      this._sched[schedSampleFrame] = [ task ];
    } else {
      this._sched[schedSampleFrame].push(task);
    }
  }

  /**
   * @param {function} task
   */
  addPostProcess(task) {
    assert(typeof task === "function");
    if (this._callbacksForPostProcess === null) {
      this._callbacksForPostProcess = [ task ];
    } else {
      this._callbacksForPostProcess.push(task);
    }
  }

  /**
   * @param {Float32Array[]} channelData
   * @param {number}         offset
   */
  process(channelData, offset) {
    const destination = this._destination;

    if (this.state !== "running") {
      const numberOfChannels = channelData.length;
      const offsetEnd = offset + this.blockSize;

      for (let ch = 0; ch < numberOfChannels; ch++) {
        util.fillRange(channelData[ch], offset, offsetEnd);
      }
    } else {
      const sched = this._sched;
      const currentSampleFrame = this.currentSampleFrame|0;

      if (sched[currentSampleFrame]) {
        const tasks = sched[currentSampleFrame];

        for (let i = 0, imax = tasks.length; i < imax; i++) {
          tasks[i]();
        }

        delete sched[currentSampleFrame];
      }

      destination.process(channelData, offset);

      if (this._callbacksForPostProcess !== null) {
        const tasks = this._callbacksForPostProcess;

        for (let i = 0, imax = tasks.length; i < imax; i++) {
          tasks[i]();
        }

        this._callbacksForPostProcess = null;
      }

      this.currentSampleFrame += this.blockSize;
      this.currentTime = this.currentSampleFrame / this.sampleRate;
    }
  }

  /**
   *
   */
  reset() {
    this.currentTime = 0;
    this.currentSampleFrame = 0;
    this.state = "suspended";
    this._destination = new AudioDestinationNode(this, { numberOfChannels: this.numberOfChannels });
    this._listener = new AudioListener(this);
    this._sched = [];
    this._callbacksForPostProcess = null;
  }
}

module.exports = AudioContext;
