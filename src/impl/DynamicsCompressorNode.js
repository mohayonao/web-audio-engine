"use strict";

const util = require("../util");
const AudioNode = require("./AudioNode");
const DynamicsCompressorNodeDSP = require("./dsp/DynamicsCompressorNode");
const { EXPLICIT } = require("../constants/ChannelCountMode");
const { CONTROL_RATE } = require("../constants/AudioParamRate");

const DEFAULT_THRESHOLD = -24;
const DEFAULT_KNEE = 30;
const DEFAULT_RATIO = 12;
const DEFAULT_ATTACK = 0.003;
const DEFAULT_RELEASE = 0.25;

class DynamicsCompressorNode extends AudioNode {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.threshold
   * @param {number}       opts.knee
   * @param {number}       opts.ratio
   * @param {number}       opts.attack
   * @param {number}       opts.release
   */
  constructor(context, opts = {}) {
    let threshold = util.defaults(opts.threshold, DEFAULT_THRESHOLD);
    let knee = util.defaults(opts.knee, DEFAULT_KNEE);
    let ratio = util.defaults(opts.ratio, DEFAULT_RATIO);
    let attack = util.defaults(opts.attack, DEFAULT_ATTACK);
    let release = util.defaults(opts.release, DEFAULT_RELEASE);

    super(context, opts, {
      inputs: [ 1 ],
      outputs: [ 2 ],
      channelCount: 2,
      channelCountMode: EXPLICIT
    });

    this._threshold = this.addParam(CONTROL_RATE, threshold);
    this._knee = this.addParam(CONTROL_RATE, knee);
    this._ratio = this.addParam(CONTROL_RATE, ratio);
    this._attack = this.addParam(CONTROL_RATE, attack);
    this._release = this.addParam(CONTROL_RATE, release);
  }

  /**
   * @param {AudioParam}
   */
  getThreshold() {
    return this._threshold;
  }

  /**
   * @param {AudioParam}
   */
  getKnee() {
    return this._knee;
  }

  /**
   * @param {AudioParam}
   */
  getRatio() {
    return this._ratio;
  }

  /**
   * @return {number}
   */
  /* istanbul ignore next */
  getReduction() {
    throw new TypeError("NOT YET IMPLEMENTED");
  }

  /**
   * @param {AudioParam}
   */
  getAttack() {
    return this._attack;
  }

  /**
   * @param {AudioParam}
   */
  getRelease() {
    return this._release;
  }
}

Object.assign(DynamicsCompressorNode.prototype, DynamicsCompressorNodeDSP);

module.exports = DynamicsCompressorNode;
