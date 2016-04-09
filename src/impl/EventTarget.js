"use strict";

const events = require("events");

class EventTarget {
  constructor() {
    this._emitter = new events.EventEmitter();
  }

  addEventListener(type, listener) {
    /* istanbul ignore else */
    if (typeof listener === "function") {
      this._emitter.addListener(type, listener);
    }
  }

  removeEventListener(type, listener) {
    /* istanbul ignore else */
    if (typeof listener === "function") {
      this._emitter.removeListener(type, listener);
    }
  }

  replaceEventListener(type, oldListener, newListener) {
    this.removeEventListener(type, oldListener);
    this.addEventListener(type, newListener);
  }

  dispatchEvent(event) {
    this._emitter.emit(event.type, event);
  }
}

module.exports = EventTarget;
