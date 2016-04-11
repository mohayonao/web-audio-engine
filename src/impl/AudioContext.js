"use strict";

const assert = require("power-assert");
const config = require("../config");
const util = require("../util");
const EventTarget = require("./EventTarget");
const AudioDestinationNode = require("./AudioDestinationNode");
const AudioListener = require("./AudioListener");

class AudioContext extends EventTarget {
  constructor(opts) {
    super();

    opts = Object.assign({}, config, opts);

    const sampleRate = util.toValidSampleRate(opts.sampleRate);
    const processingSizeInFrames = util.toValidProcessingSizeInFrames(opts.processingSizeInFrames, sampleRate);
    const numberOfChannels = util.toValidNumberOfChannels(opts.numberOfChannels);

    this.sampleRate = sampleRate;
    this.processingSizeInFrames = processingSizeInFrames;
    this.numberOfChannels = numberOfChannels;
    this.currentTime = 0;
    this._destination = new AudioDestinationNode(this, { numberOfChannels });
    this._listener = new AudioListener(this);
    this._state = "suspended";
    this._callbacksForPreProcess = [];
    this._callbacksForPostProcess = null;
    this._procTicks = 0;
  }

  getDestination() {
    return this._destination;
  }

  getSampleRate() {
    return this.sampleRate;
  }

  getCurrentTime() {
    return this.currentTime;
  }

  getListener() {
    return this._listener;
  }

  getState() {
    return this._state;
  }

  suspend() {
    if (this._state === "running") {
      return this.changeState("suspended");
    }
    return this.notChangeState();
  }

  resume() {
    if (this._state === "suspended") {
      return this.changeState("running");
    }
    return this.notChangeState();
  }

  close() {
    if (this._state !== "closed") {
      return this.changeState("closed");
    }
    return this.notChangeState();
  }

  changeState(state) {
    this._state = state;
    return new Promise((resolve) => {
      this.addPreProcess(() => {
        this.dispatchEvent({ type: "statechange" });
        resolve();
      });
    });
  }

  notChangeState() {
    return new Promise((resolve) => {
      this.addPreProcess(resolve);
    });
  }

  addPreProcess(task) {
    assert(typeof task === "function");
    this._callbacksForPreProcess.push(task);
  }

  addPostProcess(task) {
    assert(typeof task === "function");
    this._callbacksForPostProcess.push(task);
  }

  callTasks(tasks) {
    for (let i = 0, imax = tasks.length; i < imax; i++) {
      tasks[i]();
    }
  }

  process() {
    this.callTasks(this._callbacksForPreProcess);
    this._callbacksForPreProcess = [];

    const destination = this._destination;
    const outputBus = destination.getOutput(0).getAudioBus();

    if (this._state === "running") {
      const sampleRate = this.sampleRate;
      const inNumSamples = this.processingSizeInFrames;
      const currentTime = this.currentTime;
      const nextCurrentTime = currentTime + (inNumSamples / sampleRate);
      const procItem = { sampleRate, inNumSamples, currentTime, nextCurrentTime };

      this._callbacksForPostProcess = [];

      destination.processIfNecessary(procItem);

      this.callTasks(this._callbacksForPostProcess);
      this._procTicks += 1;
      this.currentTime = (this._procTicks * inNumSamples) / sampleRate;
    } else {
      outputBus.zeros();
    }

    return outputBus.getAudioData();
  }

  reset() {
    this.currentTime = 0;
    this._destination = new AudioDestinationNode(this, { numberOfChannels: this.numberOfChannels });
    this._listener = new AudioListener(this);
    this._state = "suspended";
    this._callbacksForPreProcess = [];
    this._callbacksForPostProcess = null;
    this._procTicks = 0;
  }
}

module.exports = AudioContext;
