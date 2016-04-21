"use strict";

const events = require("events");

class EventTarget {
  constructor() {
    this._emitter = new events.EventEmitter();
  }

  /**
   * @param {string}   type
   * @param {function} listener
   */
  addEventListener(type, listener) {
    /* istanbul ignore else */
    if (typeof listener === "function") {
      this._emitter.addListener(type, listener);
    }
  }

  /**
   * @param {string}   type
   * @param {function} listener
   */
  removeEventListener(type, listener) {
    /* istanbul ignore else */
    if (typeof listener === "function") {
      this._emitter.removeListener(type, listener);
    }
  }

  /**
   * @param {string}   type
   * @param {function} oldListener
   * @param {function} newListener
   */
  replaceEventListener(type, oldListener, newListener) {
    this.removeEventListener(type, oldListener);
    this.addEventListener(type, newListener);
  }

  /**
   * @param {object} event
   * @param {string} event.type
   */
  dispatchEvent(event) {
    this._emitter.emit(event.type, event);
  }
}

module.exports = EventTarget;
