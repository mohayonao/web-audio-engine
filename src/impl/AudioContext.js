"use strict";

const assert = require("assert");
const config = require("../config");
const util = require("../util");
const EventTarget = require("./EventTarget");
const AudioDestinationNode = require("./AudioDestinationNode");
const AudioListener = require("./AudioListener");

/**
 * @prop {number} sampleRate
 * @prop {number} blockSize
 * @prop {number} numberOfChannels
 * @prop {number} currentTime
 */
class AudioContext extends EventTarget {
  /**
   * @param {object} opts
   * @param {number} opts.sampleRate
   * @param {number} opts.blockSize
   * @param {number} opts.numberOfChannels
   */
  constructor(opts) {
    super();

    opts = Object.assign({}, config, opts);

    const sampleRate = util.toValidSampleRate(opts.sampleRate);
    const blockSize = util.toValidBlockSize(opts.blockSize, sampleRate);
    const numberOfChannels = util.toValidNumberOfChannels(opts.numberOfChannels);

    this.sampleRate = sampleRate;
    this.blockSize = blockSize;
    this.numberOfChannels = numberOfChannels;
    this.currentTime = 0;
    this._destination = new AudioDestinationNode(this, { numberOfChannels });
    this._listener = new AudioListener(this);
    this._state = "suspended";
    this._scheduledSourceNodes = [];
    this._callbacksForPreProcess = [];
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
      this.addPreProcess(() => {
        this.dispatchEvent({ type: "statechange" });
        resolve();
      });
    });
  }

  /**
   * @return {Promise<void>}
   */
  notChangeState() {
    return new Promise((resolve) => {
      this.addPreProcess(resolve);
    });
  }

  /**
   * @param {AudioNode} node
   */
  addToScheduledSource(node) {
    const index = this._scheduledSourceNodes.indexOf(node);

    /* istanbul ignore else */
    if (index === -1) {
      this._scheduledSourceNodes.push(node);
    }
  }

  /**
   * @param {AudioNode} node
   */
  removeFromScheduledSource(node) {
    const index = this._scheduledSourceNodes.indexOf(node);

    /* istanbul ignore else */
    if (index === -1) {
      this._scheduledSourceNodes.splice(index, 1);
    }
  }

  /**
   * @param {function} task
   */
  addPreProcess(task) {
    assert(typeof task === "function");
    this._callbacksForPreProcess.push(task);
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
    this.callTasks(this._callbacksForPreProcess);
    this._callbacksForPreProcess = [];

    const destination = this._destination;
    const outputBus = destination.outputBus;

    if (this._state === "running") {
      const sampleRate = this.sampleRate;
      const blockSize = this.blockSize;
      const currentSample = this._currentFrameIndex * blockSize;
      const scheduledSourceNodes = this._scheduledSourceNodes;

      for (let i = scheduledSourceNodes.length - 1; i >= 0; i--) {
        if (scheduledSourceNodes[i].checkSchedule(currentSample) === "running") {
          scheduledSourceNodes.splice(i, 1);
        }
      }

      this._callbacksForPostProcess = [];

      destination.processIfNecessary(currentSample);

      this.callTasks(this._callbacksForPostProcess);
      this.currentTime = (currentSample + blockSize) / sampleRate;
      this._currentFrameIndex += 1;
    } else {
      outputBus.zeros();
    }

    return outputBus.getAudioData();
  }

  /**
   *
   */
  reset() {
    this.currentTime = 0;
    this._destination = new AudioDestinationNode(this, { numberOfChannels: this.numberOfChannels });
    this._listener = new AudioListener(this);
    this._state = "suspended";
    this._callbacksForPreProcess = [];
    this._callbacksForPostProcess = null;
    this._currentFrameIndex = 0;
  }
}

module.exports = AudioContext;
