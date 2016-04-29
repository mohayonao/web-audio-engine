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
  constructor(opts) {
    opts = opts || /* istanbul ignore next */ {};

    super();

    let sampleRate = util.defaults(opts.sampleRate, config.sampleRate);
    let blockSize = util.defaults(opts.blockSize, config.blockSize);
    let numberOfChannels = util.defaults(opts.channels || opts.numberOfChannels, config.numberOfChannels);

    sampleRate = util.toValidSampleRate(opts.sampleRate);
    blockSize = util.toValidBlockSize(opts.blockSize, sampleRate);
    numberOfChannels = util.toValidNumberOfChannels(opts.numberOfChannels);

    this.sampleRate = sampleRate;
    this.blockSize = blockSize;
    this.numberOfChannels = numberOfChannels;
    this.currentTime = 0;
    this.currentSampleFrame = 0;
    this._destination = new AudioDestinationNode(this, { numberOfChannels });
    this._listener = new AudioListener(this);
    this._state = "suspended";
    this._sched = [];
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
    return this._state;
  }

  /**
   * @return {Promise<void>}
   */
  suspend() {
    if (this._state === "running") {
      return this.changeState("suspended");
    }
    return this.notChangeState();
  }

  /**
   * @return {Promise<void>}
   */
  resume() {
    if (this._state === "suspended") {
      return this.changeState("running");
    }
    return this.notChangeState();
  }

  /**
   * @return {Promise<void>}
   */
  close() {
    if (this._state !== "closed") {
      return this.changeState("closed");
    }
    return this.notChangeState();
  }

  /**
   * @param {string} state
   * @return {Promise<void>}
   */
  changeState(state) {
    this._state = state;
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
    const deltaTime = Math.max(0, time - this.currentTime);
    const schedIndex = Math.floor((deltaTime * this.sampleRate) / this.blockSize);

    if (!this._sched[schedIndex]) {
      this._sched[schedIndex] = [ task ];
    } else {
      this._sched[schedIndex].push(task);
    }
  }

  /**
   * @param {function} task
   */
  addPostProcess(task) {
    assert(typeof task === "function");
    this._callbacksForPostProcess.push(task);
  }

  /**
   * @param {function[]} tasks
   */
  callTasks(tasks) {
    for (let i = 0, imax = tasks.length; i < imax; i++) {
      tasks[i]();
    }
  }

  /**
   *
   */
  process() {
    const destination = this._destination;
    const outputBus = destination.outputBus;

    if (this._state !== "running") {
      outputBus.zeros();
    } else {
      const tasks = this._sched.shift();

      if (tasks) {
        this.callTasks(tasks);
      }

      this._callbacksForPostProcess = [];

      destination.processIfNecessary();

      this.callTasks(this._callbacksForPostProcess);
      this.currentSampleFrame += this.blockSize;
      this.currentTime = this.currentSampleFrame / this.sampleRate;
    }

    return outputBus.audioData;
  }

  /**
   *
   */
  reset() {
    this.currentTime = 0;
    this.currentSampleFrame = 0;
    this._destination = new AudioDestinationNode(this, { numberOfChannels: this.numberOfChannels });
    this._listener = new AudioListener(this);
    this._state = "suspended";
    this._sched = [];
    this._callbacksForPostProcess = null;
  }
}

module.exports = AudioContext;
