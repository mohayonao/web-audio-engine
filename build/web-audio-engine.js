(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.WebAudioEngine = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(require,module,exports){
(function (global){
"use strict";

var formats = {
  0x0001: "lpcm",
  0x0003: "lpcm"
};

function decode(buffer) {
  if (global.Buffer && buffer instanceof global.Buffer) {
    buffer = Uint8Array.from(buffer).buffer;
  }

  return new Promise(function(resolve, reject) {
    var dataView = new DataView(buffer);
    var reader = createReader(dataView);

    if (reader.string(4) !== "RIFF") {
      return reject(new TypeError("Invalid WAV file"));
    }

    reader.uint32(); // skip file length

    if (reader.string(4) !== "WAVE") {
      return reject(new TypeError("Invalid WAV file"));
    }

    var format = null;
    var audioData = null;

    do {
      var chunkType = reader.string(4);
      var chunkSize = reader.uint32();

      switch (chunkType) {
      case "fmt ":
        format = decodeFormat(reader, chunkSize);
        if (format instanceof Error) {
          return reject(format);
        }
        break;
      case "data":
        audioData = decodeData(reader, chunkSize, format);
        if (audioData instanceof Error) {
          return reject(format);
        }
        break;
      default:
        reader.skip(chunkSize);
        break;
      }
    } while (audioData === null);

    resolve(audioData);
  });
}

function decodeFormat(reader, chunkSize) {
  var formatId = reader.uint16();

  if (!formats.hasOwnProperty(formatId)) {
    return new TypeError("Unsupported format in WAV file: 0x" + formatId.toString(16));
  }

  var format = {
    formatId: formatId,
    floatingPoint: formatId === 0x0003,
    numberOfChannels: reader.uint16(),
    sampleRate: reader.uint32(),
    byteRate: reader.uint32(),
    blockSize: reader.uint16(),
    bitDepth: reader.uint16()
  };
  reader.skip(chunkSize - 16);

  return format;
}

function decodeData(reader, chunkSize, format) {
  var length = Math.floor(chunkSize / format.blockSize);
  var numberOfChannels = format.numberOfChannels;
  var sampleRate = format.sampleRate;
  var channelData = new Array(numberOfChannels);

  for (var ch = 0; ch < numberOfChannels; ch++) {
    channelData[ch] = new Float32Array(length);
  }

  var retVal = readPCM(reader, channelData, length, format);

  if (retVal instanceof Error) {
    return retVal;
  }

  return {
    numberOfChannels: numberOfChannels,
    length: length,
    sampleRate: sampleRate,
    channelData: channelData
  };
}

function readPCM(reader, channelData, length, format) {
  var bitDepth = format.bitDepth;
  var floatingPoint = format.floatingPoint ? "f" : "";
  var methodName = "pcm" + bitDepth + floatingPoint;

  if (!reader[methodName]) {
    return new TypeError("Not supported bit depth: " + format.bitDepth);
  }

  var read = reader[methodName].bind(reader);
  var numberOfChannels = format.numberOfChannels;

  for (var i = 0; i < length; i++) {
    for (var ch = 0; ch < numberOfChannels; ch++) {
      channelData[ch][i] = read();
    }
  }

  return null;
}

function createReader(dataView) {
  var pos = 0;

  return {
    skip: function(n) {
      pos += n;
    },
    uint8: function() {
      var data = dataView.getUint8(pos, true);

      pos += 1;

      return data;
    },
    int16: function() {
      var data = dataView.getInt16(pos, true);

      pos += 2;

      return data;
    },
    uint16: function() {
      var data = dataView.getUint16(pos, true);

      pos += 2;

      return data;
    },
    uint32: function() {
      var data = dataView.getUint32(pos, true);

      pos += 4;

      return data;
    },
    string: function(n) {
      var data = "";

      for (var i = 0; i < n; i++) {
        data += String.fromCharCode(this.uint8());
      }

      return data;
    },
    pcm8: function() {
      var data = dataView.getUint8(pos) - 128;

      pos += 1;

      return data < 0 ? data / 128 : data / 127;
    },
    pcm16: function() {
      var data = dataView.getInt16(pos, true);

      pos += 2;

      return data < 0 ? data / 32768 : data / 32767;
    },
    pcm24: function() {
      var x0 = dataView.getUint8(pos + 0);
      var x1 = dataView.getUint8(pos + 1);
      var x2 = dataView.getUint8(pos + 2);
      var xx = (x0 + (x1 << 8) + (x2 << 16));
      var data = xx > 0x800000 ? xx - 0x1000000 : xx;

      pos += 3;

      return data < 0 ? data / 8388608 : data / 8388607;
    },
    pcm32: function() {
      var data = dataView.getInt32(pos, true);

      pos += 4;

      return data < 0 ? data / 2147483648 : data / 2147483647;
    },
    pcm32f: function() {
      var data = dataView.getFloat32(pos, true);

      pos += 4;

      return data;
    },
    pcm64f: function() {
      var data = dataView.getFloat64(pos, true);

      pos += 8;

      return data;
    }
  };
}

module.exports.decode = decode;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
"use strict";

function encode(audioData, opts) {
  opts = opts || {};

  return new Promise(function(resolve, reject) {
    audioData = toAudioData(audioData);

    if (audioData === null) {
      return reject(new TypeError("Invalid AudioData"));
    }

    var floatingPoint = !!(opts.floatingPoint || opts.float);
    var bitDepth = floatingPoint ? 32 : ((opts.bitDepth|0) || 16);
    var bytes = bitDepth >> 3;
    var length = audioData.length * audioData.numberOfChannels * bytes;
    var dataView = new DataView(new Uint8Array(44 + length).buffer);
    var writer = createWriter(dataView);

    var format = {
      formatId: floatingPoint ? 0x0003 : 0x0001,
      floatingPoint: floatingPoint,
      numberOfChannels: audioData.numberOfChannels,
      sampleRate: audioData.sampleRate,
      bitDepth: bitDepth
    };

    writeHeader(writer, format, dataView.buffer.byteLength - 8);

    var err = writeData(writer, format, length, audioData);

    if (err instanceof Error) {
      return reject(err);
    }

    resolve(dataView.buffer);
  });
}

function toAudioData(data) {
  var audioData = {};

  if (typeof data.sampleRate !== "number") {
    return null;
  }
  if (!Array.isArray(data.channelData)) {
    return null;
  }
  if (!(data.channelData[0] instanceof Float32Array)) {
    return null;
  }

  audioData.numberOfChannels = data.channelData.length;
  audioData.length = data.channelData[0].length|0;
  audioData.sampleRate = data.sampleRate|0;
  audioData.channelData = data.channelData;

  return audioData;
}

function writeHeader(writer, format, length) {
  var bytes = format.bitDepth >> 3;

  writer.string("RIFF");
  writer.uint32(length);
  writer.string("WAVE");

  writer.string("fmt ");
  writer.uint32(16);
  writer.uint16(format.floatingPoint ? 0x0003 : 0x0001);
  writer.uint16(format.numberOfChannels);
  writer.uint32(format.sampleRate);
  writer.uint32(format.sampleRate * format.numberOfChannels * bytes);
  writer.uint16(format.numberOfChannels * bytes);
  writer.uint16(format.bitDepth);
}

function writeData(writer, format, length, audioData) {
  var bitDepth = format.bitDepth;
  var floatingPoint = format.floatingPoint ? "f" : "";
  var methodName = "pcm" + bitDepth + floatingPoint;

  if (!writer[methodName]) {
    return new TypeError("Not supported bit depth: " + bitDepth);
  }

  var write = writer[methodName].bind(writer);
  var numberOfChannels = format.numberOfChannels;
  var channelData = audioData.channelData;

  writer.string("data");
  writer.uint32(length);

  for (var i = 0, imax = audioData.length; i < imax; i++) {
    for (var ch = 0; ch < numberOfChannels; ch++) {
      write(channelData[ch][i]);
    }
  }
}

function createWriter(dataView) {
  var pos = 0;

  return {
    int16: function(value) {
      dataView.setInt16(pos, value, true);
      pos += 2;
    },
    uint16: function(value) {
      dataView.setUint16(pos, value, true);
      pos += 2;
    },
    uint32: function(value) {
      dataView.setUint32(pos, value, true);
      pos += 4;
    },
    string: function(value) {
      for (var i = 0, imax = value.length; i < imax; i++) {
        dataView.setUint8(pos++, value.charCodeAt(i));
      }
    },
    pcm8: function(value) {
      value = Math.max(-1, Math.min(value, +1));
      value = (value * 0.5 + 0.5) * 255;
      dataView.setUint8(pos, value|0, true);
      pos += 1;
    },
    pcm16: function(value) {
      value = Math.max(-1, Math.min(value, +1));
      value = value < 0 ? value * 32768 : value * 32767;
      dataView.setInt16(pos, value|0, true);
      pos += 2;
    },
    pcm24: function(value) {
      value = Math.max(-1, Math.min(value, +1));
      value = value < 0 ? 0x1000000 + value * 8388608 : value * 8388607;
      value = value|0;

      var x0 = (value >>  0) & 0xFF;
      var x1 = (value >>  8) & 0xFF;
      var x2 = (value >> 16) & 0xFF;

      dataView.setUint8(pos + 0, x0);
      dataView.setUint8(pos + 1, x1);
      dataView.setUint8(pos + 2, x2);
      pos += 3;
    },
    pcm32: function(value) {
      value = Math.max(-1, Math.min(value, +1));
      value = value < 0 ? value * 2147483648 : value * 2147483647;
      dataView.setInt32(pos, value|0, true);
      pos += 4;
    },
    pcm32f: function(value) {
      dataView.setFloat32(pos, value, true);
      pos += 4;
    }
  };
}

module.exports.encode = encode;

},{}],4:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var impl = require("../impl");
var AudioNode = require("./AudioNode");

var AnalyserNode = function (_AudioNode) {
  _inherits(AnalyserNode, _AudioNode);

  function AnalyserNode(context, opts) {
    _classCallCheck(this, AnalyserNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AnalyserNode).call(this, context));

    _this._impl = new impl.AnalyserNode(context._impl, opts);
    return _this;
  }

  _createClass(AnalyserNode, [{
    key: "getFloatFrequencyData",
    value: function getFloatFrequencyData(array) {
      this._impl.getFloatFrequencyData(array);
    }
  }, {
    key: "getByteFrequencyData",
    value: function getByteFrequencyData(array) {
      this._impl.getByteFrequencyData(array);
    }
  }, {
    key: "getFloatTimeDomainData",
    value: function getFloatTimeDomainData(array) {
      this._impl.getFloatTimeDomainData(array);
    }
  }, {
    key: "getByteTimeDomainData",
    value: function getByteTimeDomainData(array) {
      this._impl.getByteTimeDomainData(array);
    }
  }, {
    key: "fftSize",
    get: function get() {
      return this._impl.getFftSize();
    },
    set: function set(value) {
      this._impl.setFftSize(value);
    }
  }, {
    key: "frequencyBinCount",
    get: function get() {
      return this._impl.getFrequencyBinCount();
    }
  }, {
    key: "minDecibels",
    get: function get() {
      return this._impl.getMinDecibels();
    },
    set: function set(value) {
      this._impl.setMinDecibels(value);
    }
  }, {
    key: "maxDecibels",
    get: function get() {
      return this._impl.getMaxDecibels();
    },
    set: function set(value) {
      this._impl.setMaxDecibels(value);
    }
  }, {
    key: "smoothingTimeConstant",
    get: function get() {
      return this._impl.getSmoothingTimeConstant();
    },
    set: function set(value) {
      this._impl.setSmoothingTimeConstant(value);
    }
  }]);

  return AnalyserNode;
}(AudioNode);

module.exports = AnalyserNode;

},{"../impl":81,"./AudioNode":10}],5:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require("../util");
var impl = require("../impl");

var AudioBuffer = function () {
  function AudioBuffer(context, opts) {
    _classCallCheck(this, AudioBuffer);

    util.defineProp(this, "_impl", new impl.AudioBuffer(context._impl, opts));
  }

  _createClass(AudioBuffer, [{
    key: "getChannelData",
    value: function getChannelData(channel) {
      return this._impl.getChannelData(channel);
    }
  }, {
    key: "copyFromChannel",
    value: function copyFromChannel(destination, channelNumber, startInChannel) {
      this._impl.copyFromChannel(destination, channelNumber, startInChannel);
    }
  }, {
    key: "copyToChannel",
    value: function copyToChannel(source, channelNumber, startInChannel) {
      this._impl.copyToChannel(source, channelNumber, startInChannel);
    }
  }, {
    key: "sampleRate",
    get: function get() {
      return this._impl.getSampleRate();
    }
  }, {
    key: "length",
    get: function get() {
      return this._impl.getLength();
    }
  }, {
    key: "duration",
    get: function get() {
      return this._impl.getDuration();
    }
  }, {
    key: "numberOfChannels",
    get: function get() {
      return this._impl.getNumberOfChannels();
    }
  }]);

  return AudioBuffer;
}();

module.exports = AudioBuffer;

},{"../impl":81,"../util":86}],6:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var impl = require("../impl");
var AudioNode = require("./AudioNode");
var AudioParam = require("./AudioParam");

var AudioBufferSourceNode = function (_AudioNode) {
  _inherits(AudioBufferSourceNode, _AudioNode);

  function AudioBufferSourceNode(context, opts) {
    _classCallCheck(this, AudioBufferSourceNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AudioBufferSourceNode).call(this, context));

    _this._impl = new impl.AudioBufferSourceNode(context._impl, opts);
    _this._impl.$playbackRate = new AudioParam(context, _this._impl.getPlaybackRate());
    _this._impl.$detune = new AudioParam(context, _this._impl.getDetune());
    _this._impl.$buffer = null;
    _this._impl.$onended = null;
    return _this;
  }

  _createClass(AudioBufferSourceNode, [{
    key: "start",
    value: function start(when, offset, duration) {
      this._impl.start(when, offset, duration);
    }
  }, {
    key: "stop",
    value: function stop(when) {
      this._impl.stop(when);
    }
  }, {
    key: "buffer",
    get: function get() {
      return this._impl.$buffer;
    },
    set: function set(value) {
      this._impl.$buffer = value;
      this._impl.setBuffer(value);
    }
  }, {
    key: "playbackRate",
    get: function get() {
      return this._impl.$playbackRate;
    }
  }, {
    key: "detune",
    get: function get() {
      return this._impl.$detune;
    }
  }, {
    key: "loop",
    get: function get() {
      return this._impl.getLoop();
    },
    set: function set(value) {
      this._impl.setLoop(value);
    }
  }, {
    key: "loopStart",
    get: function get() {
      return this._impl.getLoopStart();
    },
    set: function set(value) {
      this._impl.setLoopStart(value);
    }
  }, {
    key: "loopEnd",
    get: function get() {
      return this._impl.getLoopEnd();
    },
    set: function set(value) {
      this._impl.setLoopEnd(value);
    }
  }, {
    key: "onended",
    get: function get() {
      return this._impl.$onended;
    },
    set: function set(callback) {
      this._impl.replaceEventListener("ended", this._impl.$onended, callback);
      this._impl.$onended = callback;
    }
  }]);

  return AudioBufferSourceNode;
}(AudioNode);

module.exports = AudioBufferSourceNode;

},{"../impl":81,"./AudioNode":10,"./AudioParam":11}],7:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var impl = require("../impl");
var util = require("../util");
var EventTarget = require("./EventTarget");
var AudioDestinationNode = require("./AudioDestinationNode");
var AudioListener = require("./AudioListener");
var AudioBuffer = require("./AudioBuffer");
var AudioBufferSourceNode = require("./AudioBufferSourceNode");
var ScriptProcessorNode = require("./ScriptProcessorNode");
var AnalyserNode = require("./AnalyserNode");
var GainNode = require("./GainNode");
var DelayNode = require("./DelayNode");
var BiquadFilterNode = require("./BiquadFilterNode");
var IIRFilterNode = require("./IIRFilterNode");
var WaveShaperNode = require("./WaveShaperNode");
var PannerNode = require("./PannerNode");
var SpatialPannerNode = require("./SpatialPannerNode");
var StereoPannerNode = require("./StereoPannerNode");
var ConvolverNode = require("./ConvolverNode");
var ChannelSplitterNode = require("./ChannelSplitterNode");
var ChannelMergerNode = require("./ChannelMergerNode");
var DynamicsCompressorNode = require("./DynamicsCompressorNode");
var OscillatorNode = require("./OscillatorNode");
var PeriodicWave = require("./PeriodicWave");
var decoder = require("../decoder");

var AudioContext = function (_EventTarget) {
  _inherits(AudioContext, _EventTarget);

  function AudioContext(opts) {
    _classCallCheck(this, AudioContext);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AudioContext).call(this));

    util.defineProp(_this, "_impl", new impl.AudioContext(opts));

    _this._impl.$destination = new AudioDestinationNode(_this, _this._impl.getDestination());
    _this._impl.$listener = new AudioListener(_this, _this._impl.getListener());
    _this._impl.$onstatechange = null;
    return _this;
  }

  _createClass(AudioContext, [{
    key: "suspend",
    value: function suspend() {
      return this._impl.suspend();
    }
  }, {
    key: "resume",
    value: function resume() {
      return this._impl.resume();
    }
  }, {
    key: "close",
    value: function close() {
      return this._impl.close();
    }
  }, {
    key: "createBuffer",
    value: function createBuffer(numberOfChannels, length, sampleRate) {
      return new AudioBuffer(this, { numberOfChannels: numberOfChannels, length: length, sampleRate: sampleRate });
    }
  }, {
    key: "decodeAudioData",
    value: function decodeAudioData(audioData, successCallback, errorCallback) {
      var promise = decoder.decode(audioData, { sampleRate: this.sampleRate });

      promise.then(successCallback, errorCallback);

      return promise;
    }
  }, {
    key: "createBufferSource",
    value: function createBufferSource() {
      return new AudioBufferSourceNode(this);
    }

    /* istanbul ignore next */

  }, {
    key: "createAudioWorker",
    value: function createAudioWorker() {
      throw new TypeError("NOT SUPPORTED");
    }
  }, {
    key: "createScriptProcessor",
    value: function createScriptProcessor(bufferSize, numberOfInputChannels, numberOfOutputChannels) {
      return new ScriptProcessorNode(this, { bufferSize: bufferSize, numberOfInputChannels: numberOfInputChannels, numberOfOutputChannels: numberOfOutputChannels });
    }
  }, {
    key: "createAnalyser",
    value: function createAnalyser() {
      return new AnalyserNode(this);
    }
  }, {
    key: "createGain",
    value: function createGain() {
      return new GainNode(this);
    }
  }, {
    key: "createDelay",
    value: function createDelay(maxDelayTime) {
      return new DelayNode(this, { maxDelayTime: maxDelayTime });
    }
  }, {
    key: "createBiquadFilter",
    value: function createBiquadFilter() {
      return new BiquadFilterNode(this);
    }
  }, {
    key: "createIIRFilter",
    value: function createIIRFilter(feedforward, feedback) {
      return new IIRFilterNode(this, { feedforward: feedforward, feedback: feedback });
    }
  }, {
    key: "createWaveShaper",
    value: function createWaveShaper() {
      return new WaveShaperNode(this);
    }
  }, {
    key: "createPanner",
    value: function createPanner() {
      return new PannerNode(this);
    }
  }, {
    key: "createSpatialPanner",
    value: function createSpatialPanner() {
      return new SpatialPannerNode(this);
    }
  }, {
    key: "createStereoPanner",
    value: function createStereoPanner() {
      return new StereoPannerNode(this);
    }
  }, {
    key: "createConvolver",
    value: function createConvolver() {
      return new ConvolverNode(this);
    }
  }, {
    key: "createChannelSplitter",
    value: function createChannelSplitter(numberOfOutputs) {
      return new ChannelSplitterNode(this, { numberOfOutputs: numberOfOutputs });
    }
  }, {
    key: "createChannelMerger",
    value: function createChannelMerger(numberOfInputs) {
      return new ChannelMergerNode(this, { numberOfInputs: numberOfInputs });
    }
  }, {
    key: "createDynamicsCompressor",
    value: function createDynamicsCompressor() {
      return new DynamicsCompressorNode(this);
    }
  }, {
    key: "createOscillator",
    value: function createOscillator() {
      return new OscillatorNode(this);
    }
  }, {
    key: "createPeriodicWave",
    value: function createPeriodicWave(real, imag, constraints) {
      return new PeriodicWave(this, { real: real, imag: imag, constraints: constraints });
    }

    /* istanbul ignore next */

  }, {
    key: "createMediaElementSource",
    value: function createMediaElementSource() {
      throw new TypeError("NOT SUPPORTED");
    }

    /* istanbul ignore next */

  }, {
    key: "createMediaStreamSource",
    value: function createMediaStreamSource() {
      throw new TypeError("NOT SUPPORTED");
    }

    /* istanbul ignore next */

  }, {
    key: "createMediaStreamDestination",
    value: function createMediaStreamDestination() {
      throw new TypeError("NOT SUPPORTED");
    }
  }, {
    key: "destination",
    get: function get() {
      return this._impl.$destination;
    }
  }, {
    key: "sampleRate",
    get: function get() {
      return this._impl.getSampleRate();
    }
  }, {
    key: "currentTime",
    get: function get() {
      return this._impl.getCurrentTime();
    }
  }, {
    key: "listener",
    get: function get() {
      return this._impl.$listener;
    }
  }, {
    key: "state",
    get: function get() {
      return this._impl.getState();
    }
  }, {
    key: "onstatechange",
    get: function get() {
      return this._impl.$onstatechange;
    },
    set: function set(callback) {
      this._impl.replaceEventListener("statechange", this._impl.$onstatechange, callback);
      this._impl.$onstatechange = callback;
    }
  }]);

  return AudioContext;
}(EventTarget);

module.exports = AudioContext;

},{"../decoder":36,"../impl":81,"../util":86,"./AnalyserNode":4,"./AudioBuffer":5,"./AudioBufferSourceNode":6,"./AudioDestinationNode":8,"./AudioListener":9,"./BiquadFilterNode":13,"./ChannelMergerNode":14,"./ChannelSplitterNode":15,"./ConvolverNode":16,"./DelayNode":17,"./DynamicsCompressorNode":18,"./EventTarget":19,"./GainNode":20,"./IIRFilterNode":21,"./OscillatorNode":22,"./PannerNode":23,"./PeriodicWave":24,"./ScriptProcessorNode":25,"./SpatialPannerNode":27,"./StereoPannerNode":28,"./WaveShaperNode":29}],8:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("./AudioNode");

var AudioDestinationNode = function (_AudioNode) {
  _inherits(AudioDestinationNode, _AudioNode);

  function AudioDestinationNode(context, impl) {
    _classCallCheck(this, AudioDestinationNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AudioDestinationNode).call(this, context));

    _this._impl = impl;
    return _this;
  }

  _createClass(AudioDestinationNode, [{
    key: "maxChannelCount",
    get: function get() {
      return this._impl.getMaxChannelCount();
    }
  }]);

  return AudioDestinationNode;
}(AudioNode);

module.exports = AudioDestinationNode;

},{"./AudioNode":10}],9:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require("../util");

var AudioListener = function () {
  function AudioListener(context, impl) {
    _classCallCheck(this, AudioListener);

    util.defineProp(this, "_impl", impl);
  }

  _createClass(AudioListener, [{
    key: "setPosition",
    value: function setPosition(x, y, z) {
      this._impl.setPosition(x, y, z);
    }
  }, {
    key: "setOrientation",
    value: function setOrientation(x, y, z, xUp, yUp, zUp) {
      this._impl.setOrientation(x, y, z, xUp, yUp, zUp);
    }
  }]);

  return AudioListener;
}();

module.exports = AudioListener;

},{"../util":86}],10:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var util = require("../util");
var EventTarget = require("./EventTarget");

var AudioNode = function (_EventTarget) {
  _inherits(AudioNode, _EventTarget);

  function AudioNode(context) {
    _classCallCheck(this, AudioNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AudioNode).call(this));

    util.defineProp(_this, "_context", context);
    util.defineProp(_this, "_impl", null);
    return _this;
  }

  _createClass(AudioNode, [{
    key: "connect",
    value: function connect(destination, input, output) {
      this._impl.connect(destination._impl, input, output);

      /* istanbul ignore else */
      if (destination instanceof AudioNode) {
        return destination;
      }
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      this._impl.disconnect.apply(this._impl, arguments);
    }
  }, {
    key: "context",
    get: function get() {
      return this._context;
    }
  }, {
    key: "numberOfInputs",
    get: function get() {
      return this._impl.getNumberOfInputs();
    }
  }, {
    key: "numberOfOutputs",
    get: function get() {
      return this._impl.getNumberOfOutputs();
    }
  }, {
    key: "channelCount",
    get: function get() {
      return this._impl.getChannelCount();
    },
    set: function set(value) {
      this._impl.setChannelCount(value);
    }
  }, {
    key: "channelCountMode",
    get: function get() {
      return this._impl.getChannelCountMode();
    },
    set: function set(value) {
      this._impl.setChannelCountMode(value);
    }
  }, {
    key: "channelInterpretation",
    get: function get() {
      return this._impl.getChannelInterpretation();
    },
    set: function set(value) {
      return this._impl.setChannelInterpretation(value);
    }
  }]);

  return AudioNode;
}(EventTarget);

module.exports = AudioNode;

},{"../util":86,"./EventTarget":19}],11:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require("../util");

var AudioParam = function () {
  function AudioParam(context, impl) {
    _classCallCheck(this, AudioParam);

    util.defineProp(this, "_context", context);
    util.defineProp(this, "_impl", impl);
  }

  _createClass(AudioParam, [{
    key: "setValueAtTime",
    value: function setValueAtTime(value, startTime) {
      this._impl.setValueAtTime(value, startTime);
      return this;
    }
  }, {
    key: "linearRampToValueAtTime",
    value: function linearRampToValueAtTime(value, endTime) {
      this._impl.linearRampToValueAtTime(value, endTime);
      return this;
    }
  }, {
    key: "exponentialRampToValueAtTime",
    value: function exponentialRampToValueAtTime(value, endTime) {
      this._impl.exponentialRampToValueAtTime(value, endTime);
      return this;
    }
  }, {
    key: "setTargetAtTime",
    value: function setTargetAtTime(target, startTime, timeConstant) {
      this._impl.setTargetAtTime(target, startTime, timeConstant);
      return this;
    }
  }, {
    key: "setValueCurveAtTime",
    value: function setValueCurveAtTime(values, startTime, duration) {
      this._impl.setValueCurveAtTime(values, startTime, duration);
      return this;
    }
  }, {
    key: "cancelScheduledValues",
    value: function cancelScheduledValues(startTime) {
      this._impl.cancelScheduledValues(startTime);
      return this;
    }
  }, {
    key: "value",
    get: function get() {
      return this._impl.getValue();
    },
    set: function set(value) {
      this._impl.setValue(value);
    }
  }, {
    key: "defaultValue",
    get: function get() {
      return this._impl.getDefaultValue();
    }
  }]);

  return AudioParam;
}();

module.exports = AudioParam;

},{"../util":86}],12:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var impl = require("../impl");
var AudioNode = require("./AudioNode");

var AudioWorkerNode = function (_AudioNode) {
  _inherits(AudioWorkerNode, _AudioNode);

  function AudioWorkerNode(context, opts) {
    _classCallCheck(this, AudioWorkerNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AudioWorkerNode).call(this, context));

    _this._impl = new impl.AudioWorkerNode(context._impl, opts);
    _this._impl.$onmessage = null;
    return _this;
  }

  _createClass(AudioWorkerNode, [{
    key: "postMessage",
    value: function postMessage(message) {
      this._impl.postMessage(message);
    }
  }, {
    key: "onmessage",
    get: function get() {
      return this._impl.$onmessage;
    },
    set: function set(callback) {
      this._impl.replaceEventListener("message", this._impl.$onmessage, callback);
      this._impl.$onmessage = callback;
    }
  }]);

  return AudioWorkerNode;
}(AudioNode);

module.exports = AudioWorkerNode;

},{"../impl":81,"./AudioNode":10}],13:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var impl = require("../impl");
var AudioNode = require("./AudioNode");
var AudioParam = require("./AudioParam");

var BiquadFilterNode = function (_AudioNode) {
  _inherits(BiquadFilterNode, _AudioNode);

  function BiquadFilterNode(context, opts) {
    _classCallCheck(this, BiquadFilterNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BiquadFilterNode).call(this, context));

    _this._impl = new impl.BiquadFilterNode(context._impl, opts);
    _this._impl.$frequency = new AudioParam(context, _this._impl.getFrequency());
    _this._impl.$detune = new AudioParam(context, _this._impl.getDetune());
    _this._impl.$Q = new AudioParam(context, _this._impl.getQ());
    _this._impl.$gain = new AudioParam(context, _this._impl.getGain());
    return _this;
  }

  _createClass(BiquadFilterNode, [{
    key: "getFrequencyResponse",
    value: function getFrequencyResponse(frequencyHz, magResponse, phaseResponse) {
      this._impl.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);
    }
  }, {
    key: "type",
    get: function get() {
      return this._impl.getType();
    },
    set: function set(value) {
      this._impl.setType(value);
    }
  }, {
    key: "frequency",
    get: function get() {
      return this._impl.$frequency;
    }
  }, {
    key: "detune",
    get: function get() {
      return this._impl.$detune;
    }
  }, {
    key: "Q",
    get: function get() {
      return this._impl.$Q;
    }
  }, {
    key: "gain",
    get: function get() {
      return this._impl.$gain;
    }
  }]);

  return BiquadFilterNode;
}(AudioNode);

module.exports = BiquadFilterNode;

},{"../impl":81,"./AudioNode":10,"./AudioParam":11}],14:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var impl = require("../impl");
var AudioNode = require("./AudioNode");

var ChannelMergerNode = function (_AudioNode) {
  _inherits(ChannelMergerNode, _AudioNode);

  function ChannelMergerNode(context, opts) {
    _classCallCheck(this, ChannelMergerNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ChannelMergerNode).call(this, context));

    _this._impl = new impl.ChannelMergerNode(context._impl, opts);
    return _this;
  }

  return ChannelMergerNode;
}(AudioNode);

module.exports = ChannelMergerNode;

},{"../impl":81,"./AudioNode":10}],15:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var impl = require("../impl");
var AudioNode = require("./AudioNode");

var ChannelSplitterNode = function (_AudioNode) {
  _inherits(ChannelSplitterNode, _AudioNode);

  function ChannelSplitterNode(context, opts) {
    _classCallCheck(this, ChannelSplitterNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ChannelSplitterNode).call(this, context));

    _this._impl = new impl.ChannelSplitterNode(context._impl, opts);
    return _this;
  }

  return ChannelSplitterNode;
}(AudioNode);

module.exports = ChannelSplitterNode;

},{"../impl":81,"./AudioNode":10}],16:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var impl = require("../impl");
var AudioNode = require("./AudioNode");

var ConvolverNode = function (_AudioNode) {
  _inherits(ConvolverNode, _AudioNode);

  function ConvolverNode(context, opts) {
    _classCallCheck(this, ConvolverNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ConvolverNode).call(this, context));

    _this._impl = new impl.ConvolverNode(context._impl, opts);
    _this._impl.$buffer = null;
    return _this;
  }

  _createClass(ConvolverNode, [{
    key: "buffer",
    get: function get() {
      return this._impl.$buffer;
    },
    set: function set(value) {
      this._impl.$buffer = value;
      this._impl.setBuffer(value);
    }
  }, {
    key: "normalize",
    get: function get() {
      return this._impl.getNormalize();
    },
    set: function set(value) {
      this._impl.setNormalize(value);
    }
  }]);

  return ConvolverNode;
}(AudioNode);

module.exports = ConvolverNode;

},{"../impl":81,"./AudioNode":10}],17:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var impl = require("../impl");
var AudioNode = require("./AudioNode");
var AudioParam = require("./AudioParam");

var DelayNode = function (_AudioNode) {
  _inherits(DelayNode, _AudioNode);

  function DelayNode(context, opts) {
    _classCallCheck(this, DelayNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DelayNode).call(this, context));

    _this._impl = new impl.DelayNode(context._impl, opts);
    _this._impl.$delayTime = new AudioParam(context, _this._impl.getDelayTime());
    return _this;
  }

  _createClass(DelayNode, [{
    key: "delayTime",
    get: function get() {
      return this._impl.$delayTime;
    }
  }]);

  return DelayNode;
}(AudioNode);

module.exports = DelayNode;

},{"../impl":81,"./AudioNode":10,"./AudioParam":11}],18:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var impl = require("../impl");
var AudioNode = require("./AudioNode");
var AudioParam = require("./AudioParam");

var DynamicsCompressorNode = function (_AudioNode) {
  _inherits(DynamicsCompressorNode, _AudioNode);

  function DynamicsCompressorNode(context, opts) {
    _classCallCheck(this, DynamicsCompressorNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DynamicsCompressorNode).call(this, context));

    _this._impl = new impl.DynamicsCompressorNode(context._impl, opts);
    _this._impl.$threshold = new AudioParam(context, _this._impl.getThreshold());
    _this._impl.$knee = new AudioParam(context, _this._impl.getKnee());
    _this._impl.$ratio = new AudioParam(context, _this._impl.getRatio());
    _this._impl.$attack = new AudioParam(context, _this._impl.getAttack());
    _this._impl.$release = new AudioParam(context, _this._impl.getRelease());
    return _this;
  }

  _createClass(DynamicsCompressorNode, [{
    key: "threshold",
    get: function get() {
      return this._impl.$threshold;
    }
  }, {
    key: "knee",
    get: function get() {
      return this._impl.$knee;
    }
  }, {
    key: "ratio",
    get: function get() {
      return this._impl.$ratio;
    }
  }, {
    key: "reduction",
    get: function get() {
      return this._impl.getReduction();
    }
  }, {
    key: "attack",
    get: function get() {
      return this._impl.$attack;
    }
  }, {
    key: "release",
    get: function get() {
      return this._impl.$release;
    }
  }]);

  return DynamicsCompressorNode;
}(AudioNode);

module.exports = DynamicsCompressorNode;

},{"../impl":81,"./AudioNode":10,"./AudioParam":11}],19:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventTarget = function () {
  function EventTarget() {
    _classCallCheck(this, EventTarget);
  }

  _createClass(EventTarget, [{
    key: "addEventListener",
    value: function addEventListener(type, listener) {
      this._impl.addEventListener(type, listener);
    }
  }, {
    key: "removeEventListener",
    value: function removeEventListener(type, listener) {
      this._impl.removeEventListener(type, listener);
    }
  }]);

  return EventTarget;
}();

module.exports = EventTarget;

},{}],20:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var impl = require("../impl");
var AudioNode = require("./AudioNode");
var AudioParam = require("./AudioParam");

var GainNode = function (_AudioNode) {
  _inherits(GainNode, _AudioNode);

  function GainNode(context, opts) {
    _classCallCheck(this, GainNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(GainNode).call(this, context));

    _this._impl = new impl.GainNode(context._impl, opts);
    _this._impl.$gain = new AudioParam(context, _this._impl.getGain());
    return _this;
  }

  _createClass(GainNode, [{
    key: "gain",
    get: function get() {
      return this._impl.$gain;
    }
  }]);

  return GainNode;
}(AudioNode);

module.exports = GainNode;

},{"../impl":81,"./AudioNode":10,"./AudioParam":11}],21:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var impl = require("../impl");
var AudioNode = require("./AudioNode");

var IIRFilterNode = function (_AudioNode) {
  _inherits(IIRFilterNode, _AudioNode);

  function IIRFilterNode(context, opts) {
    _classCallCheck(this, IIRFilterNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(IIRFilterNode).call(this, context));

    _this._impl = new impl.IIRFilterNode(context._impl, opts);
    return _this;
  }

  _createClass(IIRFilterNode, [{
    key: "getFrequencyResponse",
    value: function getFrequencyResponse(frequencyHz, magResponse, phaseResponse) {
      this._impl.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);
    }
  }]);

  return IIRFilterNode;
}(AudioNode);

module.exports = IIRFilterNode;

},{"../impl":81,"./AudioNode":10}],22:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var impl = require("../impl");
var AudioNode = require("./AudioNode");
var AudioParam = require("./AudioParam");

var OscillatorNode = function (_AudioNode) {
  _inherits(OscillatorNode, _AudioNode);

  function OscillatorNode(context) {
    _classCallCheck(this, OscillatorNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(OscillatorNode).call(this, context));

    _this._impl = new impl.OscillatorNode(context._impl);
    _this._impl.$frequency = new AudioParam(context, _this._impl.getFrequency());
    _this._impl.$detune = new AudioParam(context, _this._impl.getDetune());
    _this._impl.$onended = null;
    return _this;
  }

  _createClass(OscillatorNode, [{
    key: "start",
    value: function start(when) {
      this._impl.start(when);
    }
  }, {
    key: "stop",
    value: function stop(when) {
      this._impl.stop(when);
    }
  }, {
    key: "setPeriodicWave",
    value: function setPeriodicWave(periodicWave) {
      this._impl.setPeriodicWave(periodicWave);
    }
  }, {
    key: "type",
    get: function get() {
      return this._impl.getType();
    },
    set: function set(value) {
      this._impl.setType(value);
    }
  }, {
    key: "frequency",
    get: function get() {
      return this._impl.$frequency;
    }
  }, {
    key: "detune",
    get: function get() {
      return this._impl.$detune;
    }
  }, {
    key: "onended",
    get: function get() {
      return this._impl.$onended;
    },
    set: function set(callback) {
      this._impl.replaceEventListener("ended", this._impl.$onended, callback);
      this._impl.$onended = callback;
    }
  }]);

  return OscillatorNode;
}(AudioNode);

module.exports = OscillatorNode;

},{"../impl":81,"./AudioNode":10,"./AudioParam":11}],23:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var impl = require("../impl");
var AudioNode = require("./AudioNode");

var PannerNode = function (_AudioNode) {
  _inherits(PannerNode, _AudioNode);

  function PannerNode(context) {
    _classCallCheck(this, PannerNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(PannerNode).call(this, context));

    _this._impl = new impl.PannerNode(context._impl);
    return _this;
  }

  _createClass(PannerNode, [{
    key: "setPosition",
    value: function setPosition(x, y, z) {
      this._impl.setPosition(x, y, z);
    }
  }, {
    key: "setOrientation",
    value: function setOrientation(x, y, z) {
      this._impl.setOrientation(x, y, z);
    }
  }, {
    key: "setVelocity",
    value: function setVelocity(x, y, z) {
      this._impl.setVelocity(x, y, z);
    }
  }, {
    key: "panningModel",
    get: function get() {
      return this._impl.getPanningModel();
    },
    set: function set(value) {
      this._impl.setPanningModel(value);
    }
  }, {
    key: "distanceModel",
    get: function get() {
      return this._impl.getDistanceModel();
    },
    set: function set(value) {
      this._impl.setDistanceModel(value);
    }
  }, {
    key: "refDistance",
    get: function get() {
      return this._impl.getRefDistance();
    },
    set: function set(value) {
      this._impl.setRefDistance(value);
    }
  }, {
    key: "maxDistance",
    get: function get() {
      return this._impl.getMaxDistance();
    },
    set: function set(value) {
      this._impl.setMaxDistance(value);
    }
  }, {
    key: "rolloffFactor",
    get: function get() {
      return this._impl.getRolloffFactor();
    },
    set: function set(value) {
      this._impl.setRolloffFactor(value);
    }
  }, {
    key: "coneInnerAngle",
    get: function get() {
      return this._impl.getConeInnerAngle();
    },
    set: function set(value) {
      this._impl.setConeInnerAngle(value);
    }
  }, {
    key: "coneOuterAngle",
    get: function get() {
      return this._impl.getConeOuterAngle();
    },
    set: function set(value) {
      this._impl.setConeOuterAngle(value);
    }
  }, {
    key: "coneOuterGain",
    get: function get() {
      return this._impl.getConeOuterGain();
    },
    set: function set(value) {
      this._impl.setConeOuterGain(value);
    }
  }]);

  return PannerNode;
}(AudioNode);

module.exports = PannerNode;

},{"../impl":81,"./AudioNode":10}],24:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require("../util");
var impl = require("../impl");

var PeriodicWave = function PeriodicWave(context, opts) {
  _classCallCheck(this, PeriodicWave);

  util.defineProp(this, "_impl", new impl.PeriodicWave(context._impl, opts));
};

module.exports = PeriodicWave;

},{"../impl":81,"../util":86}],25:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var impl = require("../impl");
var AudioNode = require("./AudioNode");
var AudioBuffer = require("./AudioBuffer");

var ScriptProcessorNode = function (_AudioNode) {
  _inherits(ScriptProcessorNode, _AudioNode);

  function ScriptProcessorNode(context, opts) {
    _classCallCheck(this, ScriptProcessorNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ScriptProcessorNode).call(this, context));

    _this._impl = new impl.ScriptProcessorNode(context._impl, opts);
    _this._impl.$onaudioprocess = null;
    _this._impl.setEventItem({
      type: "audioprocess",
      playbackTime: 0,
      inputBuffer: new AudioBuffer(context),
      outputBuffer: new AudioBuffer(context)
    });
    return _this;
  }

  _createClass(ScriptProcessorNode, [{
    key: "bufferSize",
    get: function get() {
      return this._impl.getBufferSize();
    }
  }, {
    key: "onaudioprocess",
    get: function get() {
      return this._impl.$onaudioprocess;
    },
    set: function set(callback) {
      this._impl.replaceEventListener("audioprocess", this._impl.$onaudioprocess, callback);
      this._impl.$onaudioprocess = callback;
    }
  }]);

  return ScriptProcessorNode;
}(AudioNode);

module.exports = ScriptProcessorNode;

},{"../impl":81,"./AudioBuffer":5,"./AudioNode":10}],26:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require("../util");
var AudioParam = require("./AudioParam");

var SpatialListener = function () {
  function SpatialListener(context, impl) {
    _classCallCheck(this, SpatialListener);

    util.defineProp(this, "_context", context);
    util.defineProp(this, "_impl", impl);

    this._impl.$positionX = new AudioParam(context, this._impl.getPositionX());
    this._impl.$positionY = new AudioParam(context, this._impl.getPositionY());
    this._impl.$positionZ = new AudioParam(context, this._impl.getPositionZ());
    this._impl.$forwardX = new AudioParam(context, this._impl.getForwardX());
    this._impl.$forwardY = new AudioParam(context, this._impl.getForwardY());
    this._impl.$forwardZ = new AudioParam(context, this._impl.getForwardZ());
    this._impl.$upX = new AudioParam(context, this._impl.getUpX());
    this._impl.$upY = new AudioParam(context, this._impl.getUpY());
    this._impl.$upZ = new AudioParam(context, this._impl.getUpZ());
  }

  _createClass(SpatialListener, [{
    key: "positionX",
    get: function get() {
      return this._impl.$positionX;
    }
  }, {
    key: "positionY",
    get: function get() {
      return this._impl.$positionY;
    }
  }, {
    key: "positionZ",
    get: function get() {
      return this._impl.$positionZ;
    }
  }, {
    key: "forwardX",
    get: function get() {
      return this._impl.$forwardX;
    }
  }, {
    key: "forwardY",
    get: function get() {
      return this._impl.$forwardY;
    }
  }, {
    key: "forwardZ",
    get: function get() {
      return this._impl.$forwardZ;
    }
  }, {
    key: "upX",
    get: function get() {
      return this._impl.$upX;
    }
  }, {
    key: "upY",
    get: function get() {
      return this._impl.$upY;
    }
  }, {
    key: "upZ",
    get: function get() {
      return this._impl.$upZ;
    }
  }]);

  return SpatialListener;
}();

module.exports = SpatialListener;

},{"../util":86,"./AudioParam":11}],27:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var impl = require("../impl");
var AudioNode = require("./AudioNode");
var AudioParam = require("./AudioParam");

var SpatialPannerNode = function (_AudioNode) {
  _inherits(SpatialPannerNode, _AudioNode);

  function SpatialPannerNode(context) {
    _classCallCheck(this, SpatialPannerNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SpatialPannerNode).call(this, context));

    _this._impl = new impl.SpatialPannerNode(context._impl);
    _this._impl.$positionX = new AudioParam(context, _this._impl.getPositionX());
    _this._impl.$positionY = new AudioParam(context, _this._impl.getPositionY());
    _this._impl.$positionZ = new AudioParam(context, _this._impl.getPositionZ());
    _this._impl.$orientationX = new AudioParam(context, _this._impl.getOrientationX());
    _this._impl.$orientationY = new AudioParam(context, _this._impl.getOrientationY());
    _this._impl.$orientationZ = new AudioParam(context, _this._impl.getOrientationZ());
    return _this;
  }

  _createClass(SpatialPannerNode, [{
    key: "panningModel",
    get: function get() {
      return this._impl.getPanningModel();
    },
    set: function set(value) {
      this._impl.setPanningModel(value);
    }
  }, {
    key: "positionX",
    get: function get() {
      return this._impl.$positionX;
    }
  }, {
    key: "positionY",
    get: function get() {
      return this._impl.$positionY;
    }
  }, {
    key: "positionZ",
    get: function get() {
      return this._impl.$positionZ;
    }
  }, {
    key: "orientationX",
    get: function get() {
      return this._impl.$orientationX;
    }
  }, {
    key: "orientationY",
    get: function get() {
      return this._impl.$orientationY;
    }
  }, {
    key: "orientationZ",
    get: function get() {
      return this._impl.$orientationZ;
    }
  }, {
    key: "distanceModel",
    get: function get() {
      return this._impl.getDistanceModel();
    },
    set: function set(value) {
      this._impl.setDistanceModel(value);
    }
  }, {
    key: "refDistance",
    get: function get() {
      return this._impl.getRefDistance();
    },
    set: function set(value) {
      this._impl.setRefDistance(value);
    }
  }, {
    key: "maxDistance",
    get: function get() {
      return this._impl.getMaxDistance();
    },
    set: function set(value) {
      this._impl.setMaxDistance(value);
    }
  }, {
    key: "rolloffFactor",
    get: function get() {
      return this._impl.getRolloffFactor();
    },
    set: function set(value) {
      this._impl.setRolloffFactor(value);
    }
  }, {
    key: "coneInnerAngle",
    get: function get() {
      return this._impl.getConeInnerAngle();
    },
    set: function set(value) {
      this._impl.setConeInnerAngle(value);
    }
  }, {
    key: "coneOuterAngle",
    get: function get() {
      return this._impl.getConeOuterAngle();
    },
    set: function set(value) {
      this._impl.setConeOuterAngle(value);
    }
  }, {
    key: "coneOuterGain",
    get: function get() {
      return this._impl.getConeOuterGain();
    },
    set: function set(value) {
      this._impl.setConeOuterGain(value);
    }
  }]);

  return SpatialPannerNode;
}(AudioNode);

module.exports = SpatialPannerNode;

},{"../impl":81,"./AudioNode":10,"./AudioParam":11}],28:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var impl = require("../impl");
var AudioNode = require("./AudioNode");
var AudioParam = require("./AudioParam");

var StereoPannerNode = function (_AudioNode) {
  _inherits(StereoPannerNode, _AudioNode);

  function StereoPannerNode(context) {
    _classCallCheck(this, StereoPannerNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(StereoPannerNode).call(this, context));

    _this._impl = new impl.StereoPannerNode(context._impl);
    _this._impl.$pan = new AudioParam(context, _this._impl.getPan());
    return _this;
  }

  _createClass(StereoPannerNode, [{
    key: "pan",
    get: function get() {
      return this._impl.$pan;
    }
  }]);

  return StereoPannerNode;
}(AudioNode);

module.exports = StereoPannerNode;

},{"../impl":81,"./AudioNode":10,"./AudioParam":11}],29:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var impl = require("../impl");
var AudioNode = require("./AudioNode");

var WaveShaperNode = function (_AudioNode) {
  _inherits(WaveShaperNode, _AudioNode);

  function WaveShaperNode(context) {
    _classCallCheck(this, WaveShaperNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WaveShaperNode).call(this, context));

    _this._impl = new impl.WaveShaperNode(context._impl);
    return _this;
  }

  _createClass(WaveShaperNode, [{
    key: "curve",
    get: function get() {
      return this._impl.getCurve();
    },
    set: function set(value) {
      this._impl.setCurve(value);
    }
  }, {
    key: "oversample",
    get: function get() {
      return this._impl.getOversample();
    },
    set: function set(value) {
      this._impl.setOversample(value);
    }
  }]);

  return WaveShaperNode;
}(AudioNode);

module.exports = WaveShaperNode;

},{"../impl":81,"./AudioNode":10}],30:[function(require,module,exports){
"use strict";

module.exports = {
  AnalyserNode: require("./AnalyserNode"),
  AudioBuffer: require("./AudioBuffer"),
  AudioBufferSourceNode: require("./AudioBufferSourceNode"),
  AudioContext: require("./AudioContext"),
  AudioDestinationNode: require("./AudioDestinationNode"),
  AudioListener: require("./AudioListener"),
  AudioNode: require("./AudioNode"),
  AudioParam: require("./AudioParam"),
  AudioWorkerNode: require("./AudioWorkerNode"),
  BiquadFilterNode: require("./BiquadFilterNode"),
  ChannelMergerNode: require("./ChannelMergerNode"),
  ChannelSplitterNode: require("./ChannelSplitterNode"),
  ConvolverNode: require("./ConvolverNode"),
  DelayNode: require("./DelayNode"),
  DynamicsCompressorNode: require("./DynamicsCompressorNode"),
  EventTarget: require("./EventTarget"),
  GainNode: require("./GainNode"),
  IIRFilterNode: require("./IIRFilterNode"),
  OscillatorNode: require("./OscillatorNode"),
  PannerNode: require("./PannerNode"),
  PeriodicWave: require("./PeriodicWave"),
  ScriptProcessorNode: require("./ScriptProcessorNode"),
  SpatialListener: require("./SpatialListener"),
  SpatialPannerNode: require("./SpatialPannerNode"),
  StereoPannerNode: require("./StereoPannerNode"),
  WaveShaperNode: require("./WaveShaperNode")
};

},{"./AnalyserNode":4,"./AudioBuffer":5,"./AudioBufferSourceNode":6,"./AudioContext":7,"./AudioDestinationNode":8,"./AudioListener":9,"./AudioNode":10,"./AudioParam":11,"./AudioWorkerNode":12,"./BiquadFilterNode":13,"./ChannelMergerNode":14,"./ChannelSplitterNode":15,"./ConvolverNode":16,"./DelayNode":17,"./DynamicsCompressorNode":18,"./EventTarget":19,"./GainNode":20,"./IIRFilterNode":21,"./OscillatorNode":22,"./PannerNode":23,"./PeriodicWave":24,"./ScriptProcessorNode":25,"./SpatialListener":26,"./SpatialPannerNode":27,"./StereoPannerNode":28,"./WaveShaperNode":29}],31:[function(require,module,exports){
"use strict";

module.exports = {
  sampleRate: 44100,
  numberOfChannels: 2,
  blockSize: 128
};

},{}],32:[function(require,module,exports){
(function (global){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var util = require("../util");
var audioDataUtil = require("../util/audioDataUtil");
var AudioContext = require("../api/AudioContext");
var AudioBuffer = require("../api/AudioBuffer");
var setImmediate = global.setImmediate || /* istanbul ignore next */function (fn) {
  return setTimeout(fn, 0);
};

var OfflineAudioContext = function (_AudioContext) {
  _inherits(OfflineAudioContext, _AudioContext);

  function OfflineAudioContext(numberOfChannels, length, sampleRate) {
    _classCallCheck(this, OfflineAudioContext);

    numberOfChannels = util.toValidNumberOfChannels(numberOfChannels);
    length = Math.max(0, length | 0);
    sampleRate = util.toValidSampleRate(sampleRate);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(OfflineAudioContext).call(this, { sampleRate: sampleRate, numberOfChannels: numberOfChannels }));

    _this._impl.$oncomplete = null;

    util.defineProp(_this, "_numberOfChannels", numberOfChannels);
    util.defineProp(_this, "_length", length);
    util.defineProp(_this, "_suspendedTime", Infinity);
    util.defineProp(_this, "_suspendPromise", null);
    util.defineProp(_this, "_suspendResolve", null);
    util.defineProp(_this, "_renderingPromise", null);
    util.defineProp(_this, "_renderingResolve", null);
    util.defineProp(_this, "_renderingIterations", 128);
    util.defineProp(_this, "_audioData", null);
    util.defineProp(_this, "_writeIndex", 0);
    return _this;
  }

  _createClass(OfflineAudioContext, [{
    key: "resume",
    value: function resume() {
      if (this.state === "suspended" && this._renderingPromise !== null) {
        render.call(this, this._impl);
      }
      return Promise.resolve();
    }
  }, {
    key: "suspend",
    value: function suspend(time) {
      var _this2 = this;

      time = Math.max(0, util.toNumber(time));

      this._suspendedTime = time;

      if (this._suspendPromise === null) {
        this._suspendPromise = new Promise(function (resolve) {
          _this2._suspendResolve = resolve;
        });
      }

      return this._suspendPromise;
    }

    /* istanbul ignore next */

  }, {
    key: "close",
    value: function close() {
      return Promise.reject();
    }
  }, {
    key: "startRendering",
    value: function startRendering() {
      var _this3 = this;

      if (this._renderingPromise === null) {
        this._renderingPromise = new Promise(function (resolve) {
          var numberOfChannels = _this3._numberOfChannels;
          var length = _this3._length;
          var sampleRate = _this3.sampleRate;
          var blockSize = _this3._impl.blockSize;

          _this3._audioData = createRenderingAudioData(numberOfChannels, length, sampleRate, blockSize);
          _this3._renderingResolve = resolve;

          render.call(_this3, _this3._impl);
        });
      }
      return this._renderingPromise;
    }
  }, {
    key: "oncomplete",
    get: function get() {
      return this._impl.$oncomplete;
    },
    set: function set(callback) {
      this._impl.replaceEventListener("complete", this._impl.$oncomplete, callback);
      this._impl.$oncomplete = callback;
    }
  }]);

  return OfflineAudioContext;
}(AudioContext);

function createRenderingAudioData(numberOfChannels, length, sampleRate, blockSize) {
  length = Math.ceil(length / blockSize) * blockSize;

  var channelData = new Array(numberOfChannels).fill().map(function () {
    return new Float32Array(length);
  });

  return { numberOfChannels: numberOfChannels, length: length, sampleRate: sampleRate, channelData: channelData };
}

function suspendRendering() {
  if (this._suspendResolve !== null) {
    this._suspendResolve();
    this._suspendedTime = Infinity;
    this._suspendPromise = this._suspendResolve = null;
    this._impl.changeState("suspended");
  }
}

function doneRendering(audioData) {
  var numberOfChannels = audioData.numberOfChannels;
  var length = this._length;

  for (var ch = 0; ch < numberOfChannels; ch++) {
    audioData.channelData[ch] = audioData.channelData[ch].subarray(0, length);
  }
  audioData.length = length;

  var audioBuffer = audioDataUtil.toAudioBuffer(audioData, AudioBuffer);

  this._impl.changeState("closed");
  this._impl.dispatchEvent({ type: "complete", renderedBuffer: audioBuffer });

  this._renderingResolve(audioBuffer);
  this._renderingResolve = null;
}

function render(impl) {
  var _this4 = this;

  var audioData = this._audioData;
  var numberOfChannels = audioData.numberOfChannels;
  var audioDataLength = audioData.length;
  var channelData = audioData.channelData;
  var blockSize = impl.blockSize;

  var loop = function loop() {
    var n = _this4._renderingIterations;

    while (n--) {
      if (_this4._suspendedTime <= _this4.currentTime) {
        return suspendRendering.call(_this4);
      }

      var processedChannelData = impl.process().channelData;

      for (var ch = 0; ch < numberOfChannels; ch++) {
        channelData[ch].set(processedChannelData[ch], _this4._writeIndex);
      }

      _this4._writeIndex += blockSize;

      if (_this4._writeIndex === audioDataLength) {
        return doneRendering.call(_this4, audioData);
      }
    }

    setImmediate(loop);
  };

  impl.changeState("running");

  setImmediate(loop);
}

module.exports = OfflineAudioContext;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../api/AudioBuffer":5,"../api/AudioContext":7,"../util":86,"../util/audioDataUtil":82}],33:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var util = require("../util");
var AudioContext = require("../api/AudioContext");
var encoder = require("../encoder");

var RenderingAudioContext = function (_AudioContext) {
  _inherits(RenderingAudioContext, _AudioContext);

  function RenderingAudioContext(opts) {
    _classCallCheck(this, RenderingAudioContext);

    opts = opts || /* istanbul ignore next */{};

    var sampleRate = util.defaults(opts.sampleRate, 44100);
    var blockSize = util.defaults(opts.blockSize, 128);
    var numberOfChannels = util.defaults(opts.channels || opts.numberOfChannels, 2);
    var bitDepth = util.defaults(opts.bitDepth, 16);
    var floatingPoint = opts.float || opts.floatingPoint;

    sampleRate = util.toValidSampleRate(sampleRate);
    blockSize = util.toValidBlockSize(blockSize);
    numberOfChannels = util.toValidNumberOfChannels(numberOfChannels);
    bitDepth = util.toValidBitDepth(bitDepth);
    floatingPoint = !!floatingPoint;

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(RenderingAudioContext).call(this, { sampleRate: sampleRate, blockSize: blockSize, numberOfChannels: numberOfChannels }));

    util.defineProp(_this, "_format", { sampleRate: sampleRate, numberOfChannels: numberOfChannels, bitDepth: bitDepth, floatingPoint: floatingPoint });
    util.defineProp(_this, "_rendered", []);
    return _this;
  }

  _createClass(RenderingAudioContext, [{
    key: "processTo",
    value: function processTo(time) {
      time = util.toAudioTime(time);

      var duration = time - this.currentTime;

      if (duration <= 0) {
        return;
      }

      var impl = this._impl;
      var blockSize = impl.blockSize;
      var iterations = Math.ceil(duration * this.sampleRate / blockSize);
      var bufferLength = blockSize * iterations;
      var numberOfChannels = this._format.numberOfChannels;
      var buffers = new Array(numberOfChannels).fill().map(function () {
        return new Float32Array(bufferLength);
      });

      impl.changeState("running");

      for (var i = 0; i < iterations; i++) {
        var audioData = impl.process();

        for (var ch = 0; ch < numberOfChannels; ch++) {
          buffers[ch].set(audioData.channelData[ch], i * blockSize);
        }
      }

      this._rendered.push(buffers);

      impl.changeState("suspended");
    }
  }, {
    key: "exportAsAudioData",
    value: function exportAsAudioData() {
      var numberOfChannels = this._format.numberOfChannels;
      var length = this._rendered.reduce(function (length, buffers) {
        return length + buffers[0].length;
      }, 0);
      var sampleRate = this._format.sampleRate;
      var channelData = new Array(numberOfChannels).fill().map(function () {
        return new Float32Array(length);
      });
      var audioData = { numberOfChannels: numberOfChannels, length: length, sampleRate: sampleRate, channelData: channelData };

      var offset = 0;

      this._rendered.forEach(function (buffers) {
        for (var ch = 0; ch < numberOfChannels; ch++) {
          channelData[ch].set(buffers[ch], offset);
        }
        offset += buffers[0].length;
      });

      return audioData;
    }
  }, {
    key: "encodeAudioData",
    value: function encodeAudioData(audioData, opts) {
      opts = Object.assign({}, this._format, opts);
      return encoder.encode(audioData, opts);
    }
  }, {
    key: "blockSize",
    get: function get() {
      return this._impl.blockSize;
    }
  }]);

  return RenderingAudioContext;
}(AudioContext);

module.exports = RenderingAudioContext;

},{"../api/AudioContext":7,"../encoder":37,"../util":86}],34:[function(require,module,exports){
(function (global){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var util = require("../util");
var AudioContext = require("../api/AudioContext");
var setImmediate = global.setImmediate || /* istanbul ignore next */function (fn) {
  return setTimeout(fn, 0);
};
var noopWriter = { write: function write() {
    return true;
  } };

var StreamAudioContext = function (_AudioContext) {
  _inherits(StreamAudioContext, _AudioContext);

  function StreamAudioContext(opts) {
    _classCallCheck(this, StreamAudioContext);

    opts = opts || /* istanbul ignore next */{};

    var sampleRate = util.defaults(opts.sampleRate, 44100);
    var blockSize = util.defaults(opts.blockSize, 128);
    var numberOfChannels = util.defaults(opts.channels || opts.numberOfChannels, 2);
    var bitDepth = util.defaults(opts.bitDepth, 16);
    var floatingPoint = opts.float || opts.floatingPoint;

    sampleRate = util.toValidSampleRate(sampleRate);
    blockSize = util.toValidBlockSize(blockSize);
    numberOfChannels = util.toValidNumberOfChannels(numberOfChannels);
    bitDepth = util.toValidBitDepth(bitDepth);
    floatingPoint = !!floatingPoint;

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(StreamAudioContext).call(this, { sampleRate: sampleRate, blockSize: blockSize, numberOfChannels: numberOfChannels }));

    var encoder = createEncoder(numberOfChannels, blockSize, bitDepth, floatingPoint);

    util.defineProp(_this, "_encoder", encoder);
    util.defineProp(_this, "_blockSize", blockSize);
    util.defineProp(_this, "_stream", noopWriter);
    util.defineProp(_this, "_isPlaying", false);
    return _this;
  }

  _createClass(StreamAudioContext, [{
    key: "pipe",
    value: function pipe(stream) {
      this._stream = stream;
      return stream;
    }
  }, {
    key: "resume",
    value: function resume() {
      if (this.state === "suspended") {
        this._resume();
      }
      return _get(Object.getPrototypeOf(StreamAudioContext.prototype), "resume", this).call(this);
    }
  }, {
    key: "suspend",
    value: function suspend() {
      if (this.state === "running") {
        this._suspend();
      }
      return _get(Object.getPrototypeOf(StreamAudioContext.prototype), "suspend", this).call(this);
    }
  }, {
    key: "close",
    value: function close() {
      if (this.state !== "closed") {
        this._close();
      }
      return _get(Object.getPrototypeOf(StreamAudioContext.prototype), "close", this).call(this);
    }
  }, {
    key: "_resume",
    value: function _resume() {
      var _this2 = this;

      var contextStartTime = this.currentTime;
      var timerStartTime = Date.now();
      var encoder = this._encoder;
      var impl = this._impl;
      var aheadTime = 0.1;

      var renderingProcess = function renderingProcess() {
        if (_this2.state !== "running") {
          return;
        }
        var contextElapsed = _this2.currentTime - contextStartTime;
        var timerElapsed = (Date.now() - timerStartTime) / 1000;

        if (contextElapsed < timerElapsed + aheadTime) {
          if (_this2._isPlaying) {
            var buffer = encoder.encode(impl.process());

            if (!_this2._stream.write(buffer)) {
              _this2._stream.once("drain", renderingProcess);
              return;
            }
          }
        }

        setImmediate(renderingProcess);
      };
      this._isPlaying = true;
      setImmediate(renderingProcess);
    }
  }, {
    key: "_suspend",
    value: function _suspend() {
      this._isPlaying = false;
    }
  }, {
    key: "_close",
    value: function _close() {
      this._suspend();
      if (this._stream !== null) {
        this._stream.end();
        this._stream = null;
      }
    }
  }, {
    key: "blockSize",
    get: function get() {
      return this._impl.blockSize;
    }
  }]);

  return StreamAudioContext;
}(AudioContext);

function createEncoder(numberOfChannels, length, bitDepth, floatingPoint) {
  bitDepth = floatingPoint ? 32 : bitDepth;
  floatingPoint = floatingPoint ? "f" : "";

  var bytes = bitDepth >> 3;
  var bufferLength = numberOfChannels * length * bytes;
  var buffer = new global.Buffer(new Uint8Array(bufferLength));
  var writer = createBufferWriter(buffer);
  var methodName = "pcm" + bitDepth + floatingPoint;

  if (!writer[methodName]) {
    throw new TypeError("Not supported bit depth: " + bitDepth);
  }

  var write = writer[methodName].bind(writer);

  return {
    encode: function encode(audioData) {
      var channelData = audioData.channelData;

      writer.rewind();

      for (var i = 0, imax = audioData.length; i < imax; i++) {
        for (var ch = 0; ch < numberOfChannels; ch++) {
          write(channelData[ch][i]);
        }
      }

      return buffer;
    }
  };
}

function createBufferWriter(buffer) {
  var pos = 0;

  return {
    rewind: function rewind() {
      pos = 0;
    },
    pcm8: function pcm8(value) {
      value = Math.max(-1, Math.min(value, +1));
      value = (value * 0.5 + 0.5) * 128;
      buffer.writeUInt8(value | 0, pos);
      pos += 1;
    },
    pcm16: function pcm16(value) {
      value = Math.max(-1, Math.min(value, +1));
      value = value < 0 ? value * 32768 : value * 32767;
      buffer.writeInt16LE(value | 0, pos);
      pos += 2;
    },
    pcm24: function pcm24(value) {
      value = Math.max(-1, Math.min(value, +1));
      value = value < 0 ? 0x1000000 + value * 8388608 : value * 8388607;
      value = value | 0;

      var x0 = value >> 0 & 0xFF;
      var x1 = value >> 8 & 0xFF;
      var x2 = value >> 16 & 0xFF;

      buffer.writeUInt8(x0, pos + 0);
      buffer.writeUInt8(x1, pos + 1);
      buffer.writeUInt8(x2, pos + 2);
      pos += 3;
    },
    pcm32: function pcm32(value) {
      value = Math.max(-1, Math.min(value, +1));
      value = value < 0 ? value * 2147483648 : value * 2147483647;
      buffer.writeInt32LE(value | 0, pos);
      pos += 4;
    },
    pcm32f: function pcm32f(value) {
      buffer.writeFloatLE(value, pos);
      pos += 4;
    }
  };
}

module.exports = StreamAudioContext;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../api/AudioContext":7,"../util":86}],35:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var util = require("../util");
var AudioContext = require("../api/AudioContext");
var DSPAlgorithm = [];

var WebAudioContext = function (_AudioContext) {
  _inherits(WebAudioContext, _AudioContext);

  function WebAudioContext(opts) {
    _classCallCheck(this, WebAudioContext);

    opts = opts || /* istanbul ignore next */{};

    var destination = opts.destination || opts.context.destination;
    var context = destination.context;
    var sampleRate = context.sampleRate;
    var blockSize = util.defaults(opts.blockSize, 128);
    var numberOfChannels = util.defaults(opts.numberOfChannels, 2);
    var bufferSize = util.defaults(bufferSize, 1024);

    blockSize = util.toValidBlockSize(blockSize);
    numberOfChannels = util.toValidNumberOfChannels(numberOfChannels);
    bufferSize = util.toPowerOfTwo(bufferSize);
    bufferSize = Math.max(256, Math.min(bufferSize, 16384));

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WebAudioContext).call(this, { sampleRate: sampleRate, blockSize: blockSize, numberOfChannels: numberOfChannels }));

    var processor = context.createScriptProcessor(bufferSize, 0, numberOfChannels);
    var dspProcess = DSPAlgorithm[numberOfChannels] || DSPAlgorithm[0];

    processor.onaudioprocess = dspProcess(_this._impl, numberOfChannels, bufferSize);

    util.defineProp(_this, "_originalContext", context);
    util.defineProp(_this, "_destination", destination);
    util.defineProp(_this, "_processor", processor);
    return _this;
  }

  _createClass(WebAudioContext, [{
    key: "resume",
    value: function resume() {
      if (this._processor) {
        this._processor.connect(this._destination);
      }
      return _get(Object.getPrototypeOf(WebAudioContext.prototype), "resume", this).call(this);
    }
  }, {
    key: "suspend",
    value: function suspend() {
      if (this._processor) {
        this._processor.disconnect();
      }
      return _get(Object.getPrototypeOf(WebAudioContext.prototype), "suspend", this).call(this);
    }
  }, {
    key: "close",
    value: function close() {
      if (this._processor) {
        this._processor.disconnect();
        this._processor = null;
      }
      return _get(Object.getPrototypeOf(WebAudioContext.prototype), "close", this).call(this);
    }
  }, {
    key: "originalContext",
    get: function get() {
      return this._originalContext;
    }
  }]);

  return WebAudioContext;
}(AudioContext);

DSPAlgorithm[0] = function (impl, numberOfChannels, bufferSize) {
  var blockSize = impl.blockSize;
  var iterations = bufferSize / blockSize;

  return function (e) {
    var channelData = new Array(numberOfChannels);

    for (var i = 0; i < iterations; i++) {
      var audioData = impl.process();

      for (var ch = 0; ch < numberOfChannels; ch++) {
        var output = channelData[ch] || (channelData[ch] = e.outputBuffer.getChannelData(ch));

        output.set(audioData.channelData[ch], i * blockSize);
      }
    }
  };
};

DSPAlgorithm[1] = function (impl, numberOfChannels, bufferSize) {
  var blockSize = impl.blockSize;
  var iterations = bufferSize / blockSize;

  return function (e) {
    var output = e.outputBuffer.getChannelData(0);

    for (var i = 0; i < iterations; i++) {
      var audioData = impl.process();

      output.set(audioData.channelData[0], i * blockSize);
    }
  };
};

DSPAlgorithm[2] = function (impl, numberOfChannels, bufferSize) {
  var blockSize = impl.blockSize;
  var iterations = bufferSize / blockSize;

  return function (e) {
    var outputL = e.outputBuffer.getChannelData(0);
    var outputR = e.outputBuffer.getChannelData(1);

    for (var i = 0; i < iterations; i++) {
      var audioData = impl.process();

      outputL.set(audioData.channelData[0], i * blockSize);
      outputR.set(audioData.channelData[1], i * blockSize);
    }
  };
};

module.exports = WebAudioContext;

},{"../api/AudioContext":7,"../util":86}],36:[function(require,module,exports){
"use strict";

var WavDecoder = require("wav-decoder");
var decoderUtil = require("./util/decoderUtil");
var audioDataUtil = require("./util/audioDataUtil");
var AudioBuffer = require("./api/AudioBuffer");

var decodeFn = WavDecoder.decode;

function get() {
  return decodeFn;
}

function set(fn) {
  /* istanbul ignore else */
  if (typeof fn === "function") {
    decodeFn = fn;
  }
}

function decode(audioData, opts) {
  return decoderUtil.decode(decodeFn, audioData, opts).then(function (audioData) {
    return audioDataUtil.toAudioBuffer(audioData, AudioBuffer);
  });
}

module.exports = { get: get, set: set, decode: decode };

},{"./api/AudioBuffer":5,"./util/audioDataUtil":82,"./util/decoderUtil":83,"wav-decoder":2}],37:[function(require,module,exports){
"use strict";

var WavEncoder = require("wav-encoder");
var encoderUtil = require("./util/encoderUtil");

var encodeFn = WavEncoder.encode;

function get() {
  return encodeFn;
}

function set(fn) {
  /* istanbul ignore else */
  if (typeof fn === "function") {
    encodeFn = fn;
  }
}

function encode(audioData, opts) {
  return encoderUtil.encode(encodeFn, audioData, opts);
}

module.exports = { get: get, set: set, encode: encode };

},{"./util/encoderUtil":85,"wav-encoder":3}],38:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var util = require("../util");
var AudioNode = require("./AudioNode");

var MaxFFTSize = 32768;
var MinFFTSize = 32;

var AnalyserNode = function (_AudioNode) {
  _inherits(AnalyserNode, _AudioNode);

  function AnalyserNode(context) {
    _classCallCheck(this, AnalyserNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AnalyserNode).call(this, context, {
      inputs: [1],
      outputs: [1],
      channelCount: 1,
      channelCountMode: "max"
    }));

    _this._fftSize = 2048;
    _this._minDecibels = -100;
    _this._maxDecibels = -30;
    _this._smoothingTimeConstant = 0.8;
    return _this;
  }

  _createClass(AnalyserNode, [{
    key: "getFftSize",
    value: function getFftSize() {
      return this._fftSize;
    }
  }, {
    key: "setFftSize",
    value: function setFftSize(value) {
      value = util.clip(value | 0, MinFFTSize, MaxFFTSize);
      value = util.toPowerOfTwo(value, Math.ceil);
      this._fftSize = value;
    }
  }, {
    key: "getFrequencyBinCount",
    value: function getFrequencyBinCount() {
      return this._fftSize / 2;
    }
  }, {
    key: "getMinDecibels",
    value: function getMinDecibels() {
      return this._minDecibels;
    }
  }, {
    key: "setMinDecibels",
    value: function setMinDecibels(value) {
      value = util.toNumber(value);
      /* istanbul ignore else */
      if (-Infinity < value && value < this._maxDecibels) {
        this._minDecibels = value;
      }
    }
  }, {
    key: "getMaxDecibels",
    value: function getMaxDecibels() {
      return this._maxDecibels;
    }
  }, {
    key: "setMaxDecibels",
    value: function setMaxDecibels(value) {
      value = util.toNumber(value);
      /* istanbul ignore else */
      if (this._minDecibels < value && value < Infinity) {
        this._maxDecibels = value;
      }
    }
  }, {
    key: "getSmoothingTimeConstant",
    value: function getSmoothingTimeConstant() {
      return this._smoothingTimeConstant;
    }
  }, {
    key: "setSmoothingTimeConstant",
    value: function setSmoothingTimeConstant(value) {
      value = util.clip(util.toNumber(value), 0, 1);
      this._smoothingTimeConstant = value;
    }

    /* istanbul ignore next */

  }, {
    key: "getFloatFrequencyData",
    value: function getFloatFrequencyData() {
      throw new TypeError("NOT YET IMPLEMENTED");
    }

    /* istanbul ignore next */

  }, {
    key: "getByteFrequencyData",
    value: function getByteFrequencyData() {
      throw new TypeError("NOT YET IMPLEMENTED");
    }

    /* istanbul ignore next */

  }, {
    key: "getFloatTimeDomainData",
    value: function getFloatTimeDomainData() {
      throw new TypeError("NOT YET IMPLEMENTED");
    }

    /* istanbul ignore next */

  }, {
    key: "getByteTimeDomainData",
    value: function getByteTimeDomainData() {
      throw new TypeError("NOT YET IMPLEMENTED");
    }
  }, {
    key: "channelDidUpdate",
    value: function channelDidUpdate(numberOfChannels) {
      this.getOutput(0).setNumberOfChannels(numberOfChannels);
    }
  }, {
    key: "dspProcess",
    value: function dspProcess() {
      var inputBus = this.getInput(0).getAudioBus();
      var outputBus = this.getOutput(0).getAudioBus();

      outputBus.copyFrom(inputBus);
    }
  }]);

  return AnalyserNode;
}(AudioNode);

module.exports = AnalyserNode;

},{"../util":86,"./AudioNode":44}],39:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require("../util");
var AudioData = require("./core/AudioData");

var AudioBuffer = function () {
  function AudioBuffer(context, opts) {
    _classCallCheck(this, AudioBuffer);

    opts = opts || /* istanbul ignore next */{};

    var numberOfChannels = opts.numberOfChannels;
    var length = opts.length;
    var sampleRate = opts.sampleRate;

    numberOfChannels = util.toValidNumberOfChannels(numberOfChannels);
    length = Math.max(0, util.toNumber(length));
    sampleRate = util.toValidSampleRate(sampleRate);

    this._audioData = new AudioData(numberOfChannels, length, sampleRate);
  }

  _createClass(AudioBuffer, [{
    key: "getSampleRate",
    value: function getSampleRate() {
      return this._audioData.sampleRate;
    }
  }, {
    key: "getLength",
    value: function getLength() {
      return this._audioData.length;
    }
  }, {
    key: "getDuration",
    value: function getDuration() {
      return this._audioData.length / this._audioData.sampleRate;
    }
  }, {
    key: "getNumberOfChannels",
    value: function getNumberOfChannels() {
      return this._audioData.numberOfChannels;
    }
  }, {
    key: "getAudioData",
    value: function getAudioData() {
      return this._audioData;
    }
  }, {
    key: "getChannelData",
    value: function getChannelData(channel) {
      return this._audioData.channelData[channel | 0];
    }
  }, {
    key: "copyFromChannel",
    value: function copyFromChannel(destination, channelNumber, startInChannel) {
      var source = this._audioData.channelData[channelNumber | 0];

      startInChannel = startInChannel | 0;

      destination.set(source.subarray(startInChannel, startInChannel + destination.length));
    }
  }, {
    key: "copyToChannel",
    value: function copyToChannel(source, channelNumber, startInChannel) {
      var destination = this._audioData.channelData[channelNumber | 0];

      startInChannel = startInChannel | 0;

      destination.set(source, startInChannel);
    }
  }]);

  return AudioBuffer;
}();

module.exports = AudioBuffer;

},{"../util":86,"./core/AudioData":66}],40:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var util = require("../util");
var AudioSourceNode = require("./AudioSourceNode");
var AudioBuffer = require("./AudioBuffer");
var AudioBufferSourceNodeDSP = require("./dsp/AudioBufferSourceNode");

var AudioBufferSourceNode = function (_AudioSourceNode) {
  _inherits(AudioBufferSourceNode, _AudioSourceNode);

  function AudioBufferSourceNode(context) {
    _classCallCheck(this, AudioBufferSourceNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AudioBufferSourceNode).call(this, context));

    _this._buffer = null;
    _this._audioData = null;
    _this._playbackRate = _this.addParam("control", 1);
    _this._detune = _this.addParam("control", 0);
    _this._loop = false;
    _this._loopStart = 0;
    _this._loopEnd = 0;
    _this._offset = 0;
    _this._startTime = Infinity;
    _this._stopTime = Infinity;
    _this._implicitStopTime = Infinity;
    return _this;
  }

  _createClass(AudioBufferSourceNode, [{
    key: "getBuffer",
    value: function getBuffer() {
      return this._buffer;
    }
  }, {
    key: "setBuffer",
    value: function setBuffer(value) {
      value = util.toImpl(value);

      /* istanbul ignore else */
      if (value instanceof AudioBuffer) {
        this._buffer = value;
        this._audioData = this._buffer.getAudioData();
        this.getOutput(0).setNumberOfChannels(this._audioData.numberOfChannels);
      }
    }
  }, {
    key: "getPlaybackRate",
    value: function getPlaybackRate() {
      return this._playbackRate;
    }
  }, {
    key: "getDetune",
    value: function getDetune() {
      return this._detune;
    }
  }, {
    key: "getLoop",
    value: function getLoop() {
      return this._loop;
    }
  }, {
    key: "setLoop",
    value: function setLoop(value) {
      this._loop = !!value;
    }
  }, {
    key: "getLoopStart",
    value: function getLoopStart() {
      return this._loopStart;
    }
  }, {
    key: "setLoopStart",
    value: function setLoopStart(value) {
      value = Math.max(0, util.toNumber(value));
      this._loopStart = value;
    }
  }, {
    key: "getLoopEnd",
    value: function getLoopEnd() {
      return this._loopEnd;
    }
  }, {
    key: "setLoopEnd",
    value: function setLoopEnd(value) {
      value = Math.max(0, util.toNumber(value));
      this._loopEnd = value;
    }
  }, {
    key: "start",
    value: function start(when, offset, duration) {
      /* istanbul ignore else */
      if (this._startTime === Infinity && this._audioData !== null) {
        when = Math.max(this.context.currentTime, util.toNumber(when));
        offset = offset | 0;
        this._startTime = when;
        this._offset = offset;
        if (typeof duration !== "undefined") {
          duration = Math.max(0, util.toNumber(duration));
          this._implicitStopTime = when + duration;
        }
        this.dspStart();
        this.getOutput(0).enable();
      }
    }
  }, {
    key: "stop",
    value: function stop(when) {
      /* istanbul ignore else */
      if (this._startTime !== Infinity && this._stopTime === Infinity) {
        when = Math.max(this.context.currentTime, this._startTime, util.toNumber(when));
        this._stopTime = when;
        this._implicitStopTime = Math.min(this._implicitStopTime, when);
      }
    }
  }]);

  return AudioBufferSourceNode;
}(AudioSourceNode);

module.exports = util.mixin(AudioBufferSourceNode, AudioBufferSourceNodeDSP);

},{"../util":86,"./AudioBuffer":39,"./AudioSourceNode":46,"./dsp/AudioBufferSourceNode":69}],41:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var config = require("../config");
var util = require("../util");
var EventTarget = require("./EventTarget");
var AudioDestinationNode = require("./AudioDestinationNode");
var AudioListener = require("./AudioListener");

var AudioContext = function (_EventTarget) {
  _inherits(AudioContext, _EventTarget);

  function AudioContext(opts) {
    _classCallCheck(this, AudioContext);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AudioContext).call(this));

    opts = Object.assign({}, config, opts);

    var sampleRate = util.toValidSampleRate(opts.sampleRate);
    var blockSize = util.toValidBlockSize(opts.blockSize, sampleRate);
    var numberOfChannels = util.toValidNumberOfChannels(opts.numberOfChannels);

    _this.sampleRate = sampleRate;
    _this.blockSize = blockSize;
    _this.numberOfChannels = numberOfChannels;
    _this.currentTime = 0;
    _this._destination = new AudioDestinationNode(_this, { numberOfChannels: numberOfChannels });
    _this._listener = new AudioListener(_this);
    _this._state = "suspended";
    _this._callbacksForPreProcess = [];
    _this._callbacksForPostProcess = null;
    _this._procTicks = 0;
    return _this;
  }

  _createClass(AudioContext, [{
    key: "getDestination",
    value: function getDestination() {
      return this._destination;
    }
  }, {
    key: "getSampleRate",
    value: function getSampleRate() {
      return this.sampleRate;
    }
  }, {
    key: "getCurrentTime",
    value: function getCurrentTime() {
      return this.currentTime;
    }
  }, {
    key: "getListener",
    value: function getListener() {
      return this._listener;
    }
  }, {
    key: "getState",
    value: function getState() {
      return this._state;
    }
  }, {
    key: "suspend",
    value: function suspend() {
      if (this._state === "running") {
        return this.changeState("suspended");
      }
      return this.notChangeState();
    }
  }, {
    key: "resume",
    value: function resume() {
      if (this._state === "suspended") {
        return this.changeState("running");
      }
      return this.notChangeState();
    }
  }, {
    key: "close",
    value: function close() {
      if (this._state !== "closed") {
        return this.changeState("closed");
      }
      return this.notChangeState();
    }
  }, {
    key: "changeState",
    value: function changeState(state) {
      var _this2 = this;

      this._state = state;
      return new Promise(function (resolve) {
        _this2.addPreProcess(function () {
          _this2.dispatchEvent({ type: "statechange" });
          resolve();
        });
      });
    }
  }, {
    key: "notChangeState",
    value: function notChangeState() {
      var _this3 = this;

      return new Promise(function (resolve) {
        _this3.addPreProcess(resolve);
      });
    }
  }, {
    key: "addPreProcess",
    value: function addPreProcess(task) {
      this._callbacksForPreProcess.push(task);
    }
  }, {
    key: "addPostProcess",
    value: function addPostProcess(task) {
      this._callbacksForPostProcess.push(task);
    }
  }, {
    key: "callTasks",
    value: function callTasks(tasks) {
      for (var i = 0, imax = tasks.length; i < imax; i++) {
        tasks[i]();
      }
    }
  }, {
    key: "process",
    value: function process() {
      this.callTasks(this._callbacksForPreProcess);
      this._callbacksForPreProcess = [];

      var destination = this._destination;
      var outputBus = destination.getOutput(0).getAudioBus();

      if (this._state === "running") {
        var sampleRate = this.sampleRate;
        var inNumSamples = this.blockSize;
        var currentTime = this.currentTime;
        var nextCurrentTime = currentTime + inNumSamples / sampleRate;
        var procItem = { sampleRate: sampleRate, inNumSamples: inNumSamples, currentTime: currentTime, nextCurrentTime: nextCurrentTime };

        this._callbacksForPostProcess = [];

        destination.processIfNecessary(procItem);

        this.callTasks(this._callbacksForPostProcess);
        this._procTicks += 1;
        this.currentTime = this._procTicks * inNumSamples / sampleRate;
      } else {
        outputBus.zeros();
      }

      return outputBus.getAudioData();
    }
  }, {
    key: "reset",
    value: function reset() {
      this.currentTime = 0;
      this._destination = new AudioDestinationNode(this, { numberOfChannels: this.numberOfChannels });
      this._listener = new AudioListener(this);
      this._state = "suspended";
      this._callbacksForPreProcess = [];
      this._callbacksForPostProcess = null;
      this._procTicks = 0;
    }
  }]);

  return AudioContext;
}(EventTarget);

module.exports = AudioContext;

},{"../config":31,"../util":86,"./AudioDestinationNode":42,"./AudioListener":43,"./EventTarget":55}],42:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var util = require("../util");
var AudioNode = require("./AudioNode");
var AudioNodeOutput = require("./core/AudioNodeOutput");

var AudioDestinationNode = function (_AudioNode) {
  _inherits(AudioDestinationNode, _AudioNode);

  function AudioDestinationNode(context, opts) {
    _classCallCheck(this, AudioDestinationNode);

    opts = opts || /* istanbul ignore next */{};

    var numberOfChannels = opts.numberOfChannels;

    numberOfChannels = util.toValidNumberOfChannels(numberOfChannels);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AudioDestinationNode).call(this, context, {
      inputs: [numberOfChannels],
      outputs: [],
      channelCount: numberOfChannels,
      channelCountMode: "explicit"
    }));

    _this._numberOfChannels = numberOfChannels;
    _this._output = new AudioNodeOutput({ node: _this, index: 0, numberOfChannels: numberOfChannels });
    _this._outputBus = _this._output.getAudioBus();
    _this._outputBus.setChannelInterpretation("speakers");
    _this._output.enable();
    return _this;
  }

  _createClass(AudioDestinationNode, [{
    key: "getMaxChannelCount",
    value: function getMaxChannelCount() {
      return this._numberOfChannels;
    }
  }, {
    key: "setChannelCount",
    value: function setChannelCount(value) {
      value = util.clip(value | 0, 1, this.getMaxChannelCount());
      _get(Object.getPrototypeOf(AudioDestinationNode.prototype), "setChannelCount", this).call(this, value);
    }
  }, {
    key: "getOutput",
    value: function getOutput() {
      return this._output;
    }
  }, {
    key: "dspProcess",
    value: function dspProcess() {
      var inputBus = this.getInput(0).getAudioBus();
      var outputBus = this._outputBus;

      outputBus.copyFrom(inputBus);
    }
  }]);

  return AudioDestinationNode;
}(AudioNode);

module.exports = AudioDestinationNode;

},{"../util":86,"./AudioNode":44,"./core/AudioNodeOutput":68}],43:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AudioListener = function () {
  function AudioListener(context) {
    _classCallCheck(this, AudioListener);

    this.context = context;
  }

  /* istanbul ignore next */


  _createClass(AudioListener, [{
    key: "setPosition",
    value: function setPosition() {
      throw new TypeError("NOT YET IMPLEMENTED");
    }

    /* istanbul ignore next */

  }, {
    key: "setOrientation",
    value: function setOrientation() {
      throw new TypeError("NOT YET IMPLEMENTED");
    }
  }]);

  return AudioListener;
}();

module.exports = AudioListener;

},{}],44:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var util = require("../util");
var EventTarget = require("./EventTarget");
var AudioNodeInput = require("./core/AudioNodeInput");
var AudioNodeOutput = require("./core/AudioNodeOutput");
var AudioParam = require("./AudioParam");

var AudioNode = function (_EventTarget) {
  _inherits(AudioNode, _EventTarget);

  function AudioNode(context, opts) {
    _classCallCheck(this, AudioNode);

    opts = opts || /* istanbul ignore next */{};

    var inputs = util.defaults(opts.inputs, []);
    var outputs = util.defaults(opts.outputs, []);
    var channelCount = util.defaults(opts.channelCount, 1);
    var channelCountMode = util.defaults(opts.channelCountMode, "max");

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AudioNode).call(this));

    _this.context = context;
    _this.blockSize = context.blockSize;
    _this.sampleRate = context.sampleRate;

    _this._inputs = [];
    _this._outputs = [];
    _this._params = [];
    _this._enabled = false;
    _this._lastProcessingTime = -1;

    inputs.forEach(function (numberOfChannels) {
      _this.addInput(numberOfChannels, channelCount, channelCountMode);
    });
    outputs.forEach(function (numberOfChannels) {
      _this.addOutput(numberOfChannels);
    });
    return _this;
  }

  _createClass(AudioNode, [{
    key: "getContext",
    value: function getContext() {
      return this.context;
    }
  }, {
    key: "getNumberOfInputs",
    value: function getNumberOfInputs() {
      return this._inputs.length;
    }
  }, {
    key: "getNumberOfOutputs",
    value: function getNumberOfOutputs() {
      return this._outputs.length;
    }
  }, {
    key: "getChannelCount",
    value: function getChannelCount() {
      return this._inputs[0].getChannelCount();
    }
  }, {
    key: "setChannelCount",
    value: function setChannelCount(value) {
      this._inputs[0].setChannelCount(value);
    }
  }, {
    key: "getChannelCountMode",
    value: function getChannelCountMode() {
      return this._inputs[0].getChannelCountMode();
    }
  }, {
    key: "setChannelCountMode",
    value: function setChannelCountMode(value) {
      this._inputs[0].setChannelCountMode(value);
    }
  }, {
    key: "getChannelInterpretation",
    value: function getChannelInterpretation() {
      return this._inputs[0].getChannelInterpretation();
    }
  }, {
    key: "setChannelInterpretation",
    value: function setChannelInterpretation(value) {
      this._inputs[0].setChannelInterpretation(value);
    }
  }, {
    key: "connect",
    value: function connect(destination, output, input) {
      this._outputs[output | 0].connect(destination, input | 0);
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      var args = Array.from(arguments);

      if (args.length === 0) {
        return this.disconnectAll();
      }
      if (typeof args[0] === "number") {
        return this.disconnectAllFromOutput(args[0] | 0);
      }
      if (args.length === 1) {
        return this.disconnectIfConnected(args[0]);
      }
      return this.disconnectFromOutputIfConnected(args[1] | 0, args[0], args[2] | 0);
    }
  }, {
    key: "addInput",
    value: function addInput(numberOfChannels, channelCount, channelCountMode) {
      var node = this;
      var index = this._inputs.length;
      var input = new AudioNodeInput({ node: node, index: index, numberOfChannels: numberOfChannels, channelCount: channelCount, channelCountMode: channelCountMode });

      this._inputs.push(input);

      return input;
    }
  }, {
    key: "addOutput",
    value: function addOutput(numberOfChannels) {
      var node = this;
      var index = this._outputs.length;
      var output = new AudioNodeOutput({ node: node, index: index, numberOfChannels: numberOfChannels });

      this._outputs.push(output);

      return output;
    }
  }, {
    key: "addParam",
    value: function addParam(rate, defaultValue) {
      var param = new AudioParam(this, { rate: rate, defaultValue: defaultValue });

      this._params.push(param);

      return param;
    }
  }, {
    key: "getInput",
    value: function getInput(channel) {
      return this._inputs[channel | 0];
    }
  }, {
    key: "getOutput",
    value: function getOutput(channel) {
      return this._outputs[channel | 0];
    }
  }, {
    key: "isEnabled",
    value: function isEnabled() {
      return this._enabled;
    }
  }, {
    key: "enableOutputsIfNecessary",
    value: function enableOutputsIfNecessary() {
      if (!this._enabled) {
        this._enabled = true;
        this._outputs.forEach(function (output) {
          output.enable();
        });
      }
    }
  }, {
    key: "disableOutputsIfNecessary",
    value: function disableOutputsIfNecessary() {
      if (this._enabled) {
        this._enabled = false;
        this._outputs.forEach(function (output) {
          output.disable();
        });
      }
    }
  }, {
    key: "channelDidUpdate",
    value: function channelDidUpdate() {}
  }, {
    key: "disconnectAll",
    value: function disconnectAll() {
      this._outputs.forEach(function (output) {
        output.disconnect();
      });
    }
  }, {
    key: "disconnectAllFromOutput",
    value: function disconnectAllFromOutput(output) {
      this._outputs[output | 0].disconnect();
    }
  }, {
    key: "disconnectIfConnected",
    value: function disconnectIfConnected(destination) {
      this._outputs.forEach(function (output) {
        output.disconnect(destination);
      });
    }
  }, {
    key: "disconnectFromOutputIfConnected",
    value: function disconnectFromOutputIfConnected(output, destination, input) {
      this._outputs[output | 0].disconnect(destination, input | 0);
    }
  }, {
    key: "isConnectedTo",
    value: function isConnectedTo() {
      var args = Array.from(arguments);

      if (args.length === 1) {
        return this._outputs.some(function (output) {
          return output.isConnectedTo(args[0]);
        });
      }

      var output = args.splice(1, 1)[0] | 0;

      if (this._outputs[output]) {
        return this._outputs[output].isConnectedTo.apply(this._outputs[output], args);
      }

      return false;
    }
  }, {
    key: "isConnectedFrom",
    value: function isConnectedFrom() {
      var args = Array.from(arguments);

      if (args[0] && args[0].isConnectedTo) {
        return args[0].isConnectedTo.apply(args[0], [this].concat(args.slice(1)));
      }

      return false;
    }
  }, {
    key: "processIfNecessary",
    value: function processIfNecessary(e) {
      if (e.currentTime <= this._lastProcessingTime) {
        return;
      }
      this._lastProcessingTime = e.currentTime;

      var inputs = this._inputs;

      for (var i = 0, imax = inputs.length; i < imax; i++) {
        inputs[i].pull(e);
      }

      var params = this._params;

      for (var _i = 0, _imax = params.length; _i < _imax; _i++) {
        params[_i].dspProcess(e);
      }

      this.dspProcess(e);
    }
  }, {
    key: "dspInit",
    value: function dspInit() {}
  }, {
    key: "dspProcess",
    value: function dspProcess() {}
  }]);

  return AudioNode;
}(EventTarget);

module.exports = AudioNode;

},{"../util":86,"./AudioParam":45,"./EventTarget":55,"./core/AudioNodeInput":67,"./core/AudioNodeOutput":68}],45:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require("../util");
var AudioNodeInput = require("./core/AudioNodeInput");
var AudioBus = require("./core/AudioBus");
var AudioParamDSP = require("./dsp/AudioParam");

var AudioParam = function () {
  function AudioParam(context, opts) {
    _classCallCheck(this, AudioParam);

    opts = opts || /* istanbul ignore next */{};

    var rate = util.defaults(opts.rate, "control");
    var defaultValue = util.defaults(opts.defaultValue, 0);

    this.context = context;
    this.blockSize = context.blockSize;
    this.sampleRate = context.sampleRate;
    this._rate = this.fromRateName(rate);
    this._defaultValue = util.toNumber(defaultValue);
    this._value = this._defaultValue;
    this._timeline = [];
    this._inputs = [new AudioNodeInput({
      node: this,
      index: 0,
      numberOfChannels: 1,
      channelCount: 1,
      channelCountMode: "explicit"
    })];
    this._outpus = [];
    this._outputBus = new AudioBus(1, this.blockSize, this.sampleRate);

    this.dspInit(this._rate);
  }

  _createClass(AudioParam, [{
    key: "getValue",
    value: function getValue() {
      return this._value;
    }
  }, {
    key: "setValue",
    value: function setValue(value) {
      this._value = util.toNumber(value);
    }
  }, {
    key: "getDefaultValue",
    value: function getDefaultValue() {
      return this._defaultValue;
    }
  }, {
    key: "setValueAtTime",
    value: function setValueAtTime(value, startTime) {
      value = util.toNumber(value);
      startTime = Math.max(0, util.toNumber(startTime));

      this.insertEvent({
        type: AudioParamDSP.SET_VALUE_AT_TIME,
        time: startTime,
        args: [value, startTime]
      });
    }
  }, {
    key: "linearRampToValueAtTime",
    value: function linearRampToValueAtTime(value, endTime) {
      value = util.toNumber(value);
      endTime = Math.max(0, util.toNumber(endTime));

      this.insertEvent({
        type: AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME,
        time: endTime,
        args: [value, endTime]
      });
    }
  }, {
    key: "exponentialRampToValueAtTime",
    value: function exponentialRampToValueAtTime(value, endTime) {
      value = Math.max(1e-6, util.toNumber(value));
      endTime = Math.max(0, util.toNumber(endTime));

      this.insertEvent({
        type: AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME,
        time: endTime,
        args: [value, endTime]
      });
    }
  }, {
    key: "setTargetAtTime",
    value: function setTargetAtTime(target, startTime, timeConstant) {
      target = util.toNumber(target);
      startTime = Math.max(0, util.toNumber(startTime));
      timeConstant = Math.max(0, util.toNumber(timeConstant));

      this.insertEvent({
        type: AudioParamDSP.SET_TARGET_AT_TIME,
        time: startTime,
        args: [target, startTime, timeConstant]
      });
    }
  }, {
    key: "setValueCurveAtTime",
    value: function setValueCurveAtTime(values, startTime, duration) {
      startTime = Math.max(0, util.toNumber(startTime));
      duration = Math.max(0, util.toNumber(duration));

      this.insertEvent({
        type: AudioParamDSP.SET_VALUE_CURVE_AT_TIME,
        time: startTime,
        args: [values, startTime, duration]
      });
    }
  }, {
    key: "cancelScheduledValues",
    value: function cancelScheduledValues(startTime) {
      startTime = Math.max(0, util.toNumber(startTime));

      this._timeline = this._timeline.filter(function (eventItem) {
        return eventItem.time < startTime;
      });
    }
  }, {
    key: "getContext",
    value: function getContext() {
      return this.context;
    }
  }, {
    key: "getInput",
    value: function getInput(channel) {
      return this._inputs[channel | 0];
    }
  }, {
    key: "getRate",
    value: function getRate() {
      return this.toRateName(this._rate);
    }
  }, {
    key: "hasSampleAccurateValues",
    value: function hasSampleAccurateValues() {
      return this._hasSampleAccurateValues;
    }
  }, {
    key: "getSampleAccurateValues",
    value: function getSampleAccurateValues() {
      return this._outputBus.getChannelData()[0];
    }

    /* istanbul ignore next */

  }, {
    key: "enableOutputsIfNecessary",
    value: function enableOutputsIfNecessary() {}

    /* istanbul ignore next */

  }, {
    key: "disableOutputsIfNecessary",
    value: function disableOutputsIfNecessary() {}
  }, {
    key: "isConnectedFrom",
    value: function isConnectedFrom() {
      var args = Array.from(arguments);

      if (args[0] && args[0].isConnectedTo) {
        return args[0].isConnectedTo.apply(args[0], [this].concat(args.slice(1)));
      }

      return false;
    }
  }, {
    key: "getEvents",
    value: function getEvents() {
      var _this = this;

      return this._timeline.map(function (event) {
        return {
          type: _this.toMethodName(event.type),
          time: event.time,
          args: event.args
        };
      });
    }
  }, {
    key: "insertEvent",
    value: function insertEvent(eventItem) {
      var time = eventItem.time;
      var events = this._timeline;

      if (events.length === 0 || events[events.length - 1].time < time) {
        events.push(eventItem);
        return;
      }

      var pos = 0;
      var replace = 0;

      while (pos < events.length) {
        if (events[pos].time === time && events[pos].type === eventItem.type) {
          replace = 1;
          break;
        }
        if (time < events[pos].time) {
          break;
        }
        pos += 1;
      }

      events.splice(pos, replace, eventItem);
    }
  }, {
    key: "fromRateName",
    value: function fromRateName(value) {
      if (value === "audio") {
        return AudioParamDSP.AUDIO;
      }
      return AudioParamDSP.CONTROL;
    }
  }, {
    key: "toRateName",
    value: function toRateName(value) {
      if (value === AudioParamDSP.AUDIO) {
        return "audio";
      }
      return "control";
    }
  }, {
    key: "toMethodName",
    value: function toMethodName(value) {
      switch (value) {
        case AudioParamDSP.SET_VALUE_AT_TIME:
          return "setValueAtTime";
        case AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME:
          return "linearRampToValueAtTime";
        case AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
          return "exponentialRampToValueAtTime";
        case AudioParamDSP.SET_TARGET_AT_TIME:
          return "setTargetAtTime";
        case AudioParamDSP.SET_VALUE_CURVE_AT_TIME:
          return "setValueCurveAtTime";
      }
      /* istanbul ignore next */
    }
  }]);

  return AudioParam;
}();

module.exports = util.mixin(AudioParam, AudioParamDSP);

},{"../util":86,"./core/AudioBus":65,"./core/AudioNodeInput":67,"./dsp/AudioParam":70}],46:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("./AudioNode");

/* istanbul ignore next */

var AudioSourceNode = function (_AudioNode) {
  _inherits(AudioSourceNode, _AudioNode);

  function AudioSourceNode(context) {
    _classCallCheck(this, AudioSourceNode);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(AudioSourceNode).call(this, context, {
      inputs: [],
      outputs: [1]
    }));
  }

  _createClass(AudioSourceNode, [{
    key: "getChannelCount",
    value: function getChannelCount() {
      return 0;
    }
  }, {
    key: "setChannelCount",
    value: function setChannelCount() {}
  }, {
    key: "getChannelCountMode",
    value: function getChannelCountMode() {
      return "explicit";
    }
  }, {
    key: "setChannelCountMode",
    value: function setChannelCountMode() {}
  }, {
    key: "getChannelInterpretation",
    value: function getChannelInterpretation() {
      return "discrete";
    }
  }, {
    key: "setChannelInterpretation",
    value: function setChannelInterpretation() {}
  }, {
    key: "enableOutputsIfNecessary",
    value: function enableOutputsIfNecessary() {}
  }, {
    key: "disableOutputsIfNecessary",
    value: function disableOutputsIfNecessary() {}
  }]);

  return AudioSourceNode;
}(AudioNode);

module.exports = AudioSourceNode;

},{"./AudioNode":44}],47:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var util = require("../util");
var AudioNode = require("./AudioNode");

var AudioWorkerNode = function (_AudioNode) {
  _inherits(AudioWorkerNode, _AudioNode);

  function AudioWorkerNode(context, opts) {
    _classCallCheck(this, AudioWorkerNode);

    opts = opts || /* istanbul ignore next */{};

    var worker = opts.worker;
    var numberOfInputs = util.defaults(opts.numberOfInputs, 0);
    var numberOfOutputs = util.defaults(opts.numberOfOutputs, 0);

    var inputs = util.toArrayIfNeeded(numberOfInputs).map(util.toValidNumberOfChannels);
    var outputs = util.toArrayIfNeeded(numberOfOutputs).map(util.toValidNumberOfChannels);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AudioWorkerNode).call(this, context, {
      inputs: inputs,
      outputs: outputs,
      channelCount: 0,
      channelCountMode: "explicit"
    }));

    _this._maxChannelCount = inputs.reduce(function (maxValue, numberOfChannels) {
      return Math.max(maxValue, numberOfChannels);
    }, 0);
    _this._worker = worker;
    _this._inputs.forEach(function (input, index) {
      input.setChannelCount(inputs[index]);
    });
    _this.enableOutputsIfNecessary();
    return _this;
  }

  _createClass(AudioWorkerNode, [{
    key: "getChannelCount",
    value: function getChannelCount() {
      return this._maxChannelCount;
    }
  }, {
    key: "setChannelCount",
    value: function setChannelCount() {
      // This node's channelCount cannot be changed.
    }
  }, {
    key: "getChannelCountMode",
    value: function getChannelCountMode() {
      return "explicit";
    }
  }, {
    key: "setChannelCountMode",
    value: function setChannelCountMode() {
      // This node's channelCountMode cannot be changed.
    }
  }, {
    key: "getChannelInterpretation",
    value: function getChannelInterpretation() {
      return this._inputs[0].getChannelInterpretation();
    }
  }, {
    key: "setChannelInterpretation",
    value: function setChannelInterpretation(value) {
      this._inputs.forEach(function (input) {
        input.setChannelInterpretation(value);
      });
    }

    /* istanbul ignore next */

  }, {
    key: "postMessage",
    value: function postMessage() {
      throw new TypeError("NOT YET IMPLEMENTED");
    }
  }, {
    key: "getWorker",
    value: function getWorker() {
      return this._worker;
    }
  }, {
    key: "disableOutputsIfNecessary",
    value: function disableOutputsIfNecessary() {
      // This node cannot disable.
    }
  }]);

  return AudioWorkerNode;
}(AudioNode);

module.exports = AudioWorkerNode;

},{"../util":86,"./AudioNode":44}],48:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var util = require("../util");
var AudioNode = require("./AudioNode");

var PanningModelTypes = ["equalpower", "HRTF"];
var DistanceModelTypes = ["linear", "inverse", "exponential"];

var BasePannerNode = function (_AudioNode) {
  _inherits(BasePannerNode, _AudioNode);

  function BasePannerNode(context) {
    _classCallCheck(this, BasePannerNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BasePannerNode).call(this, context, {
      inputs: [1],
      outputs: [2],
      channelCount: 2,
      channelCountMode: "clamped-max"
    }));

    _this._panningModel = "equalpower";
    _this._distanceModel = "inverse";
    _this._refDistance = 1;
    _this._maxDistance = 10000;
    _this._rolloffFactor = 1;
    _this._coneInnerAngle = 360;
    _this._coneOuterAngle = 360;
    _this._coneOuterGain = 0;
    return _this;
  }

  _createClass(BasePannerNode, [{
    key: "setChannelCount",
    value: function setChannelCount(value) {
      value = util.clip(value | 0, 1, 2);
      _get(Object.getPrototypeOf(BasePannerNode.prototype), "setChannelCount", this).call(this, value);
    }
  }, {
    key: "setChannelCountMode",
    value: function setChannelCountMode(value) {
      /* istanbul ignore else */
      if (value === "clamped-max" || value === "explicit") {
        _get(Object.getPrototypeOf(BasePannerNode.prototype), "setChannelCountMode", this).call(this, value);
      }
    }
  }, {
    key: "getPanningModel",
    value: function getPanningModel() {
      return this._panningModel;
    }
  }, {
    key: "setPanningModel",
    value: function setPanningModel(value) {
      /* istanbul ignore else */
      if (PanningModelTypes.indexOf(value) !== -1) {
        this._panningModel = value;
      }
    }
  }, {
    key: "getDistanceModel",
    value: function getDistanceModel() {
      return this._distanceModel;
    }
  }, {
    key: "setDistanceModel",
    value: function setDistanceModel(value) {
      /* istanbul ignore else */
      if (DistanceModelTypes.indexOf(value) !== -1) {
        this._distanceModel = value;
      }
    }
  }, {
    key: "getRefDistance",
    value: function getRefDistance() {
      return this._refDistance;
    }
  }, {
    key: "setRefDistance",
    value: function setRefDistance(value) {
      this._refDistance = util.toNumber(value);
    }
  }, {
    key: "getMaxDistance",
    value: function getMaxDistance() {
      return this._maxDistance;
    }
  }, {
    key: "setMaxDistance",
    value: function setMaxDistance(value) {
      this._maxDistance = util.toNumber(value);
    }
  }, {
    key: "getRolloffFactor",
    value: function getRolloffFactor() {
      return this._rolloffFactor;
    }
  }, {
    key: "setRolloffFactor",
    value: function setRolloffFactor(value) {
      this._rolloffFactor = util.toNumber(value);
    }
  }, {
    key: "getConeInnerAngle",
    value: function getConeInnerAngle() {
      return this._coneInnerAngle;
    }
  }, {
    key: "setConeInnerAngle",
    value: function setConeInnerAngle(value) {
      this._coneInnerAngle = util.toNumber(value);
    }
  }, {
    key: "getConeOuterAngle",
    value: function getConeOuterAngle() {
      return this._coneOuterAngle;
    }
  }, {
    key: "setConeOuterAngle",
    value: function setConeOuterAngle(value) {
      this._coneOuterAngle = util.toNumber(value);
    }
  }, {
    key: "getConeOuterGain",
    value: function getConeOuterGain() {
      return this._coneOuterGain;
    }
  }, {
    key: "setConeOuterGain",
    value: function setConeOuterGain(value) {
      this._coneOuterGain = util.toNumber(value);
    }
  }]);

  return BasePannerNode;
}(AudioNode);

module.exports = BasePannerNode;

},{"../util":86,"./AudioNode":44}],49:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var util = require("../util");
var AudioNode = require("./AudioNode");
var BiquadFilterNodeDSP = require("./dsp/BiquadFilterNode");

var BiquadFilterNode = function (_AudioNode) {
  _inherits(BiquadFilterNode, _AudioNode);

  function BiquadFilterNode(context) {
    _classCallCheck(this, BiquadFilterNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BiquadFilterNode).call(this, context, {
      inputs: [1],
      outputs: [1],
      channelCount: 2,
      channelCountMode: "max"
    }));

    _this._type = BiquadFilterNodeDSP.LOWPASS;
    _this._frequency = _this.addParam("control", 350);
    _this._detune = _this.addParam("control", 0);
    _this._Q = _this.addParam("control", 1);
    _this._gain = _this.addParam("control", 0);

    _this.dspInit();
    _this.dspSetNumberOfChannels(1);
    return _this;
  }

  _createClass(BiquadFilterNode, [{
    key: "getType",
    value: function getType() {
      return this.toFilterTypeName(this._type);
    }
  }, {
    key: "setType",
    value: function setType(value) {
      value = this.fromFilterTypeName(value);
      /* istanbul ignore else */
      if (BiquadFilterNodeDSP.FilterTypes.indexOf(value) !== -1) {
        this._type = value;
      }
    }
  }, {
    key: "getFrequency",
    value: function getFrequency() {
      return this._frequency;
    }
  }, {
    key: "getDetune",
    value: function getDetune() {
      return this._detune;
    }
  }, {
    key: "getQ",
    value: function getQ() {
      return this._Q;
    }
  }, {
    key: "getGain",
    value: function getGain() {
      return this._gain;
    }

    /* istanbul ignore next */

  }, {
    key: "getFrequencyResponse",
    value: function getFrequencyResponse() {
      throw new TypeError("NOT YET IMPLEMENTED");
    }
  }, {
    key: "channelDidUpdate",
    value: function channelDidUpdate(numberOfChannels) {
      this.dspSetNumberOfChannels(numberOfChannels);
      this.getOutput(0).setNumberOfChannels(numberOfChannels);
    }
  }, {
    key: "fromFilterTypeName",
    value: function fromFilterTypeName(value) {
      switch (value) {
        case "lowpass":
          return BiquadFilterNodeDSP.LOWPASS;
        case "highpass":
          return BiquadFilterNodeDSP.HIGHPASS;
        case "bandpass":
          return BiquadFilterNodeDSP.BANDPASS;
        case "lowshelf":
          return BiquadFilterNodeDSP.LOWSHELF;
        case "highshelf":
          return BiquadFilterNodeDSP.HIGHSHELF;
        case "peaking":
          return BiquadFilterNodeDSP.PEAKING;
        case "notch":
          return BiquadFilterNodeDSP.NOTCH;
        case "allpass":
          return BiquadFilterNodeDSP.ALLPASS;
      }
      return -1;
    }
  }, {
    key: "toFilterTypeName",
    value: function toFilterTypeName(value) {
      switch (value) {
        case BiquadFilterNodeDSP.LOWPASS:
          return "lowpass";
        case BiquadFilterNodeDSP.HIGHPASS:
          return "highpass";
        case BiquadFilterNodeDSP.BANDPASS:
          return "bandpass";
        case BiquadFilterNodeDSP.LOWSHELF:
          return "lowshelf";
        case BiquadFilterNodeDSP.HIGHSHELF:
          return "highshelf";
        case BiquadFilterNodeDSP.PEAKING:
          return "peaking";
        case BiquadFilterNodeDSP.NOTCH:
          return "notch";
        case BiquadFilterNodeDSP.ALLPASS:
          return "allpass";
      }
      /* istanbul ignore next */
    }
  }]);

  return BiquadFilterNode;
}(AudioNode);

module.exports = util.mixin(BiquadFilterNode, BiquadFilterNodeDSP);

},{"../util":86,"./AudioNode":44,"./dsp/BiquadFilterNode":71}],50:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var util = require("../util");
var AudioNode = require("./AudioNode");
var ChannelMergerNodeDSP = require("./dsp/ChannelMergerNode");

var ChannelMergerNode = function (_AudioNode) {
  _inherits(ChannelMergerNode, _AudioNode);

  function ChannelMergerNode(context, opts) {
    _classCallCheck(this, ChannelMergerNode);

    opts = opts || /* istanbul ignore next */{};

    var numberOfInputs = util.defaults(opts.numberOfInputs, 6);

    numberOfInputs = util.toValidNumberOfChannels(numberOfInputs);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ChannelMergerNode).call(this, context, {
      inputs: new Array(numberOfInputs).fill(1),
      outputs: [numberOfInputs],
      channelCount: 1,
      channelCountMode: "explicit"
    }));
  }

  _createClass(ChannelMergerNode, [{
    key: "getChannelCount",
    value: function getChannelCount() {
      return 1;
    }
  }, {
    key: "setChannelCount",
    value: function setChannelCount() {
      // This node's channelCount cannot be changed.
    }
  }, {
    key: "getChannelCountMode",
    value: function getChannelCountMode() {
      return "explicit";
    }
  }, {
    key: "setChannelCountMode",
    value: function setChannelCountMode() {
      // This node's channelCountMode cannot be changed.
    }
  }, {
    key: "getChannelInterpretation",
    value: function getChannelInterpretation() {
      return this._inputs[0].getChannelInterpretation();
    }
  }, {
    key: "setChannelInterpretation",
    value: function setChannelInterpretation(value) {
      this._inputs.forEach(function (input) {
        input.setChannelInterpretation(value);
      });
    }
  }, {
    key: "disableOutputsIfNecessary",
    value: function disableOutputsIfNecessary() {
      // disable if all inputs are disabled

      /* istanbul ignore else */
      if (this.isEnabled()) {
        var numberOfInputs = this.getNumberOfInputs();

        for (var i = 0; i < numberOfInputs; i++) {
          if (this.getInput(i).isEnabled()) {
            return;
          }
        }

        _get(Object.getPrototypeOf(ChannelMergerNode.prototype), "disableOutputsIfNecessary", this).call(this);
      }
    }
  }]);

  return ChannelMergerNode;
}(AudioNode);

module.exports = util.mixin(ChannelMergerNode, ChannelMergerNodeDSP);

},{"../util":86,"./AudioNode":44,"./dsp/ChannelMergerNode":72}],51:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var util = require("../util");
var AudioNode = require("./AudioNode");
var ChannelSplitterNodeDSP = require("./dsp/ChannelSplitterNode");

var ChannelSplitterNode = function (_AudioNode) {
  _inherits(ChannelSplitterNode, _AudioNode);

  function ChannelSplitterNode(context, opts) {
    _classCallCheck(this, ChannelSplitterNode);

    opts = opts || /* istanbul ignore next */{};

    var numberOfOutputs = util.defaults(opts.numberOfOutputs, 6);

    numberOfOutputs = util.toValidNumberOfChannels(numberOfOutputs);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ChannelSplitterNode).call(this, context, {
      inputs: [1],
      outputs: new Array(numberOfOutputs).fill(1),
      channelCount: 2,
      channelCountMode: "max"
    }));
  }

  return ChannelSplitterNode;
}(AudioNode);

module.exports = util.mixin(ChannelSplitterNode, ChannelSplitterNodeDSP);

},{"../util":86,"./AudioNode":44,"./dsp/ChannelSplitterNode":73}],52:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var util = require("../util");
var AudioNode = require("./AudioNode");
var AudioBuffer = require("./AudioBuffer");

var ConvolverNode = function (_AudioNode) {
  _inherits(ConvolverNode, _AudioNode);

  function ConvolverNode(context) {
    _classCallCheck(this, ConvolverNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ConvolverNode).call(this, context, {
      inputs: [1],
      outputs: [1],
      channelCount: 2,
      channelCountMode: "clamped-max"
    }));

    _this._buffer = null;
    _this._audioData = null;
    _this._normalize = true;
    return _this;
  }

  _createClass(ConvolverNode, [{
    key: "setChannelCount",
    value: function setChannelCount(value) {
      value = util.clip(value | 0, 1, 2);
      _get(Object.getPrototypeOf(ConvolverNode.prototype), "setChannelCount", this).call(this, value);
    }
  }, {
    key: "setChannelCountMode",
    value: function setChannelCountMode(value) {
      /* istanbul ignore else */
      if (value === "clamped-max" || value === "explicit") {
        _get(Object.getPrototypeOf(ConvolverNode.prototype), "setChannelCountMode", this).call(this, value);
      }
    }
  }, {
    key: "getBuffer",
    value: function getBuffer() {
      return this._buffer;
    }
  }, {
    key: "setBuffer",
    value: function setBuffer(value) {
      value = util.toImpl(value);

      /* istanbul ignore else */
      if (value instanceof AudioBuffer) {
        this._buffer = value;
        this._audioData = this._buffer.getAudioData();
      }
    }
  }, {
    key: "getNormalize",
    value: function getNormalize() {
      return this._normalize;
    }
  }, {
    key: "setNormalize",
    value: function setNormalize(value) {
      this._normalize = !!value;
    }
  }, {
    key: "channelDidUpdate",
    value: function channelDidUpdate(numberOfChannels) {
      numberOfChannels = Math.min(numberOfChannels, 2);

      this.getOutput(0).setNumberOfChannels(numberOfChannels);
    }
  }, {
    key: "dspProcess",
    value: function dspProcess() {
      var inputBus = this.getInput(0).getAudioBus();
      var outputBus = this.getOutput(0).getAudioBus();

      outputBus.zeros();
      outputBus.sumFrom(inputBus);
    }
  }]);

  return ConvolverNode;
}(AudioNode);

module.exports = ConvolverNode;

},{"../util":86,"./AudioBuffer":39,"./AudioNode":44}],53:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var util = require("../util");
var AudioNode = require("./AudioNode");
var DelayNodeDSP = require("./dsp/DelayNode");

var DelayNode = function (_AudioNode) {
  _inherits(DelayNode, _AudioNode);

  function DelayNode(context, opts) {
    _classCallCheck(this, DelayNode);

    opts = opts || /* istanbul ignore next */{};

    var maxDelayTime = util.defaults(opts.maxDelayTime, 1);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DelayNode).call(this, context, {
      inputs: [1],
      outputs: [1],
      channelCount: 2,
      channelCountMode: "max"
    }));

    _this._maxDelayTime = Math.max(0, util.toNumber(maxDelayTime));
    _this._delayTime = _this.addParam("audio", 0);

    _this.dspInit(_this._maxDelayTime);
    return _this;
  }

  _createClass(DelayNode, [{
    key: "getDelayTime",
    value: function getDelayTime() {
      return this._delayTime;
    }
  }, {
    key: "getMaxDelayTime",
    value: function getMaxDelayTime() {
      return this._maxDelayTime;
    }
  }, {
    key: "channelDidUpdate",
    value: function channelDidUpdate(numberOfChannels) {
      this.dspSetNumberOfChannels(numberOfChannels);
      this.getOutput(0).setNumberOfChannels(numberOfChannels);
    }
  }]);

  return DelayNode;
}(AudioNode);

module.exports = util.mixin(DelayNode, DelayNodeDSP);

},{"../util":86,"./AudioNode":44,"./dsp/DelayNode":74}],54:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("./AudioNode");

var DynamicsCompressorNode = function (_AudioNode) {
  _inherits(DynamicsCompressorNode, _AudioNode);

  function DynamicsCompressorNode(context) {
    _classCallCheck(this, DynamicsCompressorNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DynamicsCompressorNode).call(this, context, {
      inputs: [1],
      outputs: [2],
      channelCount: 2,
      channelCountMode: "explicit"
    }));

    _this._threshold = _this.addParam("control", -24);
    _this._knee = _this.addParam("control", 30);
    _this._ratio = _this.addParam("control", 12);
    _this._attack = _this.addParam("control", 0.003);
    _this._release = _this.addParam("control", 0.250);
    return _this;
  }

  _createClass(DynamicsCompressorNode, [{
    key: "getThreshold",
    value: function getThreshold() {
      return this._threshold;
    }
  }, {
    key: "getKnee",
    value: function getKnee() {
      return this._knee;
    }
  }, {
    key: "getRatio",
    value: function getRatio() {
      return this._ratio;
    }

    /* istanbul ignore next */

  }, {
    key: "getReduction",
    value: function getReduction() {
      throw new TypeError("NOT YET IMPLEMENTED");
    }
  }, {
    key: "getAttack",
    value: function getAttack() {
      return this._attack;
    }
  }, {
    key: "getRelease",
    value: function getRelease() {
      return this._release;
    }
  }, {
    key: "dspProcess",
    value: function dspProcess() {
      var inputBus = this.getInput(0).getAudioBus();
      var outputBus = this.getOutput(0).getAudioBus();

      outputBus.zeros();
      outputBus.sumFrom(inputBus);
    }
  }]);

  return DynamicsCompressorNode;
}(AudioNode);

module.exports = DynamicsCompressorNode;

},{"./AudioNode":44}],55:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var events = require("events");

var EventTarget = function () {
  function EventTarget() {
    _classCallCheck(this, EventTarget);

    this._emitter = new events.EventEmitter();
  }

  _createClass(EventTarget, [{
    key: "addEventListener",
    value: function addEventListener(type, listener) {
      /* istanbul ignore else */
      if (typeof listener === "function") {
        this._emitter.addListener(type, listener);
      }
    }
  }, {
    key: "removeEventListener",
    value: function removeEventListener(type, listener) {
      /* istanbul ignore else */
      if (typeof listener === "function") {
        this._emitter.removeListener(type, listener);
      }
    }
  }, {
    key: "replaceEventListener",
    value: function replaceEventListener(type, oldListener, newListener) {
      this.removeEventListener(type, oldListener);
      this.addEventListener(type, newListener);
    }
  }, {
    key: "dispatchEvent",
    value: function dispatchEvent(event) {
      this._emitter.emit(event.type, event);
    }
  }]);

  return EventTarget;
}();

module.exports = EventTarget;

},{"events":1}],56:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var util = require("../util");
var AudioNode = require("./AudioNode");
var GainNodeDSP = require("./dsp/GainNode");

var GainNode = function (_AudioNode) {
  _inherits(GainNode, _AudioNode);

  function GainNode(context) {
    _classCallCheck(this, GainNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(GainNode).call(this, context, {
      inputs: [1],
      outputs: [1],
      channelCount: 2,
      channelCountMode: "max"
    }));

    _this._gain = _this.addParam("audio", 1);
    return _this;
  }

  _createClass(GainNode, [{
    key: "getGain",
    value: function getGain() {
      return this._gain;
    }
  }, {
    key: "channelDidUpdate",
    value: function channelDidUpdate(numberOfChannels) {
      this.getOutput(0).setNumberOfChannels(numberOfChannels);
    }
  }]);

  return GainNode;
}(AudioNode);

module.exports = util.mixin(GainNode, GainNodeDSP);

},{"../util":86,"./AudioNode":44,"./dsp/GainNode":75}],57:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("./AudioNode");

var IIRFilterNode = function (_AudioNode) {
  _inherits(IIRFilterNode, _AudioNode);

  function IIRFilterNode(context, opts) {
    _classCallCheck(this, IIRFilterNode);

    opts = opts || /* istanbul ignore next */{};

    var feedforward = opts.feedforward;
    var feedback = opts.feedback;

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(IIRFilterNode).call(this, context, {
      inputs: [1],
      outputs: [1],
      channelCount: 2,
      channelCountMode: "max"
    }));

    _this._feedforward = feedforward;
    _this._feedback = feedback;
    return _this;
  }

  /* istanbul ignore next */


  _createClass(IIRFilterNode, [{
    key: "getFrequencyResponse",
    value: function getFrequencyResponse() {
      throw new TypeError("NOT YET IMPLEMENTED");
    }
  }, {
    key: "getFeedforward",
    value: function getFeedforward() {
      return this._feedforward;
    }
  }, {
    key: "getFeedback",
    value: function getFeedback() {
      return this._feedback;
    }
  }, {
    key: "channelDidUpdate",
    value: function channelDidUpdate(numberOfChannels) {
      this.getOutput(0).setNumberOfChannels(numberOfChannels);
    }
  }, {
    key: "dspProcess",
    value: function dspProcess() {
      var inputBus = this.getInput(0).getAudioBus();
      var outputBus = this.getOutput(0).getAudioBus();

      outputBus.copyFrom(inputBus);
    }
  }]);

  return IIRFilterNode;
}(AudioNode);

module.exports = IIRFilterNode;

},{"./AudioNode":44}],58:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var util = require("../util");
var AudioSourceNode = require("./AudioSourceNode");
var PeriodicWave = require("./PeriodicWave");
var OscillatorNodeDSP = require("./dsp/OscillatorNode");

var OscillatorTypes = PeriodicWave.BasicWaveForms;
var DefaultPeriodicWaves = {};

var OscillatorNode = function (_AudioSourceNode) {
  _inherits(OscillatorNode, _AudioSourceNode);

  function OscillatorNode(context) {
    _classCallCheck(this, OscillatorNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(OscillatorNode).call(this, context));

    _this._frequency = _this.addParam("audio", 440);
    _this._detune = _this.addParam("audio", 0);
    _this._type = "sine";
    _this._periodicWave = _this.buildPeriodicWave(_this._type);
    _this._waveTable = null;
    _this._startTime = Infinity;
    _this._stopTime = Infinity;

    _this.dspInit();
    return _this;
  }

  _createClass(OscillatorNode, [{
    key: "getType",
    value: function getType() {
      return this._type;
    }
  }, {
    key: "setType",
    value: function setType(value) {
      /* istanbul ignore else */
      if (OscillatorTypes.indexOf(value) !== -1) {
        this._type = value;
        this._periodicWave = this.buildPeriodicWave(value);
        this._waveTable = this._periodicWave.getWaveTable();
      }
    }
  }, {
    key: "getFrequency",
    value: function getFrequency() {
      return this._frequency;
    }
  }, {
    key: "getDetune",
    value: function getDetune() {
      return this._detune;
    }
  }, {
    key: "start",
    value: function start(when) {
      /* istanbul ignore else */
      if (this._startTime === Infinity) {
        when = Math.max(this.context.currentTime, util.toNumber(when));
        this._startTime = when;
        this.getOutput(0).enable();
      }
    }
  }, {
    key: "stop",
    value: function stop(when) {
      /* istanbul ignore else */
      if (this._startTime !== Infinity && this._stopTime === Infinity) {
        when = Math.max(this.context.currentTime, this._startTime, util.toNumber(when));
        this._stopTime = when;
      }
    }
  }, {
    key: "setPeriodicWave",
    value: function setPeriodicWave(periodicWave) {
      periodicWave = util.toImpl(periodicWave);

      /* istanbul ignore else */
      if (periodicWave instanceof PeriodicWave) {
        this._type = "custom";
        this._periodicWave = periodicWave;
        this._waveTable = this._periodicWave.getWaveTable();
      }
    }
  }, {
    key: "getPeriodicWave",
    value: function getPeriodicWave() {
      return this._periodicWave;
    }
  }, {
    key: "buildPeriodicWave",
    value: function buildPeriodicWave(type) {
      var sampleRate = this.context.sampleRate;
      var key = type + ":" + sampleRate;

      /* istanbul ignore else */
      if (!DefaultPeriodicWaves[key]) {
        var periodicWave = new PeriodicWave({ sampleRate: sampleRate }, { constraints: false });

        periodicWave.generateBasicWaveform(type);

        DefaultPeriodicWaves[key] = periodicWave;
      }

      return DefaultPeriodicWaves[key];
    }
  }]);

  return OscillatorNode;
}(AudioSourceNode);

module.exports = util.mixin(OscillatorNode, OscillatorNodeDSP);

},{"../util":86,"./AudioSourceNode":46,"./PeriodicWave":60,"./dsp/OscillatorNode":76}],59:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BasePannerNode = require("./BasePannerNode");

var PannerNode = function (_BasePannerNode) {
  _inherits(PannerNode, _BasePannerNode);

  function PannerNode(context) {
    _classCallCheck(this, PannerNode);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(PannerNode).call(this, context));
  }

  /* istanbul ignore next */


  _createClass(PannerNode, [{
    key: "setPosition",
    value: function setPosition() {
      throw new TypeError("NOT YET IMPLEMENTED");
    }

    /* istanbul ignore next */

  }, {
    key: "setOrientation",
    value: function setOrientation() {
      throw new TypeError("NOT YET IMPLEMENTED");
    }

    /* istanbul ignore next */

  }, {
    key: "setVelocity",
    value: function setVelocity() {
      throw new TypeError("NOT YET IMPLEMENTED");
    }
  }, {
    key: "dspProcess",
    value: function dspProcess() {
      var inputBus = this.getInput(0).getAudioBus();
      var outputBus = this.getOutput(0).getAudioBus();

      outputBus.zeros();
      outputBus.sumFrom(inputBus);
    }
  }]);

  return PannerNode;
}(BasePannerNode);

module.exports = PannerNode;

},{"./BasePannerNode":48}],60:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require("../util");
var PeriodicWaveDSP = require("./dsp/PeriodicWave");

var PeriodicWave = function () {
  function PeriodicWave(context, opts) {
    _classCallCheck(this, PeriodicWave);

    opts = opts || /* istanbul ignore next */{};

    var real = opts.real;
    var imag = opts.imag;
    var constraints = opts.constraints;

    this.context = context;
    this._real = real;
    this._imag = imag;
    this._constants = !!constraints;
    this._name = "custom";

    this.dspInit();
  }

  _createClass(PeriodicWave, [{
    key: "getReal",
    value: function getReal() {
      return this._real;
    }
  }, {
    key: "getImag",
    value: function getImag() {
      return this._imag;
    }
  }, {
    key: "getConstraints",
    value: function getConstraints() {
      return this._constants;
    }
  }, {
    key: "getName",
    value: function getName() {
      return this._name;
    }
  }, {
    key: "getWaveTable",
    value: function getWaveTable() {
      if (!this._waveTable) {
        this._waveTable = this.dspBuildWaveTable();
      }
      return this._waveTable;
    }
  }, {
    key: "generateBasicWaveform",
    value: function generateBasicWaveform(type) {
      var length = 512;

      switch (type) {
        case "sine":
          this._real = new Float32Array([0, 0]);
          this._imag = new Float32Array([0, 1]);
          this._name = "sine";
          break;
        case "sawtooth":
          this._real = new Float32Array(length);
          this._imag = new Float32Array(length).map(function (_, n) {
            return n === 0 ? 0 : Math.pow(-1, n + 1) * (2 / (n * Math.PI));
          });
          this._name = "sawtooth";
          this.dspBuildWaveTable();
          break;
        case "triangle":
          this._real = new Float32Array(length);
          this._imag = new Float32Array(length).map(function (_, n) {
            return n === 0 ? 0 : 8 * Math.sin(n * Math.PI / 2) / Math.pow(n * Math.PI, 2);
          });
          this._name = "triangle";
          this.dspBuildWaveTable();
          break;
        case "square":
          this._real = new Float32Array(length);
          this._imag = new Float32Array(length).map(function (_, n) {
            return n === 0 ? 0 : 2 / (n * Math.PI) * (1 - Math.pow(-1, n));
          });
          this._name = "square";
          this.dspBuildWaveTable();
          break;
        default:
          this._real = new Float32Array([0]);
          this._imag = new Float32Array([0]);
          this._name = "custom";
          this.dspBuildWaveTable();
          break;
      }
    }
  }]);

  return PeriodicWave;
}();

PeriodicWave.BasicWaveForms = ["sine", "sawtooth", "triangle", "square"];

module.exports = util.mixin(PeriodicWave, PeriodicWaveDSP);

},{"../util":86,"./dsp/PeriodicWave":77}],61:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var util = require("../util");
var AudioNode = require("./AudioNode");
var ScriptProcessorNodeDSP = require("./dsp/ScriptProcessorNode");

var ScriptProcessorNode = function (_AudioNode) {
  _inherits(ScriptProcessorNode, _AudioNode);

  function ScriptProcessorNode(context, opts) {
    _classCallCheck(this, ScriptProcessorNode);

    opts = opts || /* istanbul ignore next */{};

    var bufferSize = opts.bufferSize;
    var numberOfInputChannels = opts.numberOfInputChannels;
    var numberOfOutputChannels = opts.numberOfOutputChannels;

    bufferSize = Math.max(256, Math.min(bufferSize | 0, 16384));
    bufferSize = util.toPowerOfTwo(bufferSize, Math.ceil);
    numberOfInputChannels = util.toValidNumberOfChannels(numberOfInputChannels);
    numberOfOutputChannels = util.toValidNumberOfChannels(numberOfOutputChannels);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ScriptProcessorNode).call(this, context, {
      inputs: [numberOfInputChannels],
      outputs: [numberOfOutputChannels],
      channelCount: numberOfInputChannels,
      channelCountMode: "explicit"
    }));

    _this._bufferSize = bufferSize;
    _this.enableOutputsIfNecessary();
    _this.dspInit();
    return _this;
  }

  _createClass(ScriptProcessorNode, [{
    key: "getBufferSize",
    value: function getBufferSize() {
      return this._bufferSize;
    }
  }, {
    key: "setChannelCount",
    value: function setChannelCount() {
      // This node's channelCount cannot be changed.
    }
  }, {
    key: "setChannelCountMode",
    value: function setChannelCountMode() {
      // This node's channelCountMode cannot be changed.
    }
  }, {
    key: "setEventItem",
    value: function setEventItem(eventItem) {
      this.dspSetEventItem(eventItem);
    }
  }, {
    key: "disableOutputsIfNecessary",
    value: function disableOutputsIfNecessary() {
      // This node cannot disable.
    }
  }]);

  return ScriptProcessorNode;
}(AudioNode);

module.exports = util.mixin(ScriptProcessorNode, ScriptProcessorNodeDSP);

},{"../util":86,"./AudioNode":44,"./dsp/ScriptProcessorNode":78}],62:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BasePannerNode = require("./BasePannerNode");

var SpatialPannerNode = function (_BasePannerNode) {
  _inherits(SpatialPannerNode, _BasePannerNode);

  function SpatialPannerNode(context) {
    _classCallCheck(this, SpatialPannerNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SpatialPannerNode).call(this, context));

    _this._positionX = _this.addParam("audio", 0);
    _this._positionY = _this.addParam("audio", 0);
    _this._positionZ = _this.addParam("audio", 0);
    _this._orientationX = _this.addParam("audio", 0);
    _this._orientationY = _this.addParam("audio", 0);
    _this._orientationZ = _this.addParam("audio", 0);
    return _this;
  }

  _createClass(SpatialPannerNode, [{
    key: "getPositionX",
    value: function getPositionX() {
      return this._positionX;
    }
  }, {
    key: "getPositionY",
    value: function getPositionY() {
      return this._positionY;
    }
  }, {
    key: "getPositionZ",
    value: function getPositionZ() {
      return this._positionZ;
    }
  }, {
    key: "getOrientationX",
    value: function getOrientationX() {
      return this._positionX;
    }
  }, {
    key: "getOrientationY",
    value: function getOrientationY() {
      return this._positionY;
    }
  }, {
    key: "getOrientationZ",
    value: function getOrientationZ() {
      return this._positionZ;
    }
  }, {
    key: "dspProcess",
    value: function dspProcess() {
      var inputBus = this.getInput(0).getAudioBus();
      var outputBus = this.getOutput(0).getAudioBus();

      outputBus.zeros();
      outputBus.sumFrom(inputBus);
    }
  }]);

  return SpatialPannerNode;
}(BasePannerNode);

module.exports = SpatialPannerNode;

},{"./BasePannerNode":48}],63:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var util = require("../util");
var BasePannerNode = require("./BasePannerNode");
var StereoPannerNodeDSP = require("./dsp/StereoPannerNode");

var StereoPannerNode = function (_BasePannerNode) {
  _inherits(StereoPannerNode, _BasePannerNode);

  function StereoPannerNode(context) {
    _classCallCheck(this, StereoPannerNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(StereoPannerNode).call(this, context));

    _this._pan = _this.addParam("audio", 0);
    return _this;
  }

  _createClass(StereoPannerNode, [{
    key: "getPan",
    value: function getPan() {
      return this._pan;
    }
  }]);

  return StereoPannerNode;
}(BasePannerNode);

module.exports = util.mixin(StereoPannerNode, StereoPannerNodeDSP);

},{"../util":86,"./BasePannerNode":48,"./dsp/StereoPannerNode":79}],64:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var util = require("../util");
var AudioNode = require("./AudioNode");
var WaveShaperNodeDSP = require("./dsp/WaveShaperNode");

var OverSampleTypes = ["none", "2x", "4x"];

var WaveShaperNode = function (_AudioNode) {
  _inherits(WaveShaperNode, _AudioNode);

  function WaveShaperNode(context) {
    _classCallCheck(this, WaveShaperNode);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WaveShaperNode).call(this, context, {
      inputs: [1],
      outputs: [1],
      channelCount: 2,
      channelCountMode: "max"
    }));

    _this._curve = null;
    _this._overSample = "none";
    return _this;
  }

  _createClass(WaveShaperNode, [{
    key: "getCurve",
    value: function getCurve() {
      return this._curve;
    }
  }, {
    key: "setCurve",
    value: function setCurve(value) {
      /* istanbul ignore else */
      if (value === null || value instanceof Float32Array) {
        this._curve = value;
      }
    }
  }, {
    key: "getOversample",
    value: function getOversample() {
      return this._overSample;
    }
  }, {
    key: "setOversample",
    value: function setOversample(value) {
      /* istanbul ignore else */
      if (OverSampleTypes.indexOf(value) !== -1) {
        this._overSample = value;
      }
    }
  }, {
    key: "channelDidUpdate",
    value: function channelDidUpdate(numberOfChannels) {
      this.getOutput(0).setNumberOfChannels(numberOfChannels);
    }
  }]);

  return WaveShaperNode;
}(AudioNode);

module.exports = util.mixin(WaveShaperNode, WaveShaperNodeDSP);

},{"../util":86,"./AudioNode":44,"./dsp/WaveShaperNode":80}],65:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AudioData = require("./AudioData");
var DSPAlgorithm = {};

var AudioBus = function () {
  function AudioBus(numberOfChannels, length, sampleRate) {
    _classCallCheck(this, AudioBus);

    this._audioData = new AudioData(numberOfChannels, length, sampleRate);
    this._channelInterpretation = "discrete";
    this._isSilent = true;
  }

  _createClass(AudioBus, [{
    key: "getAudioData",
    value: function getAudioData() {
      return this._audioData;
    }
  }, {
    key: "getChannelInterpretation",
    value: function getChannelInterpretation() {
      return this._channelInterpretation;
    }
  }, {
    key: "setChannelInterpretation",
    value: function setChannelInterpretation(value) {
      if (value !== this._channelInterpretation && isValidChannelInterpretation(value)) {
        this._channelInterpretation = value;
      }
    }
  }, {
    key: "isSilent",
    value: function isSilent() {
      return this._isSilent;
    }
  }, {
    key: "getNumberOfChannels",
    value: function getNumberOfChannels() {
      return this._audioData.numberOfChannels;
    }
  }, {
    key: "setNumberOfChannels",
    value: function setNumberOfChannels(numberOfChannels) {
      var audioBus = new AudioBus(numberOfChannels, this.getLength(), this.getSampleRate());

      audioBus._channelInterpretation = this._channelInterpretation;
      audioBus.sumFrom(this);

      this._audioData = audioBus._audioData;
    }
  }, {
    key: "getLength",
    value: function getLength() {
      return this._audioData.length;
    }
  }, {
    key: "getSampleRate",
    value: function getSampleRate() {
      return this._audioData.sampleRate;
    }
  }, {
    key: "getChannelData",
    value: function getChannelData() {
      return this._audioData.channelData;
    }
  }, {
    key: "getMutableData",
    value: function getMutableData() {
      this._isSilent = false;
      return this._audioData.channelData;
    }
  }, {
    key: "zeros",
    value: function zeros() {
      /* istanbul ignore else */
      if (!this._isSilent) {
        var channelData = this._audioData.channelData;

        for (var i = 0, imax = channelData.length; i < imax; i++) {
          channelData[i].fill(0);
        }
      }
      this._isSilent = true;
    }
  }, {
    key: "copyFrom",
    value: function copyFrom(audioBus) {
      var source = audioBus._audioData.channelData;
      var destination = this._audioData.channelData;
      var numberOfChannels = destination.length;

      for (var ch = 0; ch < numberOfChannels; ch++) {
        destination[ch].set(source[ch]);
      }

      this._isSilent = audioBus._isSilent;
    }
  }, {
    key: "copyFromWithOffset",
    value: function copyFromWithOffset(audioBus, offset) {
      var source = audioBus._audioData.channelData;
      var destination = this._audioData.channelData;
      var numberOfChannels = destination.length;

      offset = offset | 0;

      for (var ch = 0; ch < numberOfChannels; ch++) {
        destination[ch].set(source[ch], offset);
      }

      this._isSilent = this._isSilent && audioBus._isSilent;
    }
  }, {
    key: "sumFrom",
    value: function sumFrom(audioBus) {

      /* istanbul ignore next */
      if (audioBus._isSilent) {
        return;
      }

      var source = audioBus._audioData.channelData;
      var destination = this._audioData.channelData;

      this._sumFrom(source, destination, audioBus.getLength());
    }
  }, {
    key: "sumFromWithOffset",
    value: function sumFromWithOffset(audioBus, offset) {

      /* istanbul ignore next */
      if (audioBus._isSilent) {
        return;
      }

      offset = offset | 0;

      var source = audioBus._audioData.channelData;
      var destination = this._audioData.channelData.map(function (data) {
        return data.subarray(offset);
      });

      this._sumFrom(source, destination, audioBus.getLength());
    }
  }, {
    key: "_sumFrom",
    value: function _sumFrom(source, destination, length) {
      var mixFunction = void 0;
      var algoIndex = source.length * 1000 + destination.length;

      if (this._channelInterpretation === "discrete") {
        algoIndex += 2000000;
      } else {
        algoIndex += 1000000;
      }

      mixFunction = DSPAlgorithm[algoIndex] || DSPAlgorithm[0];

      if (this._isSilent && mixFunction.set) {
        mixFunction = mixFunction.set;
      }

      mixFunction(source, destination, length);

      this._isSilent = false;
    }
  }]);

  return AudioBus;
}();

DSPAlgorithm[0] = function (source, destination, length) {
  var numberOfChannels = Math.min(source.length, destination.length);

  for (var ch = 0; ch < numberOfChannels; ch++) {
    for (var i = 0; i < length; i++) {
      destination[ch][i] += source[ch][i];
    }
  }
};
DSPAlgorithm[0].set = function (source, destination) {
  var numberOfChannels = Math.min(source.length, destination.length);

  for (var ch = 0; ch < numberOfChannels; ch++) {
    destination[ch].set(source[ch]);
  }
};

DSPAlgorithm[1001001] = function (source, destination, length) {
  var output = destination[0];
  var input = source[0];

  for (var i = 0; i < length; i++) {
    output[i] += input[i];
  }
};
DSPAlgorithm[1001001].set = function (source, destination) {
  destination[0].set(source[0]);
};
DSPAlgorithm[2001001] = DSPAlgorithm[1001001];
DSPAlgorithm[2001001].set = DSPAlgorithm[1001001].set;

DSPAlgorithm[1001002] = function (source, destination, length) {
  var outputL = destination[0];
  var outputR = destination[1];
  var input = source[0];

  for (var i = 0; i < length; i++) {
    outputL[i] += input[i];
    outputR[i] += input[i];
  }
};
DSPAlgorithm[1001002].set = function (source, destination) {
  destination[0].set(source[0]);
  destination[1].set(source[0]);
};

DSPAlgorithm[1001004] = DSPAlgorithm[1001002];
DSPAlgorithm[1001004].set = DSPAlgorithm[1001002].set;

DSPAlgorithm[1001006] = function (source, destination, length) {
  var outputC = destination[2];
  var input = source[0];

  for (var i = 0; i < length; i++) {
    outputC[i] += input[i];
  }
};
DSPAlgorithm[1001006].set = function (source, destination) {
  destination[2].set(source[0]);
};

DSPAlgorithm[1002002] = function (source, destination, length) {
  var outputL = destination[0];
  var outputR = destination[1];
  var inputL = source[0];
  var inputR = source[1];

  for (var i = 0; i < length; i++) {
    outputL[i] += inputL[i];
    outputR[i] += inputR[i];
  }
};
DSPAlgorithm[1002002].set = function (source, destination) {
  destination[0].set(source[0]);
  destination[1].set(source[1]);
};
DSPAlgorithm[2002002] = DSPAlgorithm[1002002];
DSPAlgorithm[2002002].set = DSPAlgorithm[1002002].set;

DSPAlgorithm[1002004] = DSPAlgorithm[1002002];
DSPAlgorithm[1002004].set = DSPAlgorithm[1002002].set;

DSPAlgorithm[1002006] = DSPAlgorithm[1002004];
DSPAlgorithm[1002006].set = DSPAlgorithm[1002004].set;

DSPAlgorithm[1004006] = function (source, destination, length) {
  var outputL = destination[0];
  var outputR = destination[1];
  var outputSL = destination[4];
  var outputSR = destination[5];
  var inputL = source[0];
  var inputR = source[1];
  var inputSL = source[2];
  var inputSR = source[3];

  for (var i = 0; i < length; i++) {
    outputL[i] += inputL[i];
    outputR[i] += inputR[i];
    outputSL[i] += inputSL[i];
    outputSR[i] += inputSR[i];
  }
};
DSPAlgorithm[1004006].set = function (source, destination) {
  destination[0].set(source[0]);
  destination[1].set(source[1]);
  destination[4].set(source[2]);
  destination[5].set(source[3]);
};

DSPAlgorithm[1002001] = function (source, destination, length) {
  var output = destination[0];
  var inputL = source[0];
  var inputR = source[1];

  for (var i = 0; i < length; i++) {
    output[i] += 0.5 * (inputL[i] + inputR[i]);
  }
};

DSPAlgorithm[1004001] = function (source, destination, length) {
  var output = destination[0];
  var inputL = source[0];
  var inputR = source[1];
  var inputSL = source[2];
  var inputSR = source[3];

  for (var i = 0; i < length; i++) {
    output[i] += 0.25 * (inputL[i] + inputR[i] + inputSL[i] + inputSR[i]);
  }
};

DSPAlgorithm[1006001] = function (source, destination, length) {
  var output = destination[0];
  var inputL = source[0];
  var inputR = source[1];
  var inputC = source[2];
  var inputSL = source[4];
  var inputSR = source[5];

  for (var i = 0; i < length; i++) {
    output[i] += 0.7071 * (inputL[i] + inputR[i]) + inputC[i] + 0.5 * (inputSL[i] + inputSR[i]);
  }
};

DSPAlgorithm[1004002] = function (source, destination, length) {
  var outputL = destination[0];
  var outputR = destination[1];
  var inputL = source[0];
  var inputR = source[1];
  var inputSL = source[2];
  var inputSR = source[3];

  for (var i = 0; i < length; i++) {
    outputL[i] += 0.5 * (inputL[i] + inputSL[i]);
    outputR[i] += 0.5 * (inputR[i] + inputSR[i]);
  }
};

DSPAlgorithm[1006002] = function (source, destination, length) {
  var outputL = destination[0];
  var outputR = destination[1];
  var inputL = source[0];
  var inputR = source[1];
  var inputC = source[2];
  var inputSL = source[4];
  var inputSR = source[5];

  for (var i = 0; i < length; i++) {
    outputL[i] += inputL[i] + 0.7071 * (inputC[i] + inputSL[i]);
    outputR[i] += inputR[i] + 0.7071 * (inputC[i] + inputSR[i]);
  }
};

DSPAlgorithm[1006004] = function (source, destination, length) {
  var outputL = destination[0];
  var outputR = destination[1];
  var outputSL = destination[2];
  var outputSR = destination[3];
  var inputL = source[0];
  var inputR = source[1];
  var inputC = source[2];
  var inputSL = source[4];
  var inputSR = source[5];

  for (var i = 0; i < length; i++) {
    outputL[i] += inputL[i] + 0.7071 * inputC[i];
    outputR[i] += inputR[i] + 0.7071 * inputC[i];
    outputSL[i] += inputSL[i];
    outputSR[i] += inputSR[i];
  }
};

function isValidChannelInterpretation(value) {
  return value === "speakers" || value === "discrete";
}

module.exports = AudioBus;

},{"./AudioData":66}],66:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AudioData = function AudioData(numberOfChannels, length, sampleRate) {
  var _this = this;

  _classCallCheck(this, AudioData);

  this.numberOfChannels = numberOfChannels | 0;
  this.length = length | 0;
  this.sampleRate = sampleRate | 0;
  this.channelData = new Array(this.numberOfChannels).fill().map(function () {
    return new Float32Array(_this.length).fill(0);
  });
};

module.exports = AudioData;

},{}],67:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var util = require("../../util");
var AudioBus = require("./AudioBus");

var AudioNodeInput = function () {
  function AudioNodeInput(opts) {
    _classCallCheck(this, AudioNodeInput);

    var node = opts.node;
    var index = opts.index;
    var numberOfChannels = opts.numberOfChannels;
    var channelCount = opts.channelCount;
    var channelCountMode = opts.channelCountMode;

    this.node = node;
    this.index = index | 0;
    this._audioBus = new AudioBus(numberOfChannels, node.blockSize, node.sampleRate);
    this._audioBus.setChannelInterpretation("speakers");
    this._channelCount = channelCount | 0;
    this._channelCountMode = channelCountMode;
    this._outputs = [];
    this._disabledOutputs = [];
  }

  _createClass(AudioNodeInput, [{
    key: "getAudioBus",
    value: function getAudioBus() {
      return this._audioBus;
    }
  }, {
    key: "getChannelCount",
    value: function getChannelCount() {
      return this._channelCount;
    }
  }, {
    key: "setChannelCount",
    value: function setChannelCount(value) {
      var channelCount = util.toValidNumberOfChannels(value);

      /* istanbul ignore else */
      if (channelCount !== this._channelCount) {
        this._channelCount = channelCount;
        this.updateNumberOfChannels();
      }
    }
  }, {
    key: "getChannelCountMode",
    value: function getChannelCountMode() {
      return this._channelCountMode;
    }
  }, {
    key: "setChannelCountMode",
    value: function setChannelCountMode(value) {
      /* istanbul ignore else */
      if (value !== this._channelCountMode && isValidChannelCountMode(value)) {
        this._channelCountMode = value;
        this.updateNumberOfChannels();
      }
    }
  }, {
    key: "getChannelInterpretation",
    value: function getChannelInterpretation() {
      return this._audioBus.getChannelInterpretation();
    }
  }, {
    key: "setChannelInterpretation",
    value: function setChannelInterpretation(value) {
      this._audioBus.setChannelInterpretation(value);
    }
  }, {
    key: "getNumberOfChannels",
    value: function getNumberOfChannels() {
      return this._audioBus.getNumberOfChannels();
    }
  }, {
    key: "computeNumberOfChannels",
    value: function computeNumberOfChannels() {
      if (this._channelCountMode === "explicit") {
        return this._channelCount;
      }

      var maxChannels = this._outputs.reduce(function (maxChannels, output) {
        return Math.max(maxChannels, output.getNumberOfChannels());
      }, 1);

      if (this._channelCountMode === "clamped-max") {
        return Math.min(this._channelCount, maxChannels);
      }

      return maxChannels;
    }
  }, {
    key: "updateNumberOfChannels",
    value: function updateNumberOfChannels() {
      var numberOfChannels = this.computeNumberOfChannels();

      /* istanbul ignore else */
      if (numberOfChannels !== this._audioBus.getNumberOfChannels()) {
        this._audioBus.setNumberOfChannels(numberOfChannels);
        this.node.channelDidUpdate(numberOfChannels);
      }
    }
  }, {
    key: "getNumberOfConnections",
    value: function getNumberOfConnections() {
      return this._outputs.length + this._disabledOutputs.length;
    }
  }, {
    key: "getNumberOfFanOuts",
    value: function getNumberOfFanOuts() {
      return this._outputs.length;
    }
  }, {
    key: "isEnabled",
    value: function isEnabled() {
      return this._outputs.length !== 0;
    }
  }, {
    key: "enableFrom",
    value: function enableFrom(output) {
      /* istanbul ignore else */
      if (moveItem(output, this._disabledOutputs, this._outputs)) {
        this.inputDidUpdate();
      }
    }
  }, {
    key: "disableFrom",
    value: function disableFrom(output) {
      /* istanbul ignore else */
      if (moveItem(output, this._outputs, this._disabledOutputs)) {
        this.inputDidUpdate();
      }
    }
  }, {
    key: "connectFrom",
    value: function connectFrom(output) {
      if (output.isEnabled()) {
        /* istanbul ignore else */
        if (addItem(output, this._outputs)) {
          this.inputDidUpdate();
        }
      } else {
        addItem(output, this._disabledOutputs);
      }
    }
  }, {
    key: "disconnectFrom",
    value: function disconnectFrom(output) {
      if (output.isEnabled()) {
        /* istanbul ignore else */
        if (removeItem(output, this._outputs)) {
          this.inputDidUpdate();
        }
      } else {
        removeItem(output, this._disabledOutputs);
      }
    }
  }, {
    key: "inputDidUpdate",
    value: function inputDidUpdate() {
      this.updateNumberOfChannels();
      if (this._outputs.length === 0) {
        this.node.disableOutputsIfNecessary();
      } else {
        this.node.enableOutputsIfNecessary();
      }
    }
  }, {
    key: "isConnectedFrom",
    value: function isConnectedFrom() {
      var args = Array.from(arguments);

      if (args.length === 1) {
        var hasTarget = function hasTarget(target) {
          return target.node === args[0];
        };

        return this._outputs.some(hasTarget) || this._disabledOutputs.some(hasTarget);
      }
      if (args.length === 2) {
        var _hasTarget = function _hasTarget(target) {
          return target.node === args[0] && target.index === args[1];
        };

        return this._outputs.some(_hasTarget) || this._disabledOutputs.some(_hasTarget);
      }

      return false;
    }
  }, {
    key: "sumAllConnections",
    value: function sumAllConnections(e) {
      var audioBus = this._audioBus;
      var outputs = this._outputs;

      audioBus.zeros();

      for (var i = 0, imax = outputs.length; i < imax; i++) {
        audioBus.sumFrom(outputs[i].pull(e));
      }

      return audioBus;
    }
  }, {
    key: "pull",
    value: function pull(e) {
      if (this._outputs.length === 1) {
        var output = this._outputs[0];

        /* istanbul ignore else */
        if (output.getNumberOfChannels() === this.getNumberOfChannels()) {
          return this._audioBus.copyFrom(output.pull(e));
        }
      }

      return this.sumAllConnections(e);
    }
  }]);

  return AudioNodeInput;
}();

function addItem(target, destination) {
  var index = destination.indexOf(target);

  /* istanbul ignore next */
  if (index !== -1) {
    return false;
  }

  destination.push(target);

  return true;
}

function removeItem(target, source) {
  var index = source.indexOf(target);

  /* istanbul ignore next */
  if (index === -1) {
    return false;
  }

  source.splice(index, 1);

  return true;
}

function moveItem(target, source, destination) {
  var index = source.indexOf(target);

  /* istanbul ignore next */
  if (index === -1) {
    return false;
  }

  source.splice(index, 1);
  destination.push(target);

  return true;
}

function isValidChannelCountMode(value) {
  return value === "max" || value === "clamped-max" || value === "explicit";
}

module.exports = AudioNodeInput;

},{"../../util":86,"./AudioBus":65}],68:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AudioBus = require("./AudioBus");

var AudioNodeOutput = function () {
  function AudioNodeOutput(opts) {
    _classCallCheck(this, AudioNodeOutput);

    var node = opts.node;
    var index = opts.index;
    var numberOfChannels = opts.numberOfChannels;
    var enabled = opts.enabled;

    this.node = node;
    this.index = index | 0;
    this._audioBus = new AudioBus(numberOfChannels, node.blockSize, node.sampleRate);
    this._inputs = [];
    this._enabled = !!enabled;
  }

  _createClass(AudioNodeOutput, [{
    key: "getAudioBus",
    value: function getAudioBus() {
      return this._audioBus;
    }
  }, {
    key: "getNumberOfChannels",
    value: function getNumberOfChannels() {
      return this._audioBus.getNumberOfChannels();
    }
  }, {
    key: "setNumberOfChannels",
    value: function setNumberOfChannels(numberOfChannels) {
      /* istanbul ignore else */
      if (numberOfChannels !== this.getNumberOfChannels()) {
        var channelInterpretation = this.node.getChannelInterpretation();

        this._audioBus.setNumberOfChannels(numberOfChannels, channelInterpretation);

        this._inputs.forEach(function (input) {
          input.updateNumberOfChannels();
        });
      }
    }
  }, {
    key: "getNumberOfConnections",
    value: function getNumberOfConnections() {
      return this._inputs.length;
    }
  }, {
    key: "isEnabled",
    value: function isEnabled() {
      return this._enabled;
    }
  }, {
    key: "enable",
    value: function enable() {
      var _this = this;

      /* istanbul ignore else */
      if (!this._enabled) {
        this._enabled = true;
        this._inputs.forEach(function (input) {
          input.enableFrom(_this);
        });
      }
    }
  }, {
    key: "disable",
    value: function disable() {
      var _this2 = this;

      /* istanbul ignore else */
      if (this._enabled) {
        this._enabled = false;
        this._inputs.forEach(function (input) {
          input.disableFrom(_this2);
        });
      }
    }
  }, {
    key: "zeros",
    value: function zeros() {
      this._audioBus.zeros();
    }
  }, {
    key: "connect",
    value: function connect(destination, input) {
      var target = destination.getInput(input);

      if (this._inputs.indexOf(target) === -1) {
        this._inputs.push(target);
        target.connectFrom(this);
      }
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      var args = Array.from(arguments);
      var isTargetToDisconnect = args.length === 1 ? function (target) {
        return target.node === args[0];
      } : args.length === 2 ? function (target) {
        return target.node === args[0] && target.index === args[1];
      } : function () {
        return true;
      };

      for (var i = this._inputs.length - 1; i >= 0; i--) {
        var target = this._inputs[i];

        if (isTargetToDisconnect(target)) {
          target.disconnectFrom(this);
          this._inputs.splice(i, 1);
        }
      }
    }
  }, {
    key: "isConnectedTo",
    value: function isConnectedTo() {
      var args = Array.from(arguments);

      if (args.length === 1) {
        return this._inputs.some(function (target) {
          return target.node === args[0];
        });
      }
      if (args.length === 2) {
        return this._inputs.some(function (target) {
          return target.node === args[0] && target.index === args[1];
        });
      }

      return false;
    }
  }, {
    key: "pull",
    value: function pull(e) {
      this.node.processIfNecessary(e);
      return this._audioBus;
    }
  }]);

  return AudioNodeOutput;
}();

module.exports = AudioNodeOutput;

},{"./AudioBus":65}],69:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioSourceNode = require("../AudioSourceNode");

var AudioBufferSourceNode = function (_AudioSourceNode) {
  _inherits(AudioBufferSourceNode, _AudioSourceNode);

  function AudioBufferSourceNode() {
    _classCallCheck(this, AudioBufferSourceNode);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(AudioBufferSourceNode).apply(this, arguments));
  }

  _createClass(AudioBufferSourceNode, [{
    key: "dspInit",
    value: function dspInit() {
      this._phase = 0;
    }
  }, {
    key: "dspStart",
    value: function dspStart() {
      var bufferSampleRate = this._audioData.sampleRate;
      var bufferDuration = this._audioData.length / bufferSampleRate;

      this._phase = Math.max(0, Math.min(this._offset, bufferDuration)) * bufferSampleRate;
    }
  }, {
    key: "dspProcess",
    value: function dspProcess(e) {
      var _this2 = this;

      var currentTime = e.currentTime;
      var nextCurrentTime = e.nextCurrentTime;

      if (nextCurrentTime < this._startTime) {
        return;
      }

      if (this._implicitStopTime <= currentTime) {
        return;
      }

      var sampleRate = e.sampleRate;
      var inNumSamples = e.inNumSamples;
      var frameOffset = Math.max(0, Math.round((this._startTime - currentTime) * sampleRate));
      var fillToTime = Math.min(nextCurrentTime, this._implicitStopTime);
      var fillToFrame = Math.round((fillToTime - currentTime) * sampleRate) | 0;
      var outputs = this.getOutput(0).getAudioBus().getMutableData();
      var numberOfChannels = outputs.length;

      var writeIndex = 0;

      writeIndex = this.dspBufferRendering(outputs, frameOffset, fillToFrame, sampleRate);

      if (writeIndex < inNumSamples) {
        while (writeIndex < inNumSamples) {
          for (var ch = 0; ch < numberOfChannels; ch++) {
            outputs[ch][writeIndex] = 0;
          }
          writeIndex += 1;
        }
        this.context.addPostProcess(function () {
          _this2.getOutput(0).getAudioBus().zeros();
          _this2.getOutput(0).disable();
          _this2.dispatchEvent({ type: "ended" });
        });
      }
    }
  }, {
    key: "dspBufferRendering",
    value: function dspBufferRendering(outputs, writeIndex, inNumSamples, sampleRate) {
      var playbackRateValues = this._playbackRate.getSampleAccurateValues();
      var detuneValues = this._detune.getSampleAccurateValues();
      var numberOfChannels = this._audioData.numberOfChannels;
      var bufferLength = this._audioData.length;
      var bufferSampleRate = this._audioData.sampleRate;
      var bufferChannelData = this._audioData.channelData;
      var playbackRateToPhaseIncr = bufferSampleRate / sampleRate;

      var phase = this._phase;

      while (writeIndex < inNumSamples) {
        var playbackRateValue = playbackRateValues[writeIndex];
        var detuneValue = detuneValues[writeIndex];
        var computedPlaybackRate = playbackRateValue * Math.pow(2, detuneValue / 1200);

        for (var ch = 0; ch < numberOfChannels; ch++) {
          var v0 = bufferChannelData[ch][phase | 0] || 0;
          var v1 = bufferChannelData[ch][(phase | 0) + 1] || 0;

          outputs[ch][writeIndex] = v0 + phase % 1 * (v1 - v0);
        }
        writeIndex += 1;

        phase += playbackRateToPhaseIncr * Math.max(0, computedPlaybackRate);

        var phaseTime = phase / bufferSampleRate;
        var bufferDuration = bufferLength / bufferSampleRate;

        if (this._loop) {
          if (bufferDuration <= phaseTime || 0 < this._loopEnd && this._loopEnd <= phaseTime) {
            phase = Math.max(0, Math.min(this._loopStart, bufferDuration)) * bufferSampleRate;
          }
        } else {
          if (bufferDuration <= phaseTime) {
            break;
          }
        }
      }

      this._phase = phase;

      return writeIndex;
    }
  }]);

  return AudioBufferSourceNode;
}(AudioSourceNode);

module.exports = AudioBufferSourceNode;

},{"../AudioSourceNode":46}],70:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SET_VALUE_AT_TIME = 1;
var LINEAR_RAMP_TO_VALUE_AT_TIME = 2;
var EXPONENTIAL_RAMP_TO_VALUE_AT_TIME = 3;
var SET_TARGET_AT_TIME = 4;
var SET_VALUE_CURVE_AT_TIME = 5;
var CONTROL = 1;
var AUDIO = 2;

var AudioParam = function () {
  function AudioParam() {
    _classCallCheck(this, AudioParam);
  }

  _createClass(AudioParam, [{
    key: "dspInit",
    value: function dspInit() {
      this._prevValue = NaN;
      this._hasSampleAccurateValues = false;
      this._currentEventIndex = -1;
      this._fillToFrame = 0;
      this._schedParams = {};
    }
  }, {
    key: "dspProcess",
    value: function dspProcess(e) {
      var input = this._inputs[0];
      var inputBus = input.getAudioBus();

      input.pull(e);

      var hasEvents = !!this._timeline.length;
      var hasInput = !inputBus.isSilent();
      var algorithm = hasEvents * 2 + hasInput;

      switch (algorithm) {
        case 0:
          // events: x / input: x
          return this.dspStaticValue(e);
        case 1:
          // events: x / input: o
          return this.dspInputAndOffset(e, inputBus);
        case 2:
          // events: o / input: x
          return this.dspEvents(e);
        case 3:
          // events: o / input: o
          return this.dspEventsAndInput(e, inputBus);
        default:
      }
    }
  }, {
    key: "dspStaticValue",
    value: function dspStaticValue() {
      var value = this._value;

      if (value !== this._prevValue) {
        if (value === 0) {
          this._outputBus.zeros();
        } else {
          this._outputBus.getMutableData()[0].fill(value);
        }
        this._prevValue = value;
      }

      this._hasSampleAccurateValues = false;
    }
  }, {
    key: "dspInputAndOffset",
    value: function dspInputAndOffset(e, inputBus) {
      var outputBus = this._outputBus;
      var output = outputBus.getMutableData()[0];
      var input = inputBus.getChannelData()[0];
      var inNumSamples = e.inNumSamples;
      var value = this._value;

      output.set(input);

      if (value !== 0) {
        for (var i = 0; i < inNumSamples; i++) {
          output[i] += value;
        }
      }

      this._prevValue = NaN;
      this._hasSampleAccurateValues = true;
    }
  }, {
    key: "dspEvents",
    value: function dspEvents(e) {
      var outputBus = this._outputBus;
      var output = outputBus.getMutableData()[0];

      this.dspValuesForTimeRange(e, output);

      this._prevValue = NaN;
      this._hasSampleAccurateValues = true;
    }
  }, {
    key: "dspEventsAndInput",
    value: function dspEventsAndInput(e, inputBus) {
      var outputBus = this._outputBus;
      var output = outputBus.getMutableData()[0];
      var input = inputBus.getChannelData()[0];
      var inNumSamples = e.inNumSamples;

      this.dspValuesForTimeRange(e, output);

      for (var i = 0; i < inNumSamples; i++) {
        output[i] += input[i];
      }

      this._prevValue = NaN;
      this._hasSampleAccurateValues = true;
    }
  }, {
    key: "dspValuesForTimeRange",
    value: function dspValuesForTimeRange(e, output) {
      var timeline = this._timeline;
      var currentTime = e.currentTime;
      var nextCurrentTime = e.nextCurrentTime;
      var inNumSamples = e.inNumSamples;
      var sampleRate = e.sampleRate;

      var value = this._value;
      var writeIndex = 0;

      if (this._currentEventIndex === -1) {
        var firstEventTime = timeline[0].time;

        if (nextCurrentTime <= firstEventTime) {
          for (var i = 0; i < inNumSamples; i++) {
            output[i] = value;
          }
          this._hasSampleAccurateValues = false;
          return;
        }

        var fillToTime = Math.min(firstEventTime, nextCurrentTime);
        var _fillToFrame = Math.round((fillToTime - currentTime) * sampleRate);

        while (writeIndex < _fillToFrame) {
          output[writeIndex++] = value;
        }
      }

      this._hasSampleAccurateValues = true;

      var fillToFrame = this._fillToFrame;
      var schedParams = this._schedParams;

      if (fillToFrame === Infinity && this._currentEventIndex + 1 !== timeline.length) {
        var nextEvent = timeline[this._currentEventIndex + 1];

        if (nextEvent.type === LINEAR_RAMP_TO_VALUE_AT_TIME || nextEvent.type === EXPONENTIAL_RAMP_TO_VALUE_AT_TIME) {
          fillToFrame = 0;
          this._currentEventIndex -= 1;
        } else {
          fillToFrame = Math.round((nextEvent.time - currentTime) * sampleRate);
        }
      }

      while (writeIndex < inNumSamples) {
        while (fillToFrame === 0) {
          this._currentEventIndex += 1;

          var currentEvent = timeline[this._currentEventIndex];
          var currentEventType = currentEvent.type;
          var _nextEvent = timeline[this._currentEventIndex + 1] || null;
          var nextEventType = _nextEvent && _nextEvent.type;
          var time1 = currentEvent.time;
          var time2 = _nextEvent ? _nextEvent.time : Infinity;

          var numSampleFrames = (time2 - time1) * sampleRate;

          if (time2 <= currentTime) {
            continue;
          }

          if (nextEventType === LINEAR_RAMP_TO_VALUE_AT_TIME) {
            var value1 = Math.fround(currentEvent.args[0]);
            var value2 = Math.fround(_nextEvent.args[0]);
            var grow = (value2 - value1) / numSampleFrames;

            if (time1 < currentTime) {
              var a = (currentTime - time1) / (time2 - time1);

              value = value1 + a * (value2 - value1);
              numSampleFrames -= (currentTime - time1) * sampleRate;
            } else {
              value = value1;
            }

            /* istanbul ignore else */
            if (grow) {
              schedParams = { type: LINEAR_RAMP_TO_VALUE_AT_TIME, grow: grow };
            } else {
              schedParams = { type: SET_VALUE_AT_TIME };
            }
          } else if (nextEventType === EXPONENTIAL_RAMP_TO_VALUE_AT_TIME) {
            var _value = Math.fround(currentEvent.args[0]);
            var _value2 = Math.fround(_nextEvent.args[0]);
            var _grow = Math.pow(_value2 / _value, 1 / numSampleFrames);

            if (time1 < currentTime) {
              var _a = (currentTime - time1) / (time2 - time1);

              value = _value * Math.pow(_value2 / _value, _a);
              numSampleFrames -= (currentTime - time1) * sampleRate;
            } else {
              value = _value;
            }

            /* istanbul ignore else */
            if (_grow) {
              schedParams = { type: EXPONENTIAL_RAMP_TO_VALUE_AT_TIME, grow: _grow };
            } else {
              schedParams = { type: SET_VALUE_AT_TIME };
            }
          } else if (currentEventType === SET_TARGET_AT_TIME) {
            var target = Math.fround(currentEvent.args[0]);
            var timeConstant = currentEvent.args[2];
            var discreteTimeConstant = 1 - Math.exp(-1 / (sampleRate * timeConstant));

            // if (time1 < currentTime) {
            //   value = target + (value - target) * Math.exp((time1 - currentTime) / timeConstant);
            //   numSampleFrames -= (currentTime - time1) * sampleRate;
            // }

            /* istanbul ignore else */
            if (discreteTimeConstant !== 1) {
              schedParams = { type: SET_TARGET_AT_TIME, target: target, discreteTimeConstant: discreteTimeConstant };
            } else {
              value = target;
              schedParams = { type: SET_VALUE_AT_TIME };
            }
          } else if (currentEventType === SET_VALUE_CURVE_AT_TIME) {
            var curve = currentEvent.args[0];
            var duration = currentEvent.args[2];
            var durationFrames = Math.fround(duration * sampleRate);

            var frameIndex = 0;

            if (time1 < currentTime) {
              var passToFrame = (currentTime - time1) * sampleRate;

              frameIndex = Math.round(passToFrame);
              numSampleFrames -= passToFrame;
            }

            /* istanbul ignore else */
            if (curve.length) {
              schedParams = { type: SET_VALUE_CURVE_AT_TIME, curve: curve, frameIndex: frameIndex, durationFrames: durationFrames };
            } else {
              schedParams = { type: SET_VALUE_AT_TIME };
            }
          } else {
            if (time1 <= currentTime) {
              var _passToFrame = (currentTime - time1) * sampleRate;

              numSampleFrames -= _passToFrame;
            }
            value = Math.fround(currentEvent.args[0]);
            schedParams = { type: SET_VALUE_AT_TIME };
          }

          fillToFrame = Math.max(0, Math.round(numSampleFrames));
        }

        while (writeIndex < inNumSamples && fillToFrame !== 0) {
          switch (schedParams.type) {
            case SET_VALUE_AT_TIME:
              output[writeIndex++] = value;
              break;
            case LINEAR_RAMP_TO_VALUE_AT_TIME:
              output[writeIndex++] = value;
              value += schedParams.grow;
              break;
            case EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
              output[writeIndex++] = value;
              value *= schedParams.grow;
              break;
            case SET_TARGET_AT_TIME:
              output[writeIndex++] = value;
              value += (schedParams.target - value) * schedParams.discreteTimeConstant;
              if (output[writeIndex - 1] === schedParams.target) {
                schedParams.type = SET_VALUE_AT_TIME;
                value = schedParams.target;
              }
              break;
            case SET_VALUE_CURVE_AT_TIME:
              {
                var _curve = schedParams.curve;
                var x = schedParams.frameIndex++ / schedParams.durationFrames;
                var ix = x * (_curve.length - 1);
                var i0 = ix | 0;
                var i1 = i0 + 1;

                if (_curve.length <= i1) {
                  value = _curve[_curve.length - 1];
                  schedParams.type = SET_VALUE_AT_TIME;
                } else {
                  value = _curve[i0] + ix % 1 * (_curve[i1] - _curve[i0]);
                }

                output[writeIndex++] = value;
              }
              break;
          }
          fillToFrame -= 1;
        }
      }

      this._value = value;
      this._fillToFrame = fillToFrame;
      this._schedParams = schedParams;
    }
  }]);

  return AudioParam;
}();

AudioParam.SET_VALUE_AT_TIME = SET_VALUE_AT_TIME;
AudioParam.LINEAR_RAMP_TO_VALUE_AT_TIME = LINEAR_RAMP_TO_VALUE_AT_TIME;
AudioParam.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME = EXPONENTIAL_RAMP_TO_VALUE_AT_TIME;
AudioParam.SET_TARGET_AT_TIME = SET_TARGET_AT_TIME;
AudioParam.SET_VALUE_CURVE_AT_TIME = SET_VALUE_CURVE_AT_TIME;
AudioParam.CONTROL = CONTROL;
AudioParam.AUDIO = AUDIO;

module.exports = AudioParam;

},{}],71:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("../AudioNode");

var LOWPASS = 0;
var HIGHPASS = 1;
var BANDPASS = 2;
var LOWSHELF = 3;
var HIGHSHELF = 4;
var PEAKING = 5;
var NOTCH = 6;
var ALLPASS = 7;

var FilterTypes = [LOWPASS, HIGHPASS, BANDPASS, LOWSHELF, HIGHSHELF, PEAKING, NOTCH, ALLPASS];
var computeCoefficients = {};

var BiquadFilterNode = function (_AudioNode) {
  _inherits(BiquadFilterNode, _AudioNode);

  function BiquadFilterNode() {
    _classCallCheck(this, BiquadFilterNode);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(BiquadFilterNode).apply(this, arguments));
  }

  _createClass(BiquadFilterNode, [{
    key: "dspInit",
    value: function dspInit() {
      this._kernels = [];
      this._initCoefficients = false;
      this._coefficients = [0, 0, 0, 0, 0];
      this._prevFrequency = 0;
      this._prevDetune = 0;
      this._prevQ = 0;
      this._prevGain = 0;
      this._disabledTime = Infinity;
    }
  }, {
    key: "enableOutputsIfNecessary",
    value: function enableOutputsIfNecessary() {
      this._disabledTime = Infinity;
      _get(Object.getPrototypeOf(BiquadFilterNode.prototype), "enableOutputsIfNecessary", this).call(this);
    }
  }, {
    key: "disableOutputsIfNecessary",
    value: function disableOutputsIfNecessary() {
      this._disabledTime = this.context.currentTime + 0.2;
    }
  }, {
    key: "dspSetNumberOfChannels",
    value: function dspSetNumberOfChannels(numberOfChannels) {
      if (numberOfChannels < this._kernels.length) {
        this._kernels.splice(numberOfChannels);
      } else if (this._kernels.length < numberOfChannels) {
        while (numberOfChannels !== this._kernels.length) {
          this._kernels.push(new BiquadFilterKernel(this, this._kernels.length));
        }
      }
    }
  }, {
    key: "dspProcess",
    value: function dspProcess(e) {
      var _this2 = this;

      if (this._disabledTime <= e.currentTime) {
        this.getOutput(0).zeros();
        this.context.addPostProcess(function () {
          _get(Object.getPrototypeOf(BiquadFilterNode.prototype), "disableOutputsIfNecessary", _this2).call(_this2);
        });
        return;
      }

      var inputs = this.getInput(0).getAudioBus().getChannelData();
      var outputs = this.getOutput(0).getAudioBus().getMutableData();
      var isCoefficientsUpdated = this.dspUpdateCoefficients();
      var kernels = this._kernels;
      var inNumSamples = e.inNumSamples;

      if (!this._initCoefficients) {
        for (var i = 0, imax = kernels.length; i < imax; i++) {
          kernels[i].processWithInitCoefficients(this._coefficients, inputs[i], outputs[i], inNumSamples);
        }
        this._initCoefficients = true;
      } else if (isCoefficientsUpdated) {
        for (var _i = 0, _imax = kernels.length; _i < _imax; _i++) {
          kernels[_i].processWithCoefficients(this._coefficients, inputs[_i], outputs[_i], inNumSamples);
        }
      } else {
        for (var _i2 = 0, _imax2 = kernels.length; _i2 < _imax2; _i2++) {
          kernels[_i2].process(inputs[_i2], outputs[_i2], inNumSamples);
        }
      }
    }
  }, {
    key: "dspUpdateCoefficients",
    value: function dspUpdateCoefficients() {
      var frequency = this._frequency.getValue();
      var detune = this._detune.getValue();
      var Q = this._Q.getValue();
      var gain = this._gain.getValue();

      if (frequency === this._prevFrequency && detune === this._prevDetune && Q === this._prevQ && gain === this._prevGain) {
        return false;
      }

      var nyquist = this.sampleRate * 0.5;
      var normalizedFrequency = frequency / nyquist * Math.pow(2, detune / 1200);

      this._coefficients = computeCoefficients[this._type](normalizedFrequency, Q, gain);
      this._prevFrequency = frequency;
      this._prevDetune = detune;
      this._prevQ = Q;
      this._prevGain = gain;

      return true;
    }
  }]);

  return BiquadFilterNode;
}(AudioNode);

var BiquadFilterKernel = function () {
  function BiquadFilterKernel() {
    _classCallCheck(this, BiquadFilterKernel);

    this._coefficients = [0, 0, 0, 0, 0];
    this._x1 = 0;
    this._x2 = 0;
    this._y1 = 0;
    this._y2 = 0;
  }

  _createClass(BiquadFilterKernel, [{
    key: "processWithInitCoefficients",
    value: function processWithInitCoefficients(coefficients, input, output, inNumSamples) {
      this._coefficients = coefficients;
      this.process(input, output, inNumSamples);
    }
  }, {
    key: "process",
    value: function process(input, output, inNumSamples) {
      var b0 = this._coefficients[0];
      var b1 = this._coefficients[1];
      var b2 = this._coefficients[2];
      var a1 = this._coefficients[3];
      var a2 = this._coefficients[4];

      var x0 = void 0;
      var x1 = this._x1;
      var x2 = this._x2;
      var y0 = void 0;
      var y1 = this._y1;
      var y2 = this._y2;

      for (var i = 0; i < inNumSamples; i++) {
        x0 = input[i];
        y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;

        x2 = x1;
        x1 = x0;
        y2 = y1;
        y1 = y0;

        output[i] = y0;
      }

      this._x1 = flushDenormalFloatToZero(x1);
      this._x2 = flushDenormalFloatToZero(x2);
      this._y1 = flushDenormalFloatToZero(y1);
      this._y2 = flushDenormalFloatToZero(y2);
    }
  }, {
    key: "processWithCoefficients",
    value: function processWithCoefficients(coefficients, input, output, inNumSamples) {
      var b0 = this._coefficients[0];
      var b1 = this._coefficients[1];
      var b2 = this._coefficients[2];
      var a1 = this._coefficients[3];
      var a2 = this._coefficients[4];
      var x0 = void 0;
      var x1 = this._x1;
      var x2 = this._x2;
      var y0 = void 0;
      var y1 = this._y1;
      var y2 = this._y2;

      var step = 1 / inNumSamples;
      var b0Incr = (coefficients[0] - b0) * step;
      var b1Incr = (coefficients[1] - b1) * step;
      var b2Incr = (coefficients[2] - b2) * step;
      var a1Incr = (coefficients[3] - a1) * step;
      var a2Incr = (coefficients[4] - a2) * step;

      for (var i = 0; i < inNumSamples; i++) {
        x0 = input[i];
        y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;

        x2 = x1;
        x1 = x0;
        y2 = y1;
        y1 = y0;

        b0 += b0Incr;
        b1 += b1Incr;
        b2 += b2Incr;
        a1 += a1Incr;
        a2 += a2Incr;

        output[i] = y0;
      }

      this._x1 = flushDenormalFloatToZero(x1);
      this._x2 = flushDenormalFloatToZero(x2);
      this._y1 = flushDenormalFloatToZero(y1);
      this._y2 = flushDenormalFloatToZero(y2);
      this._coefficients = coefficients;
    }
  }]);

  return BiquadFilterKernel;
}();

computeCoefficients[LOWPASS] = function (cutoff, resonance) {
  cutoff = Math.max(0.0, Math.min(cutoff, 1.0));

  if (cutoff === 1) {
    return [1, 0, 0, 0, 0];
  }

  if (0 < cutoff) {
    resonance = Math.max(0.0, resonance);

    var g = Math.pow(10.0, 0.05 * resonance);
    var d = Math.sqrt((4 - Math.sqrt(16 - 16 / (g * g))) / 2);
    var theta = Math.PI * cutoff;
    var sn = 0.5 * d * Math.sin(theta);
    var beta = 0.5 * (1 - sn) / (1 + sn);
    var gamma = (0.5 + beta) * Math.cos(theta);
    var alpha = 0.25 * (0.5 + beta - gamma);

    var b0 = 2 * alpha;
    var b1 = 2 * 2 * alpha;
    var b2 = 2 * alpha;
    var a1 = 2 * -gamma;
    var a2 = 2 * beta;

    return [b0, b1, b2, a1, a2];
  }

  return [0, 0, 0, 0, 0];
};

computeCoefficients[HIGHPASS] = function (cutoff, resonance) {
  cutoff = Math.max(0.0, Math.min(cutoff, 1.0));

  if (cutoff == 1) {
    return [0, 0, 0, 0, 0];
  }

  if (0 < cutoff) {
    resonance = Math.max(0.0, resonance);

    var g = Math.pow(10.0, 0.05 * resonance);
    var d = Math.sqrt((4 - Math.sqrt(16 - 16 / (g * g))) / 2);
    var theta = Math.PI * cutoff;
    var sn = 0.5 * d * Math.sin(theta);
    var beta = 0.5 * (1 - sn) / (1 + sn);
    var gamma = (0.5 + beta) * Math.cos(theta);
    var alpha = 0.25 * (0.5 + beta + gamma);

    var b0 = 2 * alpha;
    var b1 = 2 * -2 * alpha;
    var b2 = 2 * alpha;
    var a1 = 2 * -gamma;
    var a2 = 2 * beta;

    return [b0, b1, b2, a1, a2];
  }

  return [1, 0, 0, 0, 0];
};

computeCoefficients[BANDPASS] = function (frequency, Q) {
  frequency = Math.max(0.0, frequency);
  Q = Math.max(0.0, Q);

  if (0 < frequency && frequency < 1) {
    var w0 = Math.PI * frequency;

    if (0 < Q) {
      var alpha = Math.sin(w0) / (2 * Q);
      var k = Math.cos(w0);

      var b0 = alpha;
      var b1 = 0;
      var b2 = -alpha;
      var a0 = 1 + alpha;
      var a1 = -2 * k;
      var a2 = 1 - alpha;

      return [b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0];
    }

    return [1, 0, 0, 0, 0];
  }

  return [0, 0, 0, 0, 0];
};

computeCoefficients[LOWSHELF] = function (frequency, _, dbGain) {
  frequency = Math.max(0.0, Math.min(frequency, 1.0));

  var A = Math.pow(10.0, dbGain / 40);

  if (frequency == 1) {
    return [A * A, 0, 0, 0, 0];
  }

  if (0 < frequency) {
    var w0 = Math.PI * frequency;
    var S = 1;
    var alpha = 0.5 * Math.sin(w0) * Math.sqrt((A + 1 / A) * (1 / S - 1) + 2);
    var k = Math.cos(w0);
    var k2 = 2 * Math.sqrt(A) * alpha;
    var aPlusOne = A + 1;
    var aMinusOne = A - 1;

    var b0 = A * (aPlusOne - aMinusOne * k + k2);
    var b1 = 2 * A * (aMinusOne - aPlusOne * k);
    var b2 = A * (aPlusOne - aMinusOne * k - k2);
    var a0 = aPlusOne + aMinusOne * k + k2;
    var a1 = -2 * (aMinusOne + aPlusOne * k);
    var a2 = aPlusOne + aMinusOne * k - k2;

    return [b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0];
  }

  return [1, 0, 0, 0, 0];
};

computeCoefficients[HIGHSHELF] = function (frequency, _, dbGain) {
  frequency = Math.max(0.0, Math.min(frequency, 1.0));

  var A = Math.pow(10.0, dbGain / 40);

  if (frequency == 1) {
    return [1, 0, 0, 0, 0];
  }

  if (0 < frequency) {
    var w0 = Math.PI * frequency;
    var S = 1;
    var alpha = 0.5 * Math.sin(w0) * Math.sqrt((A + 1 / A) * (1 / S - 1) + 2);
    var k = Math.cos(w0);
    var k2 = 2 * Math.sqrt(A) * alpha;
    var aPlusOne = A + 1;
    var aMinusOne = A - 1;

    var b0 = A * (aPlusOne + aMinusOne * k + k2);
    var b1 = -2 * A * (aMinusOne + aPlusOne * k);
    var b2 = A * (aPlusOne + aMinusOne * k - k2);
    var a0 = aPlusOne - aMinusOne * k + k2;
    var a1 = 2 * (aMinusOne - aPlusOne * k);
    var a2 = aPlusOne - aMinusOne * k - k2;

    return [b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0];
  }

  return [A * A, 0, 0, 0, 0];
};

computeCoefficients[PEAKING] = function (frequency, Q, dbGain) {
  frequency = Math.max(0.0, Math.min(frequency, 1.0));
  Q = Math.max(0.0, Q);

  var A = Math.pow(10.0, dbGain / 40);

  if (0 < frequency && frequency < 1) {
    if (0 < Q) {
      var w0 = Math.PI * frequency;
      var alpha = Math.sin(w0) / (2 * Q);
      var k = Math.cos(w0);

      var b0 = 1 + alpha * A;
      var b1 = -2 * k;
      var b2 = 1 - alpha * A;
      var a0 = 1 + alpha / A;
      var a1 = -2 * k;
      var a2 = 1 - alpha / A;

      return [b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0];
    }

    return [A * A, 0, 0, 0, 0];
  }

  return [1, 0, 0, 0, 0];
};

computeCoefficients[NOTCH] = function (frequency, Q) {
  frequency = Math.max(0.0, Math.min(frequency, 1.0));
  Q = Math.max(0.0, Q);

  if (0 < frequency && frequency < 1) {
    if (0 < Q) {
      var w0 = Math.PI * frequency;
      var alpha = Math.sin(w0) / (2 * Q);
      var k = Math.cos(w0);

      var b0 = 1;
      var b1 = -2 * k;
      var b2 = 1;
      var a0 = 1 + alpha;
      var a1 = -2 * k;
      var a2 = 1 - alpha;

      return [b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0];
    }

    return [0, 0, 0, 0, 0];
  }

  return [1, 0, 0, 0, 0];
};

computeCoefficients[ALLPASS] = function (frequency, Q) {
  frequency = Math.max(0.0, Math.min(frequency, 1.0));
  Q = Math.max(0.0, Q);

  if (0 < frequency && frequency < 1) {
    if (0 < Q) {
      var w0 = Math.PI * frequency;
      var alpha = Math.sin(w0) / (2 * Q);
      var k = Math.cos(w0);

      var b0 = 1 - alpha;
      var b1 = -2 * k;
      var b2 = 1 + alpha;
      var a0 = 1 + alpha;
      var a1 = -2 * k;
      var a2 = 1 - alpha;

      return [b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0];
    }

    return [-1, 0, 0, 0, 0];
  }

  return [1, 0, 0, 0, 0];
};

function flushDenormalFloatToZero(f) {
  return Math.abs(f) < 1.175494e-38 ? 0.0 : f;
}

BiquadFilterNode.FilterTypes = FilterTypes;
BiquadFilterNode.LOWPASS = LOWPASS;
BiquadFilterNode.HIGHPASS = HIGHPASS;
BiquadFilterNode.BANDPASS = BANDPASS;
BiquadFilterNode.LOWSHELF = LOWSHELF;
BiquadFilterNode.HIGHSHELF = HIGHSHELF;
BiquadFilterNode.PEAKING = PEAKING;
BiquadFilterNode.NOTCH = NOTCH;
BiquadFilterNode.ALLPASS = ALLPASS;

module.exports = BiquadFilterNode;

},{"../AudioNode":44}],72:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("../AudioNode");

var ChannelMergerNode = function (_AudioNode) {
  _inherits(ChannelMergerNode, _AudioNode);

  function ChannelMergerNode() {
    _classCallCheck(this, ChannelMergerNode);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ChannelMergerNode).apply(this, arguments));
  }

  _createClass(ChannelMergerNode, [{
    key: "dspProcess",
    value: function dspProcess() {
      var outputBus = this.getOutput(0).getAudioBus();
      var inputBuses = this._inputs.map(function (input) {
        return input.getAudioBus();
      });
      var allSilent = inputBuses.every(function (inputBus) {
        return inputBus.isSilent();
      });

      outputBus.zeros();

      if (!allSilent) {
        var outputChannelData = outputBus.getMutableData();

        for (var i = 0, imax = inputBuses.length; i < imax; i++) {
          outputChannelData[i].set(inputBuses[i].getChannelData()[0]);
        }
      }
    }
  }]);

  return ChannelMergerNode;
}(AudioNode);

module.exports = ChannelMergerNode;

},{"../AudioNode":44}],73:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("../AudioNode");

var ChannelSplitterNode = function (_AudioNode) {
  _inherits(ChannelSplitterNode, _AudioNode);

  function ChannelSplitterNode() {
    _classCallCheck(this, ChannelSplitterNode);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ChannelSplitterNode).apply(this, arguments));
  }

  _createClass(ChannelSplitterNode, [{
    key: "dspProcess",
    value: function dspProcess() {
      var inputBus = this.getInput(0).getAudioBus();
      var outputs = this._outputs;

      if (inputBus.isSilent()) {
        for (var i = 0, imax = outputs.length; i < imax; i++) {
          outputs[i].getAudioBus().zeros();
        }
      } else {
        var inputChannelData = inputBus.getChannelData();

        for (var _i = 0, _imax = outputs.length; _i < _imax; _i++) {
          var outputBus = outputs[_i].getAudioBus();

          if (inputChannelData[_i]) {
            outputBus.getMutableData()[0].set(inputChannelData[_i]);
          } else {
            outputBus.zeros();
          }
        }
      }
    }
  }]);

  return ChannelSplitterNode;
}(AudioNode);

module.exports = ChannelSplitterNode;

},{"../AudioNode":44}],74:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("../AudioNode");
var AudioBus = require("../core/AudioBus");

var DelayNode = function (_AudioNode) {
  _inherits(DelayNode, _AudioNode);

  function DelayNode() {
    _classCallCheck(this, DelayNode);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(DelayNode).apply(this, arguments));
  }

  _createClass(DelayNode, [{
    key: "dspInit",
    value: function dspInit(maxDelayTime) {
      var frameToDelay = computeFrameToDelay(maxDelayTime, this.sampleRate, this.blockSize);

      this._delayBus = new AudioBus(1, frameToDelay, this.sampleRate);
      this._delayBusLength = frameToDelay;
      this._delayIndex = 0;
      this._delayIndexes = new Float32Array(this.blockSize);
    }
  }, {
    key: "enableOutputsIfNecessary",
    value: function enableOutputsIfNecessary() {
      this._disabledTime = Infinity;
      _get(Object.getPrototypeOf(DelayNode.prototype), "enableOutputsIfNecessary", this).call(this);
    }
  }, {
    key: "disableOutputsIfNecessary",
    value: function disableOutputsIfNecessary() {
      this._disabledTime = this.context.currentTime + this._maxDelayTime;
    }
  }, {
    key: "dspSetNumberOfChannels",
    value: function dspSetNumberOfChannels(numberOfChannels) {
      this._delayBus.setNumberOfChannels(numberOfChannels);
    }
  }, {
    key: "dspProcess",
    value: function dspProcess(e) {
      var _this2 = this;

      if (this._disabledTime <= e.currentTime) {
        this.getOutput(0).zeros();
        this.context.addPostProcess(function () {
          _get(Object.getPrototypeOf(DelayNode.prototype), "disableOutputsIfNecessary", _this2).call(_this2);
        });
        return;
      }

      var delayBus = this._delayBus;
      var inputBus = this.getInput(0).getAudioBus();

      delayBus.copyFromWithOffset(inputBus, this._delayIndex);

      var delayTimeValues = this._delayTime.getSampleAccurateValues();

      this.dspUpdateDelayIndexes(delayTimeValues);

      var buffers = delayBus.getChannelData();
      var outputs = this.getOutput(0).getAudioBus().getMutableData();
      var numberOfChannels = outputs.length;
      var inNumSamples = e.inNumSamples;
      var delayIndexes = this._delayIndexes;

      for (var ch = 0; ch < numberOfChannels; ch++) {
        this.dspKernelProcess(buffers[ch], outputs[ch], delayIndexes, inNumSamples);
      }

      this._delayIndex += this.blockSize;

      if (this._delayIndex === this._delayBusLength) {
        this._delayIndex = 0;
      }
    }
  }, {
    key: "dspUpdateDelayIndexes",
    value: function dspUpdateDelayIndexes(delayTimeValues) {
      var baseIndex = this._delayIndex;
      var sampleRate = this.sampleRate;
      var delayIndexes = this._delayIndexes;

      for (var i = 0, imax = delayTimeValues.length; i < imax; i++) {
        delayIndexes[i] = baseIndex + i - delayTimeValues[i] * sampleRate;
      }
    }
  }, {
    key: "dspKernelProcess",
    value: function dspKernelProcess(delayBuffer, output, delayIndexes, inNumSamples) {
      var length = delayBuffer.length;

      for (var i = 0; i < inNumSamples; i++) {
        var idx = delayIndexes[i];
        var id0 = idx | 0;
        var dx = idx % 1;

        if (dx === 0) {
          output[i] = delayBuffer[tt(id0, length)];
        } else {
          var d0 = delayBuffer[tt(id0 + 1, length)];
          var d1 = delayBuffer[tt(id0, length)];
          var d2 = delayBuffer[tt(id0 - 1, length)];
          var d3 = delayBuffer[tt(id0 - 2, length)];

          output[i] = cubicinterp(dx, d0, d1, d2, d3);
        }
      }
    }
  }]);

  return DelayNode;
}(AudioNode);

function tt(index, length) {
  if (index < 0) {
    return length + index % length;
  }
  return index % length;
}

function cubicinterp(x, y0, y1, y2, y3) {
  var c0 = y1;
  var c1 = 0.5 * (y2 - y0);
  var c2 = y0 - 2.5 * y1 + 2 * y2 - 0.5 * y3;
  var c3 = 0.5 * (y3 - y0) + 1.5 * (y1 - y2);

  return ((c3 * x + c2) * x + c1) * x + c0;
}

function computeFrameToDelay(delayTime, sampleRate, blockSize) {
  return Math.ceil(delayTime * sampleRate / blockSize) * blockSize + blockSize;
}

module.exports = DelayNode;

},{"../AudioNode":44,"../core/AudioBus":65}],75:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("../AudioNode");
var DSPAlgorithm = {};

var GainNode = function (_AudioNode) {
  _inherits(GainNode, _AudioNode);

  function GainNode() {
    _classCallCheck(this, GainNode);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(GainNode).apply(this, arguments));
  }

  _createClass(GainNode, [{
    key: "dspProcess",
    value: function dspProcess(e) {
      var inputBus = this.getInput(0).getAudioBus();
      var outputBus = this.getOutput(0).getAudioBus();

      if (inputBus.isSilent()) {
        outputBus.zeros();
        return;
      }

      var gainParam = this._gain;

      if (gainParam.hasSampleAccurateValues()) {
        var _inputs = inputBus.getChannelData();
        var _outputs = outputBus.getMutableData();
        var gainValues = gainParam.getSampleAccurateValues();
        var _numberOfChannels = _inputs.length;
        var _dsp = selectAlgorithm(_numberOfChannels, 1000);

        _dsp(_inputs, _outputs, gainValues, e.inNumSamples);

        return;
      }

      var gainValue = gainParam.getValue();

      if (gainValue === 0) {
        outputBus.zeros();
        return;
      }

      if (gainValue === 1) {
        outputBus.copyFrom(inputBus);
        return;
      }

      var inputs = inputBus.getChannelData();
      var outputs = outputBus.getMutableData();
      var numberOfChannels = outputs.length;
      var dsp = selectAlgorithm(numberOfChannels, 2000);

      dsp(inputs, outputs, gainValue, e.inNumSamples);
    }
  }]);

  return GainNode;
}(AudioNode);

function selectAlgorithm(numberOfChannels, base) {
  var algorithmIndex = numberOfChannels + base;

  if (DSPAlgorithm[algorithmIndex]) {
    return DSPAlgorithm[algorithmIndex];
  }

  return DSPAlgorithm[base];
}

DSPAlgorithm[1000] = function (inputs, outputs, gainValues, inNumSamples) {
  var numberOfChannels = inputs.length;

  for (var ch = 0; ch < numberOfChannels; ch++) {
    for (var i = 0; i < inNumSamples; i++) {
      outputs[ch][i] = inputs[ch][i] * gainValues[i];
    }
  }
};

DSPAlgorithm[1001] = function (inputs, outputs, gainValues, inNumSamples) {
  var input = inputs[0];
  var output = outputs[0];

  for (var i = 0; i < inNumSamples; i++) {
    output[i] = input[i] * gainValues[i];
  }
};

DSPAlgorithm[1002] = function (inputs, outputs, gainValues, inNumSamples) {
  var inputL = inputs[0];
  var inputR = inputs[1];
  var outputL = outputs[0];
  var outputR = outputs[1];

  for (var i = 0; i < inNumSamples; i++) {
    outputL[i] = inputL[i] * gainValues[i];
    outputR[i] = inputR[i] * gainValues[i];
  }
};

DSPAlgorithm[2000] = function (inputs, outputs, gainValue, inNumSamples) {
  var numberOfChannels = inputs.length;

  for (var ch = 0; ch < numberOfChannels; ch++) {
    for (var i = 0; i < inNumSamples; i++) {
      outputs[ch][i] = inputs[ch][i] * gainValue;
    }
  }
};

DSPAlgorithm[2001] = function (inputs, outputs, gainValue, inNumSamples) {
  var input = inputs[0];
  var output = outputs[0];

  for (var i = 0; i < inNumSamples; i++) {
    output[i] = input[i] * gainValue;
  }
};

DSPAlgorithm[2002] = function (inputs, outputs, gainValue, inNumSamples) {
  var inputL = inputs[0];
  var inputR = inputs[1];
  var outputL = outputs[0];
  var outputR = outputs[1];

  for (var i = 0; i < inNumSamples; i++) {
    outputL[i] = inputL[i] * gainValue;
    outputR[i] = inputR[i] * gainValue;
  }
};

module.exports = GainNode;

},{"../AudioNode":44}],76:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioSourceNode = require("../AudioSourceNode");

var OscillatorNode = function (_AudioSourceNode) {
  _inherits(OscillatorNode, _AudioSourceNode);

  function OscillatorNode() {
    _classCallCheck(this, OscillatorNode);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(OscillatorNode).apply(this, arguments));
  }

  _createClass(OscillatorNode, [{
    key: "dspInit",
    value: function dspInit() {
      this._phase = 0;
    }
  }, {
    key: "dspProcess",
    value: function dspProcess(e) {
      var _this2 = this;

      var currentTime = e.currentTime;
      var nextCurrentTime = e.nextCurrentTime;

      if (nextCurrentTime < this._startTime) {
        return;
      }

      if (this._stopTime <= currentTime) {
        return;
      }

      var sampleRate = e.sampleRate;
      var inNumSamples = e.inNumSamples;
      var frameOffset = Math.max(0, Math.round((this._startTime - currentTime) * sampleRate));
      var fillToTime = Math.min(nextCurrentTime, this._stopTime);
      var fillToFrame = Math.round((fillToTime - currentTime) * sampleRate) | 0;
      var output = this.getOutput(0).getAudioBus().getMutableData()[0];

      var writeIndex = 0;

      if (this._type === "sine") {
        writeIndex = this.dspSine(output, frameOffset, fillToFrame, sampleRate);
      } else {
        writeIndex = this.dspWave(output, frameOffset, fillToFrame, sampleRate);
      }

      if (writeIndex < inNumSamples) {
        while (writeIndex < inNumSamples) {
          output[writeIndex++] = 0;
        }
        this.context.addPostProcess(function () {
          _this2.getOutput(0).getAudioBus().zeros();
          _this2.getOutput(0).disable();
          _this2.dispatchEvent({ type: "ended" });
        });
      }
    }
  }, {
    key: "dspSine",
    value: function dspSine(output, writeIndex, inNumSamples, sampleRate) {
      var frequency = this._frequency;
      var detune = this._detune;
      var algorithm = frequency.hasSampleAccurateValues() * 2 + detune.hasSampleAccurateValues();
      var frequencyToPhaseIncr = 2 * Math.PI / sampleRate;

      var phase = this._phase;

      if (algorithm === 0) {
        var frequencyValue = frequency.getValue();
        var detuneValue = detune.getValue();
        var computedFrequency = frequencyValue * Math.pow(2, detuneValue / 1200);
        var phaseIncr = frequencyToPhaseIncr * computedFrequency;

        while (writeIndex < inNumSamples) {
          output[writeIndex++] = Math.sin(phase);
          phase += phaseIncr;
        }
      } else {
        var frequencyValues = frequency.getSampleAccurateValues();
        var detuneValues = detune.getSampleAccurateValues();

        while (writeIndex < inNumSamples) {
          var _frequencyValue = frequencyValues[writeIndex];
          var _detuneValue = detuneValues[writeIndex];
          var _computedFrequency = _frequencyValue * Math.pow(2, _detuneValue / 1200);

          output[writeIndex++] = Math.sin(phase);
          phase += frequencyToPhaseIncr * _computedFrequency;
        }
      }

      this._phase = phase;

      return writeIndex;
    }
  }, {
    key: "dspWave",
    value: function dspWave(output, writeIndex, inNumSamples, sampleRate) {
      var frequency = this._frequency;
      var detune = this._detune;
      var algorithm = frequency.hasSampleAccurateValues() * 2 + detune.hasSampleAccurateValues();
      var waveTable = this._waveTable;
      var waveTableLength = waveTable.length - 1;
      var frequencyToPhaseIncr = 1 / sampleRate;

      var phase = this._phase;

      if (algorithm === 0) {
        var frequencyValue = frequency.getValue();
        var detuneValue = detune.getValue();
        var computedFrequency = frequencyValue * Math.pow(2, detuneValue / 1200);
        var phaseIncr = frequencyToPhaseIncr * computedFrequency;

        while (writeIndex < inNumSamples) {
          var idx = phase * waveTableLength % waveTableLength;
          var v0 = waveTable[idx | 0];
          var v1 = waveTable[(idx | 0) + 1];

          output[writeIndex++] = v0 + idx % 1 * (v1 - v0);
          phase += phaseIncr;
        }
      } else {
        var frequencyValues = frequency.getSampleAccurateValues();
        var detuneValues = detune.getSampleAccurateValues();

        while (writeIndex < inNumSamples) {
          var _frequencyValue2 = frequencyValues[writeIndex];
          var _detuneValue2 = detuneValues[writeIndex];
          var _computedFrequency2 = _frequencyValue2 * Math.pow(2, _detuneValue2 / 1200);
          var _idx = phase * waveTableLength % waveTableLength;
          var _v = waveTable[_idx | 0];
          var _v2 = waveTable[(_idx | 0) + 1];

          output[writeIndex++] = _v + _idx % 1 * (_v2 - _v);
          phase += frequencyToPhaseIncr * _computedFrequency2;
        }
      }

      this._phase = phase;

      return writeIndex;
    }
  }]);

  return OscillatorNode;
}(AudioSourceNode);

module.exports = OscillatorNode;

},{"../AudioSourceNode":46}],77:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WAVE_TABLE_LENGTH = 8192;

var PeriodicWave = function () {
  function PeriodicWave() {
    _classCallCheck(this, PeriodicWave);
  }

  _createClass(PeriodicWave, [{
    key: "dspInit",
    value: function dspInit() {
      this._waveTable = null;
    }
  }, {
    key: "dspBuildWaveTable",
    value: function dspBuildWaveTable() {
      if (this._waveTable !== null) {
        return this._waveTable;
      }

      var waveTable = new Float32Array(WAVE_TABLE_LENGTH + 1);
      var real = this._real;
      var imag = this._imag;

      var maxAbsValue = 0;
      var periodicWaveLength = Math.min(real.length, 16);

      for (var i = 0; i < WAVE_TABLE_LENGTH; i++) {
        var x = i / WAVE_TABLE_LENGTH * Math.PI * 2;

        for (var n = 1; n < periodicWaveLength; n++) {
          waveTable[i] += real[n] * Math.cos(n * x) + imag[n] * Math.sin(n * x);
        }

        maxAbsValue = Math.max(maxAbsValue, Math.abs(waveTable[i]));
      }

      if (!this._constants && maxAbsValue !== 1) {
        for (var _i = 0; _i < WAVE_TABLE_LENGTH; _i++) {
          waveTable[_i] *= maxAbsValue;
        }
      }
      waveTable[WAVE_TABLE_LENGTH] = waveTable[0];

      this._waveTable = waveTable;

      return waveTable;
    }
  }]);

  return PeriodicWave;
}();

module.exports = PeriodicWave;

},{}],78:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("../AudioNode");
var AudioBuffer = require("../AudioBuffer");

var ScriptProcessorNode = function (_AudioNode) {
  _inherits(ScriptProcessorNode, _AudioNode);

  function ScriptProcessorNode() {
    _classCallCheck(this, ScriptProcessorNode);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ScriptProcessorNode).apply(this, arguments));
  }

  _createClass(ScriptProcessorNode, [{
    key: "dspInit",
    value: function dspInit() {
      this._eventItem = null;
      this._inputChannelData = null;
      this._outputChannelData = null;
      this._writeIndex = 0;
    }
  }, {
    key: "dspSetEventItem",
    value: function dspSetEventItem(eventItem) {
      var numberOfInputChannels = this.getInput(0).getNumberOfChannels();
      var numberOfOutputChannels = this.getOutput(0).getNumberOfChannels();
      var inputBuffer = new AudioBuffer(this.context, {
        numberOfChannels: numberOfInputChannels, length: this._bufferSize, sampleRate: this.sampleRate
      });
      var outputBuffer = new AudioBuffer(this.context, {
        numberOfChannels: numberOfOutputChannels, length: this._bufferSize, sampleRate: this.sampleRate
      });

      eventItem.inputBuffer._impl = inputBuffer;
      eventItem.outputBuffer._impl = outputBuffer;

      this._inputChannelData = inputBuffer.getAudioData().channelData;
      this._outputChannelData = outputBuffer.getAudioData().channelData;

      this._eventItem = eventItem;
    }
  }, {
    key: "dspProcess",
    value: function dspProcess(e) {
      var _this2 = this;

      var inputs = this.getInput(0).getAudioBus().getChannelData();
      var outputs = this.getOutput(0).getAudioBus().getMutableData();
      var inputChannelData = this._inputChannelData;
      var outputChannelData = this._outputChannelData;
      var numberOfInputChannels = inputs.length;
      var numberOfOutputChannels = outputs.length;
      var inNumSamples = e.inNumSamples;
      var writeIndex = this._writeIndex;

      for (var i = 0; i < inNumSamples; i++) {
        for (var ch = 0; ch < numberOfInputChannels; ch++) {
          inputChannelData[ch][i + writeIndex] = inputs[ch][i];
        }
        for (var _ch = 0; _ch < numberOfOutputChannels; _ch++) {
          outputs[_ch][i] = outputChannelData[_ch][i + writeIndex];
        }
      }

      this._writeIndex += inNumSamples;

      if (this._writeIndex === this._bufferSize) {
        this.context.addPostProcess(function () {
          for (var _ch2 = 0; _ch2 < numberOfOutputChannels; _ch2++) {
            outputChannelData[_ch2].fill(0);
          }
          _this2._eventItem.playbackTime = e.nextCurrentTime;
          _this2.dispatchEvent(_this2._eventItem);
        });
        this._writeIndex = 0;
      }
    }
  }]);

  return ScriptProcessorNode;
}(AudioNode);

module.exports = ScriptProcessorNode;

},{"../AudioBuffer":39,"../AudioNode":44}],79:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BasePannerNode = require("../BasePannerNode");

var StereoPannerNode = function (_BasePannerNode) {
  _inherits(StereoPannerNode, _BasePannerNode);

  function StereoPannerNode() {
    _classCallCheck(this, StereoPannerNode);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(StereoPannerNode).apply(this, arguments));
  }

  _createClass(StereoPannerNode, [{
    key: "dspProcess",
    value: function dspProcess(e) {
      var inputBus = this.getInput(0).getAudioBus();
      var outputBus = this.getOutput(0).getAudioBus();

      if (inputBus.isSilent()) {
        outputBus.zeros();
        return;
      }

      var panParam = this._pan;

      if (panParam.hasSampleAccurateValues()) {
        this.dspSampleAccurateValues(inputBus, outputBus, panParam.getSampleAccurateValues(), e.inNumSamples);
      } else {
        this.dspStaticValue(inputBus, outputBus, panParam.getValue(), e.inNumSamples);
      }
    }
  }, {
    key: "dspSampleAccurateValues",
    value: function dspSampleAccurateValues(inputBus, outputBus, panValues, inNumSamples) {
      var outputs = outputBus.getMutableData();
      var numberOfChannels = inputBus.getNumberOfChannels();

      if (numberOfChannels === 1) {
        var input = inputBus.getChannelData()[0];

        for (var i = 0; i < inNumSamples; i++) {
          var panValue = Math.max(-1, Math.min(panValues[i], +1));
          var panRadian = (panValue * 0.5 + 0.5) * 0.5 * Math.PI;
          var gainL = Math.cos(panRadian);
          var gainR = Math.sin(panRadian);

          outputs[0][i] = input[i] * gainL;
          outputs[1][i] = input[i] * gainR;
        }
      } else {
        var inputs = inputBus.getChannelData()[0];

        for (var _i = 0; _i < inNumSamples; _i++) {
          var _panValue = Math.max(-1, Math.min(panValues[_i], +1));
          var _panRadian = (_panValue <= 0 ? _panValue + 1 : _panValue) * 0.5 * Math.PI;
          var _gainL = Math.cos(_panRadian);
          var _gainR = Math.sin(_panRadian);

          if (_panValue <= 0) {
            outputs[0][_i] = inputs[0][_i] + inputs[1][_i] * _gainL;
            outputs[1][_i] = inputs[1][_i] * _gainR;
          } else {
            outputs[0][_i] = inputs[0][_i] * _gainL;
            outputs[1][_i] = inputs[1][_i] + inputs[0][_i] * _gainR;
          }
        }
      }
    }
  }, {
    key: "dspStaticValue",
    value: function dspStaticValue(inputBus, outputBus, panValue, inNumSamples) {
      var outputs = outputBus.getMutableData();
      var numberOfChannels = inputBus.getNumberOfChannels();

      panValue = Math.max(-1, Math.min(panValue, +1));

      if (numberOfChannels === 1) {
        var input = inputBus.getChannelData()[0];
        var panRadian = (panValue * 0.5 + 0.5) * 0.5 * Math.PI;
        var gainL = Math.cos(panRadian);
        var gainR = Math.sin(panRadian);

        for (var i = 0; i < inNumSamples; i++) {
          outputs[0][i] = input[i] * gainL;
          outputs[1][i] = input[i] * gainR;
        }
      } else {
        var inputs = inputBus.getChannelData()[0];
        var _panRadian2 = (panValue <= 0 ? panValue + 1 : panValue) * 0.5 * Math.PI;
        var _gainL2 = Math.cos(_panRadian2);
        var _gainR2 = Math.sin(_panRadian2);

        if (panValue <= 0) {
          for (var _i2 = 0; _i2 < inNumSamples; _i2++) {
            outputs[0][_i2] = inputs[0][_i2] + inputs[1][_i2] * _gainL2;
            outputs[1][_i2] = inputs[1][_i2] * _gainR2;
          }
        } else {
          for (var _i3 = 0; _i3 < inNumSamples; _i3++) {
            outputs[0][_i3] = inputs[0][_i3] * _gainL2;
            outputs[1][_i3] = inputs[1][_i3] + inputs[0][_i3] * _gainR2;
          }
        }
      }
    }
  }]);

  return StereoPannerNode;
}(BasePannerNode);

module.exports = StereoPannerNode;

},{"../BasePannerNode":48}],80:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("../AudioNode");

var WaveShaperNode = function (_AudioNode) {
  _inherits(WaveShaperNode, _AudioNode);

  function WaveShaperNode() {
    _classCallCheck(this, WaveShaperNode);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(WaveShaperNode).apply(this, arguments));
  }

  _createClass(WaveShaperNode, [{
    key: "dspProcess",
    value: function dspProcess(e) {
      var inputBus = this.getInput(0).getAudioBus();
      var outputBus = this.getOutput(0).getAudioBus();

      if (this._curve === null) {
        outputBus.copyFrom(inputBus);
        return;
      }

      var inputs = inputBus.getChannelData();
      var outputs = outputBus.getMutableData();
      var numberOfChannels = outputs.length;
      var inNumSamples = e.inNumSamples;
      var curve = this._curve;

      for (var ch = 0; ch < numberOfChannels; ch++) {
        for (var i = 0; i < inNumSamples; i++) {
          outputs[ch][i] = this.dspApplyCurve(inputs[ch][i], curve);
        }
      }
    }
  }, {
    key: "dspApplyCurve",
    value: function dspApplyCurve(x, curve) {
      x = Math.max(-1, Math.min(x, 1));
      x = (x + 1) * 0.5;

      var ix = x * (curve.length - 1);
      var i0 = ix | 0;
      var i1 = i0 + 1;

      if (curve.length <= i1) {
        return curve[curve.length - 1];
      }

      var y0 = curve[i0];
      var y1 = curve[i1];
      var a = ix % 1;

      return y0 + a * (y1 - y0);
    }
  }]);

  return WaveShaperNode;
}(AudioNode);

module.exports = WaveShaperNode;

},{"../AudioNode":44}],81:[function(require,module,exports){
"use strict";

"use strict", module.exports = {
  AnalyserNode: require("./AnalyserNode"),
  AudioBuffer: require("./AudioBuffer"),
  AudioBufferSourceNode: require("./AudioBufferSourceNode"),
  AudioContext: require("./AudioContext"),
  AudioDestinationNode: require("./AudioDestinationNode"),
  AudioListener: require("./AudioListener"),
  AudioNode: require("./AudioNode"),
  AudioParam: require("./AudioParam"),
  AudioWorkerNode: require("./AudioWorkerNode"),
  BiquadFilterNode: require("./BiquadFilterNode"),
  ChannelMergerNode: require("./ChannelMergerNode"),
  ChannelSplitterNode: require("./ChannelSplitterNode"),
  ConvolverNode: require("./ConvolverNode"),
  DelayNode: require("./DelayNode"),
  DynamicsCompressorNode: require("./DynamicsCompressorNode"),
  GainNode: require("./GainNode"),
  IIRFilterNode: require("./IIRFilterNode"),
  OscillatorNode: require("./OscillatorNode"),
  PannerNode: require("./PannerNode"),
  PeriodicWave: require("./PeriodicWave"),
  ScriptProcessorNode: require("./ScriptProcessorNode"),
  SpatialPannerNode: require("./SpatialPannerNode"),
  StereoPannerNode: require("./StereoPannerNode"),
  WaveShaperNode: require("./WaveShaperNode")
};

},{"./AnalyserNode":38,"./AudioBuffer":39,"./AudioBufferSourceNode":40,"./AudioContext":41,"./AudioDestinationNode":42,"./AudioListener":43,"./AudioNode":44,"./AudioParam":45,"./AudioWorkerNode":47,"./BiquadFilterNode":49,"./ChannelMergerNode":50,"./ChannelSplitterNode":51,"./ConvolverNode":52,"./DelayNode":53,"./DynamicsCompressorNode":54,"./GainNode":56,"./IIRFilterNode":57,"./OscillatorNode":58,"./PannerNode":59,"./PeriodicWave":60,"./ScriptProcessorNode":61,"./SpatialPannerNode":62,"./StereoPannerNode":63,"./WaveShaperNode":64}],82:[function(require,module,exports){
"use strict";

function isAudioData(data) {
  if (!data) {
    return false;
  }
  if (!Number.isFinite(data.sampleRate)) {
    return false;
  }
  if (!Array.isArray(data.channelData)) {
    return false;
  }
  if (!data.channelData.every(function (data) {
    return data instanceof Float32Array;
  })) {
    return false;
  }
  return true;
}

function toAudioData(data) {
  if (isAudioData(data)) {
    var numberOfChannels = data.channelData.length;
    var length = numberOfChannels ? data.channelData[0].length : 0;
    var sampleRate = data.sampleRate;
    var channelData = data.channelData;

    return { numberOfChannels: numberOfChannels, length: length, sampleRate: sampleRate, channelData: channelData };
  }
  if (isAudioBuffer(data)) {
    var _numberOfChannels = data.numberOfChannels;
    var _sampleRate = data.sampleRate;
    var _channelData = new Array(_numberOfChannels).fill().map(function (_, ch) {
      return data.getChannelData(ch);
    });
    var _length = _numberOfChannels ? _channelData[0].length : 0;

    return { numberOfChannels: _numberOfChannels, length: _length, sampleRate: _sampleRate, channelData: _channelData };
  }
  return { numberOfChannels: 0, length: 0, sampleRate: 0, channelData: [] };
}

function isAudioBuffer(data) {
  if (!data) {
    return false;
  }
  if (typeof data.numberOfChannels !== "number") {
    return false;
  }
  if (typeof data.sampleRate !== "number") {
    return false;
  }
  if (typeof data.getChannelData !== "function") {
    return false;
  }
  return true;
}

function toAudioBuffer(data, AudioBuffer) {
  data = toAudioData(data);

  var audioBuffer = new AudioBuffer({ sampleRate: data.sampleRate });
  var audioData = (audioBuffer._impl || audioBuffer).getAudioData();

  audioData.numberOfChannels = data.numberOfChannels;
  audioData.length = data.length;
  audioData.sampleRate = data.sampleRate;
  audioData.channelData = data.channelData;

  return audioBuffer;
}

module.exports = { isAudioData: isAudioData, toAudioData: toAudioData, isAudioBuffer: isAudioBuffer, toAudioBuffer: toAudioBuffer };

},{}],83:[function(require,module,exports){
"use strict";

var audioDataUtil = require("./audioDataUtil");
var resampler = require("./resampler");

function decode(decodeFn, audioData, opts) {
  opts = opts || /* istanbul ignore next */{};

  return new Promise(function (resolve, reject) {
    return decodeFn(audioData, opts).then(function (result) {
      if (audioDataUtil.isAudioData(result)) {
        if (typeof opts.sampleRate === "number") {
          result = resampler.resample(result, opts.sampleRate);
        }
        return resolve(result);
      }
      return reject(new TypeError("Failed to decode audio data"));
    }, reject);
  });
}

module.exports = { decode: decode };

},{"./audioDataUtil":82,"./resampler":88}],84:[function(require,module,exports){
"use strict";

function defineProp(target, name, value) {
  Object.defineProperty(target, name, { value: value, enumerable: false, writable: true, configurable: true });
}

module.exports = defineProp;

},{}],85:[function(require,module,exports){
"use strict";

var audioDataUtil = require("./audioDataUtil");

function encode(encodeFn, audioData, opts) {
  opts = opts || /* istanbul ignore next */{};
  if (!audioDataUtil.isAudioData(audioData)) {
    audioData = audioDataUtil.toAudioData(audioData);
  }
  return encodeFn(audioData, opts);
}

module.exports = { encode: encode };

},{"./audioDataUtil":82}],86:[function(require,module,exports){
"use strict";

module.exports.mixin = require("./mixin");
module.exports.defineProp = require("./defineProp");
module.exports.toAudioTime = require("./toAudioTime");
module.exports.toValidBitDepth = require("./toValidBitDepth");

function clip(value, minValue, maxValue) {
  return Math.max(minValue, Math.min(value, maxValue));
}
module.exports.clip = clip;

function defaults(value, defaultValue) {
  return typeof value !== "undefined" ? value : defaultValue;
}
module.exports.defaults = defaults;

function toArrayIfNeeded(value) {
  return Array.isArray(value) ? value : [value];
}
module.exports.toArrayIfNeeded = toArrayIfNeeded;

function toImpl(value) {
  return value._impl || value;
}
module.exports.toImpl = toImpl;

function toNumber(value) {
  return +value || 0;
}
module.exports.toNumber = toNumber;

function toPowerOfTwo(value, round) {
  round = round || Math.round;
  return 1 << round(Math.log(value) / Math.log(2));
}
module.exports.toPowerOfTwo = toPowerOfTwo;

var MIN_SAMPLERATE = 3000;
var MAX_SAMPLERATE = 192000;

function toValidSampleRate(value) {
  return clip(toNumber(value), MIN_SAMPLERATE, MAX_SAMPLERATE);
}
module.exports.toValidSampleRate = toValidSampleRate;

var MIN_BLOCK_SIZE = 8;
var MAX_BLOCK_SIZE = 1024;

function toValidBlockSize(value) {
  return clip(toPowerOfTwo(value), MIN_BLOCK_SIZE, MAX_BLOCK_SIZE);
}
module.exports.toValidBlockSize = toValidBlockSize;

var MAX_NUMBER_OF_CHANNELS = 32;

function toValidNumberOfChannels(value) {
  return clip(value | 0, 1, MAX_NUMBER_OF_CHANNELS);
}
module.exports.toValidNumberOfChannels = toValidNumberOfChannels;

},{"./defineProp":84,"./mixin":87,"./toAudioTime":89,"./toValidBitDepth":90}],87:[function(require,module,exports){
"use strict";

function mixin(targetKlass, partialKlass) {
  var partialProto = partialKlass.prototype;
  var targetProto = targetKlass.prototype;

  Object.getOwnPropertyNames(partialProto).forEach(function (methodName) {
    if (methodName !== "constructor") {

      var desc = Object.getOwnPropertyDescriptor(partialProto, methodName);

      Object.defineProperty(targetProto, methodName, desc);
    }
  });

  return targetKlass;
}
module.exports = mixin;

},{}],88:[function(require,module,exports){
"use strict";

function resample(audioData, sampleRate) {
  if (audioData.sampleRate === sampleRate) {
    return audioData;
  }

  var rate = audioData.sampleRate / sampleRate;
  var numberOfChannels = audioData.channelData.length;
  var length = Math.round(audioData.channelData[0].length / rate);
  var channelData = new Array(numberOfChannels).fill().map(function () {
    return new Float32Array(length);
  });

  for (var i = 0; i < length; i++) {
    var ix = i * rate;
    var i0 = ix | 0;
    var i1 = i0 + 1;
    var ia = ix % 1;

    for (var ch = 0; ch < numberOfChannels; ch++) {
      var v0 = audioData.channelData[ch][i0];
      var v1 = audioData.channelData[ch][i1];

      channelData[ch][i] = v0 + ia * (v1 - v0);
    }
  }

  return { numberOfChannels: numberOfChannels, length: length, sampleRate: sampleRate, channelData: channelData };
}

module.exports = { resample: resample };

},{}],89:[function(require,module,exports){
"use strict";

function toAudioTime(str) {
  if (Number.isFinite(+str)) {
    var time = Math.max(0, +str);

    return Number.isFinite(time) ? time : 0;
  }

  var matched = ("" + str).match(/^(?:(\d\d+):)?(\d\d?):(\d\d?(?:\.\d+)?)$/);

  if (matched) {
    var hours = +matched[1] | 0;
    var minutes = +matched[2];
    var seconds = +matched[3];

    return hours * 3600 + minutes * 60 + seconds;
  }

  return 0;
}

module.exports = toAudioTime;

},{}],90:[function(require,module,exports){
"use strict";
"use stirct";

function toValidBitDepth(value) {
  value = value | 0;
  if (value === 8 || value === 16 || value === 24 || value === 32) {
    return value;
  }
  return 16;
}

module.exports = toValidBitDepth;

},{}],91:[function(require,module,exports){
"use strict";

var OfflineAudioContext = require("./context/OfflineAudioContext");
var StreamAudioContext = require("./context/StreamAudioContext");
var RenderingAudioContext = require("./context/RenderingAudioContext");
var WebAudioContext = require("./context/WebAudioContext");
var api = require("./api");
var impl = require("./impl");
var decoder = require("./decoder");
var encoder = require("./encoder");

module.exports = {
  OfflineAudioContext: OfflineAudioContext,
  StreamAudioContext: StreamAudioContext,
  RenderingAudioContext: RenderingAudioContext,
  WebAudioContext: WebAudioContext,
  api: api, impl: impl, decoder: decoder, encoder: encoder
};

},{"./api":30,"./context/OfflineAudioContext":32,"./context/RenderingAudioContext":33,"./context/StreamAudioContext":34,"./context/WebAudioContext":35,"./decoder":36,"./encoder":37,"./impl":81}]},{},[91])(91)
});