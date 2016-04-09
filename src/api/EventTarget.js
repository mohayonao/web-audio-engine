"use strict";

class EventTarget {
  addEventListener(type, listener) {
    this._impl.addEventListener(type, listener);
  }

  removeEventListener(type, listener) {
    this._impl.removeEventListener(type, listener);
  }
}

module.exports = EventTarget;
