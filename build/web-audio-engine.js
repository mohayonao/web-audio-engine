(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.WebAudioEngine = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
module.exports = function (buf) {
	if (!buf) {
		return false;
	}

	if (require('is-mp3')(buf)) {
		return 'mp3';
	}

	if (require('is-wav')(buf)) {
		return 'wav';
	}

	if (require('is-ogg')(buf)) {
		return 'oga';
	}

	if (require('is-flac')(buf)) {
		return 'flac';
	}

	if (require('is-m4a')(buf)) {
		return 'm4a';
	}

	return false;
};

},{"is-flac":20,"is-m4a":21,"is-mp3":22,"is-ogg":23,"is-wav":24}],2:[function(require,module,exports){
"use strict";

module.exports = function(freq, q) {
  freq = Math.max(1e-6, Math.min(freq, 1));
  q    = Math.max(1e-4, Math.min(q, 1000));

  var w0 = 2 * Math.PI * freq;
  var sin = Math.sin(w0);
  var cos = Math.cos(w0);
  var alpha = sin / (2 * q);

  var b0 =  1 - alpha;
  var b1 = -2 * cos;
  var b2 =  1 + alpha;
  var a0 =  1 + alpha;
  var a1 = -2 * cos;
  var a2 =  1 - alpha;

  return [ b0/a0, b1/a0, b2/a0, a1/a0, a2/a0 ];
};

},{}],3:[function(require,module,exports){
"use strict";

module.exports = function(freq, q) {
  freq = Math.max(1e-6, Math.min(freq, 1));
  q    = Math.max(1e-4, Math.min(q, 1000));

  var w0 = 2 * Math.PI * freq;
  var sin = Math.sin(w0);
  var cos = Math.cos(w0);
  var alpha = sin / (2 * q);

  var b0 =  alpha;
  var b1 =  0;
  var b2 = -alpha;
  var a0 =  1 + alpha;
  var a1 = -2 * cos;
  var a2 =  1 - alpha;

  return [ b0/a0, b1/a0, b2/a0, a1/a0, a2/a0 ];
};

},{}],4:[function(require,module,exports){
"use strict";

module.exports = function(freq, _, gain) {
  freq = Math.max(1e-6, Math.min(freq, 1));
  gain = Math.max(-40, Math.min(gain, 40));

  var w0 = 2 * Math.PI * freq;
  var sin = Math.sin(w0);
  var cos = Math.cos(w0);
  var a = Math.pow(10, (gain / 40));
  var alpha = (sin / 2) * Math.sqrt(2);
  var alphamod = 2 * Math.sqrt(a) * alpha;

  var b0 =      a * ((a+1) + (a-1) * cos + alphamod);
  var b1 = -2 * a * ((a-1) + (a+1) * cos           );
  var b2 =      a * ((a+1) + (a-1) * cos - alphamod);
  var a0 =          ((a+1) - (a-1) * cos + alphamod);
  var a1 =  2 *     ((a-1) - (a+1) * cos           );
  var a2 =          ((a+1) - (a-1) * cos - alphamod);

  return [ b0/a0, b1/a0, b2/a0, a1/a0, a2/a0 ];
};

},{}],5:[function(require,module,exports){
"use strict";

module.exports = function(freq, _, gain) {
  freq = Math.max(1e-6, Math.min(freq, 1));
  gain = Math.max(-40, Math.min(gain, 40));

  var w0 = 2 * Math.PI * freq;
  var sin = Math.sin(w0);
  var cos = Math.cos(w0);
  var a = Math.pow(10, (gain / 40));
  var alpha = (sin / 2) * Math.sqrt(2);
  var alphamod = 2 * Math.sqrt(a) * alpha;

  var b0 =      a * ((a+1) - (a-1) * cos + alphamod);
  var b1 =  2 * a * ((a-1) - (a+1) * cos           );
  var b2 =      a * ((a+1) - (a-1) * cos - alphamod);
  var a0 =          ((a+1) + (a-1) * cos + alphamod);
  var a1 = -2 *     ((a-1) + (a+1) * cos           );
  var a2 =          ((a+1) + (a-1) * cos - alphamod);

  return [ b0/a0, b1/a0, b2/a0, a1/a0, a2/a0 ];
};

},{}],6:[function(require,module,exports){
"use strict";

module.exports = function(freq, q) {
  freq = Math.max(1e-6, Math.min(freq, 1));
  q    = Math.max(1e-4, Math.min(q, 1000));

  var w0 = 2 * Math.PI * freq;
  var sin = Math.sin(w0);
  var cos = Math.cos(w0);
  var alpha = sin / (2 * q);

  var b0 =  1;
  var b1 = -2 * cos;
  var b2 =  1;
  var a0 =  1 + alpha;
  var a1 = -2 * cos;
  var a2 =  1 - alpha;

  return [ b0/a0, b1/a0, b2/a0, a1/a0, a2/a0 ];
};

},{}],7:[function(require,module,exports){
"use strict";

module.exports = function(freq, q, gain) {
  freq = Math.max(1e-6, Math.min(freq, 1));
  q    = Math.max(1e-4, Math.min(q, 1000));
  gain = Math.max(-40, Math.min(gain, 40));

  var w0 = 2 * Math.PI * freq;
  var sin = Math.sin(w0);
  var cos = Math.cos(w0);
  var a = Math.pow(10, (gain / 40));
  var alpha = sin / (2 * q);

  var b0 =  1 + alpha * a;
  var b1 = -2 * cos;
  var b2 =  1 - alpha * a;
  var a0 =  1 + alpha / a;
  var a1 = -2 * cos;
  var a2 =  1 - alpha / a;

  return [ b0/a0, b1/a0, b2/a0, a1/a0, a2/a0 ];
};

},{}],8:[function(require,module,exports){
module.exports = require("biquad-coeffs-webaudio-v1/lib/allpass");

},{"biquad-coeffs-webaudio-v1/lib/allpass":2}],9:[function(require,module,exports){
module.exports = require("biquad-coeffs-webaudio-v1/lib/bandpass");

},{"biquad-coeffs-webaudio-v1/lib/bandpass":3}],10:[function(require,module,exports){
"use strict";

module.exports = function(freq, q) {
  freq = Math.max(1e-6, Math.min(freq, 1));
  q    = Math.max(1e-4, Math.min(q, 1000));

  var w0 = 2 * Math.PI * freq;
  var sin = Math.sin(w0);
  var cos = Math.cos(w0);
  var alpha = sin / (2 * Math.pow(10, q / 20));

  var b0 =  (1 + cos) * 0.5;
  var b1 = -(1 + cos);
  var b2 =  (1 + cos) * 0.5;
  var a0 =  1 + alpha;
  var a1 = -2 * cos;
  var a2 =  1 - alpha;

  return [ b0/a0, b1/a0, b2/a0, a1/a0, a2/a0 ];
};

},{}],11:[function(require,module,exports){
module.exports = require("biquad-coeffs-webaudio-v1/lib/highshelf");

},{"biquad-coeffs-webaudio-v1/lib/highshelf":4}],12:[function(require,module,exports){
module.exports["lowpass"] = require("./lowpass");
module.exports["highpass"] = require("./highpass");
module.exports["bandpass"] = require("./bandpass");
module.exports["notch"] = require("./notch");
module.exports["allpass"] = require("./allpass");
module.exports["peaking"] = require("./peaking");
module.exports["lowshelf"] = require("./lowshelf");
module.exports["highshelf"] = require("./highshelf");

},{"./allpass":8,"./bandpass":9,"./highpass":10,"./highshelf":11,"./lowpass":13,"./lowshelf":14,"./notch":15,"./peaking":16}],13:[function(require,module,exports){
"use strict";

module.exports = function(freq, q) {
  freq = Math.max(1e-6, Math.min(freq, 1));
  q    = Math.max(1e-4, Math.min(q, 1000));

  var w0 = 2 * Math.PI * freq;
  var sin = Math.sin(w0);
  var cos = Math.cos(w0);
  var alpha = sin / (2 * Math.pow(10, q / 20));

  var b0 = (1 - cos) * 0.5;
  var b1 = (1 - cos);
  var b2 = (1 - cos) * 0.5;
  var a0 =  1 + alpha;
  var a1 = -2 * cos;
  var a2 =  1 - alpha;

  return [ b0/a0, b1/a0, b2/a0, a1/a0, a2/a0 ];
};

},{}],14:[function(require,module,exports){
module.exports = require("biquad-coeffs-webaudio-v1/lib/lowshelf");

},{"biquad-coeffs-webaudio-v1/lib/lowshelf":5}],15:[function(require,module,exports){
module.exports = require("biquad-coeffs-webaudio-v1/lib/notch");

},{"biquad-coeffs-webaudio-v1/lib/notch":6}],16:[function(require,module,exports){
module.exports = require("biquad-coeffs-webaudio-v1/lib/peaking");

},{"biquad-coeffs-webaudio-v1/lib/peaking":7}],17:[function(require,module,exports){
module.exports = require("biquad-coeffs-webaudio-v2");

},{"biquad-coeffs-webaudio-v2":12}],18:[function(require,module,exports){
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
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
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

},{}],19:[function(require,module,exports){
/**
 * Real values fourier transform.
 *
 * @module  fourier-transform
 *
 */

module.exports = function rfft (input, spectrum) {
	if (!input) throw Error("Input waveform is not provided, pass input array.");

	var N = input.length;

	var k = Math.floor(Math.log(N) / Math.LN2);

	if (Math.pow(2, k) !== N) throw Error("Invalid array size, must be a power of 2.");

	if (!spectrum) spectrum = new Array(N/2);

	//.forward call
	var n         = N,
		x         = new Array(N),
		TWO_PI    = 2*Math.PI,
		sqrt      = Math.sqrt,
		i         = n >>> 1,
		bSi       = 2 / n,
		n2, n4, n8, nn,
		t1, t2, t3, t4,
		i1, i2, i3, i4, i5, i6, i7, i8,
		st1, cc1, ss1, cc3, ss3,
		e,
		a,
		rval, ival, mag;

	reverseBinPermute(N, x, input);

	for (var ix = 0, id = 4; ix < n; id *= 4) {
		for (var i0 = ix; i0 < n; i0 += id) {
			//sumdiff(x[i0], x[i0+1]); // {a, b}  <--| {a+b, a-b}
			st1 = x[i0] - x[i0+1];
			x[i0] += x[i0+1];
			x[i0+1] = st1;
		}
		ix = 2*(id-1);
	}

	n2 = 2;
	nn = n >>> 1;

	while((nn = nn >>> 1)) {
		ix = 0;
		n2 = n2 << 1;
		id = n2 << 1;
		n4 = n2 >>> 2;
		n8 = n2 >>> 3;
		do {
			if(n4 !== 1) {
				for(i0 = ix; i0 < n; i0 += id) {
					i1 = i0;
					i2 = i1 + n4;
					i3 = i2 + n4;
					i4 = i3 + n4;

					//diffsum3_r(x[i3], x[i4], t1); // {a, b, s} <--| {a, b-a, a+b}
					t1 = x[i3] + x[i4];
					x[i4] -= x[i3];
					//sumdiff3(x[i1], t1, x[i3]);   // {a, b, d} <--| {a+b, b, a-b}
					x[i3] = x[i1] - t1;
					x[i1] += t1;

					i1 += n8;
					i2 += n8;
					i3 += n8;
					i4 += n8;

					//sumdiff(x[i3], x[i4], t1, t2); // {s, d}  <--| {a+b, a-b}
					t1 = x[i3] + x[i4];
					t2 = x[i3] - x[i4];

					t1 = -t1 * Math.SQRT1_2;
					t2 *= Math.SQRT1_2;

					// sumdiff(t1, x[i2], x[i4], x[i3]); // {s, d}  <--| {a+b, a-b}
					st1 = x[i2];
					x[i4] = t1 + st1;
					x[i3] = t1 - st1;

					//sumdiff3(x[i1], t2, x[i2]); // {a, b, d} <--| {a+b, b, a-b}
					x[i2] = x[i1] - t2;
					x[i1] += t2;
				}
			} else {
				for(i0 = ix; i0 < n; i0 += id) {
					i1 = i0;
					i2 = i1 + n4;
					i3 = i2 + n4;
					i4 = i3 + n4;

					//diffsum3_r(x[i3], x[i4], t1); // {a, b, s} <--| {a, b-a, a+b}
					t1 = x[i3] + x[i4];
					x[i4] -= x[i3];

					//sumdiff3(x[i1], t1, x[i3]);   // {a, b, d} <--| {a+b, b, a-b}
					x[i3] = x[i1] - t1;
					x[i1] += t1;
				}
			}

			ix = (id << 1) - n2;
			id = id << 2;
		} while (ix < n);

		e = TWO_PI / n2;

		for (var j = 1; j < n8; j++) {
			a = j * e;
			ss1 = Math.sin(a);
			cc1 = Math.cos(a);

			//ss3 = sin(3*a); cc3 = cos(3*a);
			cc3 = 4*cc1*(cc1*cc1-0.75);
			ss3 = 4*ss1*(0.75-ss1*ss1);

			ix = 0; id = n2 << 1;
			do {
				for (i0 = ix; i0 < n; i0 += id) {
					i1 = i0 + j;
					i2 = i1 + n4;
					i3 = i2 + n4;
					i4 = i3 + n4;

					i5 = i0 + n4 - j;
					i6 = i5 + n4;
					i7 = i6 + n4;
					i8 = i7 + n4;

					//cmult(c, s, x, y, &u, &v)
					//cmult(cc1, ss1, x[i7], x[i3], t2, t1); // {u,v} <--| {x*c-y*s, x*s+y*c}
					t2 = x[i7]*cc1 - x[i3]*ss1;
					t1 = x[i7]*ss1 + x[i3]*cc1;

					//cmult(cc3, ss3, x[i8], x[i4], t4, t3);
					t4 = x[i8]*cc3 - x[i4]*ss3;
					t3 = x[i8]*ss3 + x[i4]*cc3;

					//sumdiff(t2, t4);   // {a, b} <--| {a+b, a-b}
					st1 = t2 - t4;
					t2 += t4;
					t4 = st1;

					//sumdiff(t2, x[i6], x[i8], x[i3]); // {s, d}  <--| {a+b, a-b}
					//st1 = x[i6]; x[i8] = t2 + st1; x[i3] = t2 - st1;
					x[i8] = t2 + x[i6];
					x[i3] = t2 - x[i6];

					//sumdiff_r(t1, t3); // {a, b} <--| {a+b, b-a}
					st1 = t3 - t1;
					t1 += t3;
					t3 = st1;

					//sumdiff(t3, x[i2], x[i4], x[i7]); // {s, d}  <--| {a+b, a-b}
					//st1 = x[i2]; x[i4] = t3 + st1; x[i7] = t3 - st1;
					x[i4] = t3 + x[i2];
					x[i7] = t3 - x[i2];

					//sumdiff3(x[i1], t1, x[i6]);   // {a, b, d} <--| {a+b, b, a-b}
					x[i6] = x[i1] - t1;
					x[i1] += t1;

					//diffsum3_r(t4, x[i5], x[i2]); // {a, b, s} <--| {a, b-a, a+b}
					x[i2] = t4 + x[i5];
					x[i5] -= t4;
				}

				ix = (id << 1) - n2;
				id = id << 2;

			} while (ix < n);
		}
	}

	while (--i) {
		rval = x[i];
		ival = x[n-i-1];
		mag = bSi * sqrt(rval * rval + ival * ival);
		spectrum[i] = mag;
	}

	spectrum[0] = Math.abs(bSi * x[0]);

	return spectrum;
}


function reverseBinPermute (N, dest, source) {
	var halfSize    = N >>> 1,
		nm1         = N - 1,
		i = 1, r = 0, h;

	dest[0] = source[0];

	do {
		r += halfSize;
		dest[i] = source[r];
		dest[r] = source[i];

		i++;

		h = halfSize << 1;

		while (h = h >> 1, !((r ^= h) & h));

		if (r >= i) {
			dest[i]     = source[r];
			dest[r]     = source[i];

			dest[nm1-i] = source[nm1-r];
			dest[nm1-r] = source[nm1-i];
		}
		i++;
	} while (i < halfSize);

	dest[nm1] = source[nm1];
};
},{}],20:[function(require,module,exports){
'use strict';
module.exports = function (buf) {
	if (!buf || buf.length < 4) {
		return false;
	}

	return buf[0] === 102 &&
  buf[1] === 76 &&
  buf[2] === 97 &&
  buf[3] === 67; 
};

},{}],21:[function(require,module,exports){
'use strict';
module.exports = function (buf) {
	if (!buf || buf.length < 8) {
		return false;
	}

	return (buf[4] === 102 &&
		buf[5] === 116 &&
		buf[6] === 121 &&
		buf[7] === 112) || (
      buf[0] === 77 &&
      buf[1] === 52 &&
      buf[2] === 65 &&
      buf[3] === 32
    );
};

},{}],22:[function(require,module,exports){
'use strict';
module.exports = function (buf) {
	if (!buf || buf.length < 3) {
		return false;
	}

	return (buf[0] === 73 &&
		buf[1] === 68 &&
		buf[2] === 51) || ( 
      buf[0] === 255 &&
      buf[1] === 251
    );
  
};

},{}],23:[function(require,module,exports){
'use strict';
module.exports = function (buf) {
	if (!buf || buf.length < 4) {
		return false;
	}

	return  buf[0] === 79 &&
		buf[1] === 103 &&
		buf[2] === 103 &&
                buf[3] === 83;
};

},{}],24:[function(require,module,exports){
'use strict';
module.exports = function (buf) {
	if (!buf || buf.length < 12) {
		return false;
	}

	return buf[0] === 82 &&
		buf[1] === 73 &&
		buf[2] === 70 &&
		buf[3] === 70 &&
		buf[8] === 87 &&
		buf[9] === 65 &&
		buf[10] === 86 &&
		buf[11] === 69;
};

},{}],25:[function(require,module,exports){
"use strict";

function nmap(n, map) {
  var result = new Array(n);

  for (var i = 0; i < n; i++) {
    result[i] = map(i, i, result);
  }

  return result;
}

module.exports = nmap;

},{}],26:[function(require,module,exports){
'use strict'

function blackman (i,N) {
  var a0 = 0.42,
      a1 = 0.5,
      a2 = 0.08,
      f = 6.283185307179586*i/(N-1)

  return a0 - a1 * Math.cos(f) + a2*Math.cos(2*f)
}

module.exports = blackman

},{}],27:[function(require,module,exports){
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
},{}],28:[function(require,module,exports){
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

},{}],29:[function(require,module,exports){
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

    var _this = _possibleConstructorReturn(this, (AnalyserNode.__proto__ || Object.getPrototypeOf(AnalyserNode)).call(this, context));

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

},{"../impl":126,"./AudioNode":34}],30:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var impl = require("../impl");

var _require = require("../utils"),
    defineProp = _require.defineProp;

var AudioBuffer = function () {
  function AudioBuffer(opts) {
    _classCallCheck(this, AudioBuffer);

    defineProp(this, "_impl", new impl.AudioBuffer(opts));
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

},{"../impl":126,"../utils":135}],31:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var impl = require("../impl");
var AudioScheduledSourceNode = require("./AudioScheduledSourceNode");
var AudioParam = require("./AudioParam");

var AudioBufferSourceNode = function (_AudioScheduledSource) {
  _inherits(AudioBufferSourceNode, _AudioScheduledSource);

  function AudioBufferSourceNode(context, opts) {
    _classCallCheck(this, AudioBufferSourceNode);

    var _this = _possibleConstructorReturn(this, (AudioBufferSourceNode.__proto__ || Object.getPrototypeOf(AudioBufferSourceNode)).call(this, context));

    _this._impl = new impl.AudioBufferSourceNode(context._impl, opts);
    _this._impl.$playbackRate = new AudioParam(context, _this._impl.getPlaybackRate());
    _this._impl.$detune = new AudioParam(context, _this._impl.getDetune());
    _this._impl.$buffer = null;
    _this._impl.$onended = null;

    if (opts && opts.buffer) {
      _this.buffer = opts.buffer;
    }
    return _this;
  }

  _createClass(AudioBufferSourceNode, [{
    key: "start",
    value: function start(when, offset, duration) {
      this._impl.start(when, offset, duration);
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
  }]);

  return AudioBufferSourceNode;
}(AudioScheduledSourceNode);

module.exports = AudioBufferSourceNode;

},{"../impl":126,"./AudioParam":35,"./AudioScheduledSourceNode":36}],32:[function(require,module,exports){
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

    var _this = _possibleConstructorReturn(this, (AudioDestinationNode.__proto__ || Object.getPrototypeOf(AudioDestinationNode)).call(this, context));

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

},{"./AudioNode":34}],33:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require("../utils"),
    defineProp = _require.defineProp;

var AudioListener = function () {
  function AudioListener(context, impl) {
    _classCallCheck(this, AudioListener);

    defineProp(this, "_impl", impl);
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

},{"../utils":135}],34:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventTarget = require("./EventTarget");

var _require = require("../utils"),
    defineProp = _require.defineProp;

var AudioNode = function (_EventTarget) {
  _inherits(AudioNode, _EventTarget);

  function AudioNode(context) {
    _classCallCheck(this, AudioNode);

    var _this = _possibleConstructorReturn(this, (AudioNode.__proto__ || Object.getPrototypeOf(AudioNode)).call(this));

    defineProp(_this, "_context", context);
    defineProp(_this, "_impl", null);
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

},{"../utils":135,"./EventTarget":45}],35:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require("../utils"),
    defineProp = _require.defineProp;

var AudioParam = function () {
  function AudioParam(context, impl) {
    _classCallCheck(this, AudioParam);

    defineProp(this, "_context", context);
    defineProp(this, "_impl", impl);
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

},{"../utils":135}],36:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("./AudioNode");

var AudioScheduledSourceNode = function (_AudioNode) {
  _inherits(AudioScheduledSourceNode, _AudioNode);

  function AudioScheduledSourceNode() {
    _classCallCheck(this, AudioScheduledSourceNode);

    return _possibleConstructorReturn(this, (AudioScheduledSourceNode.__proto__ || Object.getPrototypeOf(AudioScheduledSourceNode)).apply(this, arguments));
  }

  _createClass(AudioScheduledSourceNode, [{
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
    key: "onended",
    get: function get() {
      return this._impl.$onended;
    },
    set: function set(callback) {
      this._impl.replaceEventListener("ended", this._impl.$onended, callback);
      this._impl.$onended = callback;
    }
  }]);

  return AudioScheduledSourceNode;
}(AudioNode);

module.exports = AudioScheduledSourceNode;

},{"./AudioNode":34}],37:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var impl = require("../impl");
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
var ConstantSourceNode = require("./ConstantSourceNode");
var ChannelSplitterNode = require("./ChannelSplitterNode");
var ChannelMergerNode = require("./ChannelMergerNode");
var DynamicsCompressorNode = require("./DynamicsCompressorNode");
var OscillatorNode = require("./OscillatorNode");
var PeriodicWave = require("./PeriodicWave");
var decoder = require("../decoder");

var _require = require("../utils"),
    defineProp = _require.defineProp;

var BaseAudioContext = function (_EventTarget) {
  _inherits(BaseAudioContext, _EventTarget);

  function BaseAudioContext(opts) {
    _classCallCheck(this, BaseAudioContext);

    var _this = _possibleConstructorReturn(this, (BaseAudioContext.__proto__ || Object.getPrototypeOf(BaseAudioContext)).call(this));

    defineProp(_this, "_impl", new impl.AudioContext(opts));

    _this._impl.$destination = new AudioDestinationNode(_this, _this._impl.getDestination());
    _this._impl.$listener = new AudioListener(_this, _this._impl.getListener());
    _this._impl.$onstatechange = null;
    return _this;
  }

  _createClass(BaseAudioContext, [{
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
      return new AudioBuffer({ numberOfChannels: numberOfChannels, length: length, sampleRate: sampleRate });
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
  }, {
    key: "createConstantSource",
    value: function createConstantSource() {
      return new ConstantSourceNode(this);
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

  return BaseAudioContext;
}(EventTarget);

module.exports = BaseAudioContext;

},{"../decoder":71,"../impl":126,"../utils":135,"./AnalyserNode":29,"./AudioBuffer":30,"./AudioBufferSourceNode":31,"./AudioDestinationNode":32,"./AudioListener":33,"./BiquadFilterNode":38,"./ChannelMergerNode":39,"./ChannelSplitterNode":40,"./ConstantSourceNode":41,"./ConvolverNode":42,"./DelayNode":43,"./DynamicsCompressorNode":44,"./EventTarget":45,"./GainNode":46,"./IIRFilterNode":47,"./OscillatorNode":48,"./PannerNode":49,"./PeriodicWave":50,"./ScriptProcessorNode":51,"./SpatialPannerNode":53,"./StereoPannerNode":54,"./WaveShaperNode":55}],38:[function(require,module,exports){
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

    var _this = _possibleConstructorReturn(this, (BiquadFilterNode.__proto__ || Object.getPrototypeOf(BiquadFilterNode)).call(this, context));

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

},{"../impl":126,"./AudioNode":34,"./AudioParam":35}],39:[function(require,module,exports){
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

    var _this = _possibleConstructorReturn(this, (ChannelMergerNode.__proto__ || Object.getPrototypeOf(ChannelMergerNode)).call(this, context));

    _this._impl = new impl.ChannelMergerNode(context._impl, opts);
    return _this;
  }

  return ChannelMergerNode;
}(AudioNode);

module.exports = ChannelMergerNode;

},{"../impl":126,"./AudioNode":34}],40:[function(require,module,exports){
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

    var _this = _possibleConstructorReturn(this, (ChannelSplitterNode.__proto__ || Object.getPrototypeOf(ChannelSplitterNode)).call(this, context));

    _this._impl = new impl.ChannelSplitterNode(context._impl, opts);
    return _this;
  }

  return ChannelSplitterNode;
}(AudioNode);

module.exports = ChannelSplitterNode;

},{"../impl":126,"./AudioNode":34}],41:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var impl = require("../impl");
var AudioScheduledSourceNode = require("./AudioScheduledSourceNode");
var AudioParam = require("./AudioParam");

var ConstantSourceNode = function (_AudioScheduledSource) {
  _inherits(ConstantSourceNode, _AudioScheduledSource);

  function ConstantSourceNode(context, opts) {
    _classCallCheck(this, ConstantSourceNode);

    var _this = _possibleConstructorReturn(this, (ConstantSourceNode.__proto__ || Object.getPrototypeOf(ConstantSourceNode)).call(this, context));

    _this._impl = new impl.ConstantSourceNode(context._impl, opts);
    _this._impl.$offset = new AudioParam(context, _this._impl.getOffset());
    _this._impl.$onended = null;
    return _this;
  }

  _createClass(ConstantSourceNode, [{
    key: "offset",
    get: function get() {
      return this._impl.$offset;
    }
  }]);

  return ConstantSourceNode;
}(AudioScheduledSourceNode);

module.exports = ConstantSourceNode;

},{"../impl":126,"./AudioParam":35,"./AudioScheduledSourceNode":36}],42:[function(require,module,exports){
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

    var _this = _possibleConstructorReturn(this, (ConvolverNode.__proto__ || Object.getPrototypeOf(ConvolverNode)).call(this, context));

    _this._impl = new impl.ConvolverNode(context._impl, opts);
    _this._impl.$buffer = null;

    if (opts && opts.buffer) {
      _this.buffer = opts.buffer;
    }
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

},{"../impl":126,"./AudioNode":34}],43:[function(require,module,exports){
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

    var _this = _possibleConstructorReturn(this, (DelayNode.__proto__ || Object.getPrototypeOf(DelayNode)).call(this, context));

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

},{"../impl":126,"./AudioNode":34,"./AudioParam":35}],44:[function(require,module,exports){
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

    var _this = _possibleConstructorReturn(this, (DynamicsCompressorNode.__proto__ || Object.getPrototypeOf(DynamicsCompressorNode)).call(this, context));

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

},{"../impl":126,"./AudioNode":34,"./AudioParam":35}],45:[function(require,module,exports){
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

},{}],46:[function(require,module,exports){
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

    var _this = _possibleConstructorReturn(this, (GainNode.__proto__ || Object.getPrototypeOf(GainNode)).call(this, context));

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

},{"../impl":126,"./AudioNode":34,"./AudioParam":35}],47:[function(require,module,exports){
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

    var _this = _possibleConstructorReturn(this, (IIRFilterNode.__proto__ || Object.getPrototypeOf(IIRFilterNode)).call(this, context));

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

},{"../impl":126,"./AudioNode":34}],48:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var impl = require("../impl");
var AudioScheduledSourceNode = require("./AudioScheduledSourceNode");
var AudioParam = require("./AudioParam");

var OscillatorNode = function (_AudioScheduledSource) {
  _inherits(OscillatorNode, _AudioScheduledSource);

  function OscillatorNode(context, opts) {
    _classCallCheck(this, OscillatorNode);

    var _this = _possibleConstructorReturn(this, (OscillatorNode.__proto__ || Object.getPrototypeOf(OscillatorNode)).call(this, context));

    _this._impl = new impl.OscillatorNode(context._impl, opts);
    _this._impl.$frequency = new AudioParam(context, _this._impl.getFrequency());
    _this._impl.$detune = new AudioParam(context, _this._impl.getDetune());
    _this._impl.$onended = null;

    if (opts && opts.periodicWave) {
      _this.setPeriodicWave(opts.periodicWave);
    }
    return _this;
  }

  _createClass(OscillatorNode, [{
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
  }]);

  return OscillatorNode;
}(AudioScheduledSourceNode);

module.exports = OscillatorNode;

},{"../impl":126,"./AudioParam":35,"./AudioScheduledSourceNode":36}],49:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var impl = require("../impl");
var AudioNode = require("./AudioNode");

var PannerNode = function (_AudioNode) {
  _inherits(PannerNode, _AudioNode);

  function PannerNode(context, opts) {
    _classCallCheck(this, PannerNode);

    var _this = _possibleConstructorReturn(this, (PannerNode.__proto__ || Object.getPrototypeOf(PannerNode)).call(this, context));

    _this._impl = new impl.PannerNode(context._impl, opts);
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

},{"../impl":126,"./AudioNode":34}],50:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var impl = require("../impl");

var _require = require("../utils"),
    defineProp = _require.defineProp;

var PeriodicWave = function PeriodicWave(context, opts) {
  _classCallCheck(this, PeriodicWave);

  defineProp(this, "_impl", new impl.PeriodicWave(context._impl, opts));
};

module.exports = PeriodicWave;

},{"../impl":126,"../utils":135}],51:[function(require,module,exports){
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

    var _this = _possibleConstructorReturn(this, (ScriptProcessorNode.__proto__ || Object.getPrototypeOf(ScriptProcessorNode)).call(this, context));

    _this._impl = new impl.ScriptProcessorNode(context._impl, opts);
    _this._impl.$onaudioprocess = null;
    _this._impl.setEventItem({
      type: "audioprocess",
      playbackTime: 0,
      inputBuffer: new AudioBuffer(),
      outputBuffer: new AudioBuffer()
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

},{"../impl":126,"./AudioBuffer":30,"./AudioNode":34}],52:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AudioParam = require("./AudioParam");

var _require = require("../utils"),
    defineProp = _require.defineProp;

var SpatialListener = function () {
  function SpatialListener(context, impl) {
    _classCallCheck(this, SpatialListener);

    defineProp(this, "_context", context);
    defineProp(this, "_impl", impl);

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

},{"../utils":135,"./AudioParam":35}],53:[function(require,module,exports){
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

  function SpatialPannerNode(context, opts) {
    _classCallCheck(this, SpatialPannerNode);

    var _this = _possibleConstructorReturn(this, (SpatialPannerNode.__proto__ || Object.getPrototypeOf(SpatialPannerNode)).call(this, context));

    _this._impl = new impl.SpatialPannerNode(context._impl, opts);
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

},{"../impl":126,"./AudioNode":34,"./AudioParam":35}],54:[function(require,module,exports){
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

  function StereoPannerNode(context, opts) {
    _classCallCheck(this, StereoPannerNode);

    var _this = _possibleConstructorReturn(this, (StereoPannerNode.__proto__ || Object.getPrototypeOf(StereoPannerNode)).call(this, context));

    _this._impl = new impl.StereoPannerNode(context._impl, opts);
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

},{"../impl":126,"./AudioNode":34,"./AudioParam":35}],55:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var impl = require("../impl");
var AudioNode = require("./AudioNode");

var WaveShaperNode = function (_AudioNode) {
  _inherits(WaveShaperNode, _AudioNode);

  function WaveShaperNode(context, opts) {
    _classCallCheck(this, WaveShaperNode);

    var _this = _possibleConstructorReturn(this, (WaveShaperNode.__proto__ || Object.getPrototypeOf(WaveShaperNode)).call(this, context));

    _this._impl = new impl.WaveShaperNode(context._impl, opts);
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

},{"../impl":126,"./AudioNode":34}],56:[function(require,module,exports){
"use strict";

module.exports = {
  AnalyserNode: require("./AnalyserNode"),
  AudioBuffer: require("./AudioBuffer"),
  AudioBufferSourceNode: require("./AudioBufferSourceNode"),
  AudioDestinationNode: require("./AudioDestinationNode"),
  AudioListener: require("./AudioListener"),
  AudioNode: require("./AudioNode"),
  AudioParam: require("./AudioParam"),
  AudioScheduledSourceNode: require("./AudioScheduledSourceNode"),
  BaseAudioContext: require("./BaseAudioContext"),
  BiquadFilterNode: require("./BiquadFilterNode"),
  ChannelMergerNode: require("./ChannelMergerNode"),
  ChannelSplitterNode: require("./ChannelSplitterNode"),
  ConstantSourceNode: require("./ConstantSourceNode"),
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

},{"./AnalyserNode":29,"./AudioBuffer":30,"./AudioBufferSourceNode":31,"./AudioDestinationNode":32,"./AudioListener":33,"./AudioNode":34,"./AudioParam":35,"./AudioScheduledSourceNode":36,"./BaseAudioContext":37,"./BiquadFilterNode":38,"./ChannelMergerNode":39,"./ChannelSplitterNode":40,"./ConstantSourceNode":41,"./ConvolverNode":42,"./DelayNode":43,"./DynamicsCompressorNode":44,"./EventTarget":45,"./GainNode":46,"./IIRFilterNode":47,"./OscillatorNode":48,"./PannerNode":49,"./PeriodicWave":50,"./ScriptProcessorNode":51,"./SpatialListener":52,"./SpatialPannerNode":53,"./StereoPannerNode":54,"./WaveShaperNode":55}],57:[function(require,module,exports){
"use strict";

module.exports = {
  sampleRate: 44100,
  numberOfChannels: 2,
  blockSize: 128,
  bitDepth: 16
};

},{}],58:[function(require,module,exports){
"use strict";

module.exports = {
  RUNNING: "running",
  SUSPENDED: "suspended",
  CLOSED: "closed"
};

},{}],59:[function(require,module,exports){
"use strict";

module.exports = {
  SET_VALUE_AT_TIME: "setValueAtTime",
  LINEAR_RAMP_TO_VALUE_AT_TIME: "linearRampToValueAtTime",
  EXPONENTIAL_RAMP_TO_VALUE_AT_TIME: "exponentialRampToValueAtTime",
  SET_TARGET_AT_TIME: "setTargetAtTime",
  SET_VALUE_CURVE_AT_TIME: "setValueCurveAtTime"
};

},{}],60:[function(require,module,exports){
"use strict";

module.exports = {
  CONTROL_RATE: "control",
  AUDIO_RATE: "audio"
};

},{}],61:[function(require,module,exports){
"use strict";

module.exports = {
  LOWPASS: "lowpass",
  HIGHPASS: "highpass",
  BANDPASS: "bandpass",
  LOWSHELF: "lowshelf",
  HIGHSHELF: "highshelf",
  PEAKING: "peaking",
  NOTCH: "notch",
  ALLPASS: "allpass"
};

},{}],62:[function(require,module,exports){
"use strict";

module.exports = {
  MAX: "max",
  CLAMPED_MAX: "clamped-max",
  EXPLICIT: "explicit"
};

},{}],63:[function(require,module,exports){
"use strict";

module.exports = {
  SPEAKERS: "speakers",
  DISCRETE: "discrete"
};

},{}],64:[function(require,module,exports){
"use strict";

module.exports = {
  SINE: "sine",
  SAWTOOTH: "sawtooth",
  TRIANGLE: "triangle",
  SQUARE: "square",
  CUSTOM: "custom"
};

},{}],65:[function(require,module,exports){
"use strict";

module.exports = {
  UNSCHEDULED: "unscheduled",
  SCHEDULED: "scheduled",
  PLAYING: "playing",
  FINISHED: "finished"
};

},{}],66:[function(require,module,exports){
"use strict";

module.exports = {
  MIN_SAMPLERATE: 3000,
  MAX_SAMPLERATE: 192000,
  MIN_NUMBER_OF_CHANNELS: 1,
  MAX_NUMBER_OF_CHANNELS: 32,
  MIN_BLOCK_SIZE: 8,
  MAX_BLOCK_SIZE: 1024
};

},{}],67:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var nmap = require("nmap");
var AudioDataUtils = require("../utils/AudioDataUtils");
var BaseAudioContext = require("../api/BaseAudioContext");
var AudioBuffer = require("../api/AudioBuffer");
var setImmediate = require("../utils/setImmediate");

var _require = require("../utils"),
    defineProp = _require.defineProp;

var _require2 = require("../utils"),
    toValidNumberOfChannels = _require2.toValidNumberOfChannels,
    toValidSampleRate = _require2.toValidSampleRate,
    toNumber = _require2.toNumber;

var _require3 = require("../constants/AudioContextState"),
    RUNNING = _require3.RUNNING,
    SUSPENDED = _require3.SUSPENDED,
    CLOSED = _require3.CLOSED;

var OfflineAudioContext = function (_BaseAudioContext) {
  _inherits(OfflineAudioContext, _BaseAudioContext);

  /**
   * @param {number} numberOfChannels
   * @param {number} length
   * @param {number} sampleRate
   */
  function OfflineAudioContext(numberOfChannels, length, sampleRate) {
    _classCallCheck(this, OfflineAudioContext);

    numberOfChannels = toValidNumberOfChannels(numberOfChannels);
    length = Math.max(0, length | 0);
    sampleRate = toValidSampleRate(sampleRate);

    var _this = _possibleConstructorReturn(this, (OfflineAudioContext.__proto__ || Object.getPrototypeOf(OfflineAudioContext)).call(this, { sampleRate: sampleRate, numberOfChannels: numberOfChannels }));

    _this._impl.$oncomplete = null;

    defineProp(_this, "_numberOfChannels", numberOfChannels);
    defineProp(_this, "_length", length);
    defineProp(_this, "_suspendedTime", Infinity);
    defineProp(_this, "_suspendPromise", null);
    defineProp(_this, "_suspendResolve", null);
    defineProp(_this, "_renderingPromise", null);
    defineProp(_this, "_renderingResolve", null);
    defineProp(_this, "_renderingIterations", 128);
    defineProp(_this, "_audioData", null);
    defineProp(_this, "_writeIndex", 0);
    return _this;
  }

  /**
   * @return {number}
   */


  _createClass(OfflineAudioContext, [{
    key: "resume",


    /**
     * @return {Promise<void>}
     */
    value: function resume() {
      /* istanbul ignore next */
      if (this._impl.state === CLOSED) {
        return Promise.reject(new TypeError("cannot startRendering when an OfflineAudioContext is closed"));
      }
      /* istanbul ignore next */
      if (this._renderingPromise === null) {
        return Promise.reject(new TypeError("cannot resume an offline context that has not started"));
      }
      /* istanbul ignore else */
      if (this._impl.state === SUSPENDED) {
        render.call(this, this._impl);
      }
      return Promise.resolve();
    }

    /**
     * @param {number} time
     * @return {Promise<void>}
     */

  }, {
    key: "suspend",
    value: function suspend(time) {
      var _this2 = this;

      /* istanbul ignore next */
      if (this._impl.state === CLOSED) {
        return Promise.reject(new TypeError("cannot startRendering when an OfflineAudioContext is closed"));
      }
      /* istanbul ignore next */
      if (this._suspendPromise !== null) {
        return Promise.reject(new TypeError("cannot schedule more than one suspend"));
      }

      time = Math.max(0, toNumber(time));

      this._suspendedTime = time;
      this._suspendPromise = new Promise(function (resolve) {
        _this2._suspendResolve = resolve;
      });

      return this._suspendPromise;
    }

    /**
     * @return {Promise<void>}
     */
    /* istanbul ignore next */

  }, {
    key: "close",
    value: function close() {
      return Promise.reject(new TypeError("cannot close an OfflineAudioContext"));
    }

    /**
     * @return {Promise<AudioBuffer>}
     */

  }, {
    key: "startRendering",
    value: function startRendering() {
      var _this3 = this;

      /* istanbul ignore next */
      if (this._impl.state === CLOSED) {
        return Promise.reject(new TypeError("cannot startRendering when an OfflineAudioContext is closed"));
      }
      /* istanbul ignore next */
      if (this._renderingPromise !== null) {
        return Promise.reject(new TypeError("cannot call startRendering more than once"));
      }

      this._renderingPromise = new Promise(function (resolve) {
        var numberOfChannels = _this3._numberOfChannels;
        var length = _this3._length;
        var sampleRate = _this3.sampleRate;
        var blockSize = _this3._impl.blockSize;

        _this3._audioData = createRenderingAudioData(numberOfChannels, length, sampleRate, blockSize);
        _this3._renderingResolve = resolve;

        render.call(_this3, _this3._impl);
      });

      return this._renderingPromise;
    }
  }, {
    key: "length",
    get: function get() {
      return this._length;
    }

    /**
     * @return {function}
     */

  }, {
    key: "oncomplete",
    get: function get() {
      return this._impl.$oncomplete;
    }

    /**
     * @param {function} callback
     */
    ,
    set: function set(callback) {
      this._impl.replaceEventListener("complete", this._impl.$oncomplete, callback);
      this._impl.$oncomplete = callback;
    }
  }]);

  return OfflineAudioContext;
}(BaseAudioContext);

function createRenderingAudioData(numberOfChannels, length, sampleRate, blockSize) {
  length = Math.ceil(length / blockSize) * blockSize;

  var channelData = nmap(numberOfChannels, function () {
    return new Float32Array(length);
  });

  return { numberOfChannels: numberOfChannels, length: length, sampleRate: sampleRate, channelData: channelData };
}

function suspendRendering() {
  this._suspendResolve();
  this._suspendedTime = Infinity;
  this._suspendPromise = this._suspendResolve = null;
  this._impl.changeState(SUSPENDED);
}

function doneRendering(audioData) {
  var length = this._length;

  audioData.channelData = audioData.channelData.map(function (channelData) {
    return channelData.subarray(0, length);
  });
  audioData.length = length;

  var audioBuffer = AudioDataUtils.toAudioBuffer(audioData, AudioBuffer);

  this._impl.changeState(CLOSED);
  this._impl.dispatchEvent({ type: "complete", renderedBuffer: audioBuffer });

  this._renderingResolve(audioBuffer);
  this._renderingResolve = null;
}

function render(impl) {
  var _this4 = this;

  var audioData = this._audioData;
  var audioDataLength = audioData.length;
  var channelData = audioData.channelData;
  var blockSize = impl.blockSize;
  var renderingIterations = this._renderingIterations;

  var writeIndex = this._writeIndex;

  var loop = function loop() {
    var remainIterations = (audioDataLength - writeIndex) / blockSize;
    var iterations = Math.min(renderingIterations, remainIterations) | 0;

    for (var i = 0; i < iterations; i++) {
      if (_this4._suspendedTime <= impl.currentTime) {
        _this4._writeIndex = writeIndex;
        return suspendRendering.call(_this4);
      } else {
        impl.process(channelData, writeIndex);
        writeIndex += blockSize;
      }
    }
    _this4._writeIndex = writeIndex;

    if (writeIndex === audioDataLength) {
      doneRendering.call(_this4, audioData);
    } else {
      setImmediate(loop);
    }
  };

  impl.changeState(RUNNING);

  setImmediate(loop);
}

module.exports = OfflineAudioContext;

},{"../api/AudioBuffer":30,"../api/BaseAudioContext":37,"../constants/AudioContextState":58,"../utils":135,"../utils/AudioDataUtils":127,"../utils/setImmediate":136,"nmap":25}],68:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var nmap = require("nmap");
var config = require("../config");
var BaseAudioContext = require("../api/BaseAudioContext");
var encoder = require("../encoder");

var _require = require("../utils"),
    defaults = _require.defaults,
    defineProp = _require.defineProp;

var _require2 = require("../utils"),
    toValidSampleRate = _require2.toValidSampleRate,
    toValidBlockSize = _require2.toValidBlockSize,
    toValidNumberOfChannels = _require2.toValidNumberOfChannels,
    toValidBitDepth = _require2.toValidBitDepth,
    toAudioTime = _require2.toAudioTime;

var _require3 = require("../constants/AudioContextState"),
    RUNNING = _require3.RUNNING,
    SUSPENDED = _require3.SUSPENDED;

var RenderingAudioContext = function (_BaseAudioContext) {
  _inherits(RenderingAudioContext, _BaseAudioContext);

  /**
   * @param {object}  opts
   * @param {number}  opts.sampleRate
   * @param {number}  opts.blockSize
   * @param {number}  opts.numberOfChannels
   * @param {number}  opts.bitDepth
   * @param {boolean} opts.floatingPoint
   */
  function RenderingAudioContext() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, RenderingAudioContext);

    var sampleRate = defaults(opts.sampleRate, config.sampleRate);
    var blockSize = defaults(opts.blockSize, config.blockSize);
    var numberOfChannels = defaults(opts.channels || opts.numberOfChannels, config.numberOfChannels);
    var bitDepth = defaults(opts.bitDepth, config.bitDepth);
    var floatingPoint = opts.float || opts.floatingPoint;

    sampleRate = toValidSampleRate(sampleRate);
    blockSize = toValidBlockSize(blockSize);
    numberOfChannels = toValidNumberOfChannels(numberOfChannels);
    bitDepth = toValidBitDepth(bitDepth);
    floatingPoint = !!floatingPoint;

    var _this = _possibleConstructorReturn(this, (RenderingAudioContext.__proto__ || Object.getPrototypeOf(RenderingAudioContext)).call(this, { sampleRate: sampleRate, blockSize: blockSize, numberOfChannels: numberOfChannels }));

    defineProp(_this, "_format", { sampleRate: sampleRate, channels: numberOfChannels, bitDepth: bitDepth, float: floatingPoint });
    defineProp(_this, "_rendered", []);
    return _this;
  }

  /**
   * @return {number}
   */


  _createClass(RenderingAudioContext, [{
    key: "processTo",


    /**
     * @param {number|string} time
     */
    value: function processTo(time) {
      time = toAudioTime(time);

      var duration = time - this.currentTime;

      /* istanbul ignore next */
      if (duration <= 0) {
        return;
      }

      var impl = this._impl;
      var blockSize = impl.blockSize;
      var iterations = Math.ceil(duration * this.sampleRate / blockSize);
      var bufferLength = blockSize * iterations;
      var numberOfChannels = this._format.channels;
      var buffers = nmap(numberOfChannels, function () {
        return new Float32Array(bufferLength);
      });

      impl.changeState(RUNNING);

      for (var i = 0; i < iterations; i++) {
        impl.process(buffers, i * blockSize);
      }

      this._rendered.push(buffers);

      impl.changeState(SUSPENDED);
    }

    /**
     * @return {AudioData}
     */

  }, {
    key: "exportAsAudioData",
    value: function exportAsAudioData() {
      var numberOfChannels = this._format.channels;
      var length = this._rendered.reduce(function (length, buffers) {
        return length + buffers[0].length;
      }, 0);
      var sampleRate = this._format.sampleRate;
      var channelData = nmap(numberOfChannels, function () {
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

    /**
     * @param {AudioData} audioData
     * @param {object}    opts
     */

  }, {
    key: "encodeAudioData",
    value: function encodeAudioData(audioData, opts) {
      opts = Object.assign({}, this._format, opts);
      return encoder.encode(audioData, opts);
    }
  }, {
    key: "numberOfChannels",
    get: function get() {
      return this._impl.numberOfChannels;
    }

    /**
     * @return {number}
     */

  }, {
    key: "blockSize",
    get: function get() {
      return this._impl.blockSize;
    }

    /**
     * @return {object}
     */

  }, {
    key: "format",
    get: function get() {
      return this._format;
    }
  }]);

  return RenderingAudioContext;
}(BaseAudioContext);

module.exports = RenderingAudioContext;

},{"../api/BaseAudioContext":37,"../config":57,"../constants/AudioContextState":58,"../encoder":72,"../utils":135,"nmap":25}],69:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var nmap = require("nmap");
var config = require("../config");
var BaseAudioContext = require("../api/BaseAudioContext");
var PCMEncoder = require("../utils/PCMEncoder");
var setImmediate = require("../utils/setImmediate");

var _require = require("../utils"),
    defaults = _require.defaults,
    defineProp = _require.defineProp;

var _require2 = require("../utils"),
    toValidSampleRate = _require2.toValidSampleRate,
    toValidBlockSize = _require2.toValidBlockSize,
    toValidNumberOfChannels = _require2.toValidNumberOfChannels,
    toValidBitDepth = _require2.toValidBitDepth;

var _require3 = require("../constants/AudioContextState"),
    RUNNING = _require3.RUNNING,
    SUSPENDED = _require3.SUSPENDED,
    CLOSED = _require3.CLOSED;

var noopWriter = { write: function write() {
    return true;
  } };

var StreamAudioContext = function (_BaseAudioContext) {
  _inherits(StreamAudioContext, _BaseAudioContext);

  /**
   * @param {object}  opts
   * @param {number}  opts.sampleRate
   * @param {number}  opts.blockSize
   * @param {number}  opts.numberOfChannels
   * @param {number}  opts.bitDepth
   * @param {boolean} opts.floatingPoint
   */
  function StreamAudioContext() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, StreamAudioContext);

    var sampleRate = defaults(opts.sampleRate, config.sampleRate);
    var blockSize = defaults(opts.blockSize, config.blockSize);
    var numberOfChannels = defaults(opts.channels || opts.numberOfChannels, config.numberOfChannels);
    var bitDepth = defaults(opts.bitDepth, config.bitDepth);
    var floatingPoint = opts.float || opts.floatingPoint;

    sampleRate = toValidSampleRate(sampleRate);
    blockSize = toValidBlockSize(blockSize);
    numberOfChannels = toValidNumberOfChannels(numberOfChannels);
    bitDepth = toValidBitDepth(bitDepth);
    floatingPoint = !!floatingPoint;

    var _this = _possibleConstructorReturn(this, (StreamAudioContext.__proto__ || Object.getPrototypeOf(StreamAudioContext)).call(this, { sampleRate: sampleRate, blockSize: blockSize, numberOfChannels: numberOfChannels }));

    var format = { sampleRate: sampleRate, channels: numberOfChannels, bitDepth: bitDepth, float: floatingPoint };
    var encoder = PCMEncoder.create(blockSize, format);

    defineProp(_this, "_numberOfChannels", numberOfChannels);
    defineProp(_this, "_encoder", encoder);
    defineProp(_this, "_blockSize", blockSize);
    defineProp(_this, "_stream", noopWriter);
    defineProp(_this, "_isPlaying", false);
    defineProp(_this, "_format", format);
    return _this;
  }

  /**
   * @return {number}
   */


  _createClass(StreamAudioContext, [{
    key: "pipe",


    /**
     * @param {Writable}
     * @return {Writable}
     */
    value: function pipe(stream) {
      this._stream = stream;
      return stream;
    }

    /**
     * @return {Promise<void>}
     */

  }, {
    key: "resume",
    value: function resume() {
      /* istanbul ignore else */
      if (this.state === SUSPENDED) {
        this._resume();
      }
      return _get(StreamAudioContext.prototype.__proto__ || Object.getPrototypeOf(StreamAudioContext.prototype), "resume", this).call(this);
    }

    /**
     * @return {Promise<void>}
     */

  }, {
    key: "suspend",
    value: function suspend() {
      /* istanbul ignore else */
      if (this.state === RUNNING) {
        this._suspend();
      }
      return _get(StreamAudioContext.prototype.__proto__ || Object.getPrototypeOf(StreamAudioContext.prototype), "suspend", this).call(this);
    }

    /**
     * @return {Promise<void>}
     */

  }, {
    key: "close",
    value: function close() {
      /* istanbul ignore else */
      if (this.state !== CLOSED) {
        this._close();
      }
      return _get(StreamAudioContext.prototype.__proto__ || Object.getPrototypeOf(StreamAudioContext.prototype), "close", this).call(this);
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
      var channelData = nmap(this._numberOfChannels, function () {
        return new Float32Array(_this2._blockSize);
      });

      var renderingProcess = function renderingProcess() {
        if (_this2._isPlaying) {
          var contextElapsed = impl.currentTime - contextStartTime;
          var timerElapsed = (Date.now() - timerStartTime) / 1000;

          if (contextElapsed < timerElapsed + aheadTime) {
            impl.process(channelData, 0);

            var buffer = encoder.encode(channelData);

            if (!_this2._stream.write(buffer)) {
              _this2._stream.once("drain", renderingProcess);
              return;
            }
          }

          setTimeout(renderingProcess, 0);
        }
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
      /* istanbul ignore else */
      if (this._stream !== null) {
        this._stream = null;
      }
    }
  }, {
    key: "numberOfChannels",
    get: function get() {
      return this._impl.numberOfChannels;
    }

    /**
     * @return {number}
     */

  }, {
    key: "blockSize",
    get: function get() {
      return this._impl.blockSize;
    }

    /**
     * @return {object}
     */

  }, {
    key: "format",
    get: function get() {
      return this._format;
    }
  }]);

  return StreamAudioContext;
}(BaseAudioContext);

module.exports = StreamAudioContext;

},{"../api/BaseAudioContext":37,"../config":57,"../constants/AudioContextState":58,"../utils":135,"../utils/PCMEncoder":134,"../utils/setImmediate":136,"nmap":25}],70:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var config = require("../config");
var BaseAudioContext = require("../api/BaseAudioContext");

var _require = require("../utils"),
    defaults = _require.defaults,
    defineProp = _require.defineProp;

var _require2 = require("../utils"),
    toValidBlockSize = _require2.toValidBlockSize,
    toValidNumberOfChannels = _require2.toValidNumberOfChannels,
    toPowerOfTwo = _require2.toPowerOfTwo;

var DSPAlgorithm = [];

var WebAudioContext = function (_BaseAudioContext) {
  _inherits(WebAudioContext, _BaseAudioContext);

  /**
   * @param {object}  opts
   * @param {AudioContext} opts.context
   * @param {AudioNode}    opts.destination
   * @param {number}       opts.blockSize
   * @param {number}       opts.numberOfChannels
   * @param {number}       opts.bufferSize
   */
  function WebAudioContext() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, WebAudioContext);

    var destination = opts.destination || opts.context.destination;
    var context = destination.context;
    var sampleRate = context.sampleRate;
    var blockSize = defaults(opts.blockSize, config.blockSize);
    var numberOfChannels = defaults(opts.numberOfChannels, config.numberOfChannels);
    var bufferSize = defaults(opts.bufferSize, 1024);

    blockSize = toValidBlockSize(blockSize);
    numberOfChannels = toValidNumberOfChannels(numberOfChannels);
    bufferSize = toPowerOfTwo(bufferSize);
    bufferSize = Math.max(256, Math.min(bufferSize, 16384));

    var _this = _possibleConstructorReturn(this, (WebAudioContext.__proto__ || Object.getPrototypeOf(WebAudioContext)).call(this, { sampleRate: sampleRate, blockSize: blockSize, numberOfChannels: numberOfChannels }));

    var processor = context.createScriptProcessor(bufferSize, 0, numberOfChannels);
    var dspProcess = DSPAlgorithm[numberOfChannels] || DSPAlgorithm[0];

    processor.onaudioprocess = dspProcess(_this._impl, numberOfChannels, bufferSize);

    defineProp(_this, "_originalContext", context);
    defineProp(_this, "_destination", destination);
    defineProp(_this, "_processor", processor);
    return _this;
  }

  _createClass(WebAudioContext, [{
    key: "resume",


    /**
     * @return {Promise<void>}
     */
    value: function resume() {
      if (this._processor) {
        this._processor.connect(this._destination);
      }
      return _get(WebAudioContext.prototype.__proto__ || Object.getPrototypeOf(WebAudioContext.prototype), "resume", this).call(this);
    }

    /**
     * @return {Promise<void>}
     */

  }, {
    key: "suspend",
    value: function suspend() {
      if (this._processor) {
        this._processor.disconnect();
      }
      return _get(WebAudioContext.prototype.__proto__ || Object.getPrototypeOf(WebAudioContext.prototype), "suspend", this).call(this);
    }

    /**
     * @return {Promise<void>}
     */

  }, {
    key: "close",
    value: function close() {
      if (this._processor) {
        this._processor.disconnect();
        this._processor = null;
      }
      return _get(WebAudioContext.prototype.__proto__ || Object.getPrototypeOf(WebAudioContext.prototype), "close", this).call(this);
    }
  }, {
    key: "originalContext",
    get: function get() {
      return this._originalContext;
    }
  }]);

  return WebAudioContext;
}(BaseAudioContext);

DSPAlgorithm[0] = function (impl, numberOfChannels, bufferSize) {
  var blockSize = impl.blockSize;
  var iterations = bufferSize / blockSize;
  var channelData = new Array(numberOfChannels);

  return function (e) {
    var outputBuffer = e.outputBuffer;

    for (var ch = 0; ch < numberOfChannels; ch++) {
      channelData[ch] = outputBuffer.getChannelData(ch);
    }

    for (var i = 0; i < iterations; i++) {
      impl.process(channelData, i * blockSize);
    }
  };
};

DSPAlgorithm[1] = function (impl, numberOfChannels, bufferSize) {
  var blockSize = impl.blockSize;
  var iterations = bufferSize / blockSize;

  return function (e) {
    var channelData = [e.outputBuffer.getChannelData(0)];

    for (var i = 0; i < iterations; i++) {
      impl.process(channelData, i * blockSize);
    }
  };
};

DSPAlgorithm[2] = function (impl, numberOfChannels, bufferSize) {
  var blockSize = impl.blockSize;
  var iterations = bufferSize / blockSize;

  return function (e) {
    var outputBuffer = e.outputBuffer;
    var channelData = [outputBuffer.getChannelData(0), outputBuffer.getChannelData(1)];

    for (var i = 0; i < iterations; i++) {
      impl.process(channelData, i * blockSize);
    }
  };
};

module.exports = WebAudioContext;

},{"../api/BaseAudioContext":37,"../config":57,"../utils":135}],71:[function(require,module,exports){
"use strict";

var audioType = require("audio-type");
var WavDecoder = require("wav-decoder");
var DecoderUtils = require("./utils/DecoderUtils");
var AudioDataUtils = require("./utils/AudioDataUtils");
var AudioBuffer = require("./api/AudioBuffer");

var decoders = {};

/**
 * @param {string}    type
 * @return {function}
 */
function get(type) {
  return decoders[type] || null;
}

/**
 * @param {string}   type
 * @param {function} fn
 */
function set(type, fn) {
  /* istanbul ignore else */
  if (typeof fn === "function") {
    decoders[type] = fn;
  }
}

/**
 * @param {ArrayBuffer} AudioBuffer
 * @param {object}      opts
 * @return {Promise<AudioData>}
 */
function decode(audioData, opts) {
  var type = toAudioType(audioData);
  var decodeFn = decoders[type];

  if (typeof decodeFn !== "function") {
    return Promise.reject(new TypeError("Decoder does not support the audio format: " + (type || "unknown")));
  }

  return DecoderUtils.decode(decodeFn, audioData, opts).then(function (audioData) {
    return AudioDataUtils.toAudioBuffer(audioData, AudioBuffer);
  });
}

function toAudioType(audioData) {
  if (audioData instanceof ArrayBuffer) {
    audioData = new Uint8Array(audioData, 0, 16);
  }
  return audioType(audioData) || "";
}

set("wav", WavDecoder.decode);

module.exports = { get: get, set: set, decode: decode };

},{"./api/AudioBuffer":30,"./utils/AudioDataUtils":127,"./utils/DecoderUtils":129,"audio-type":1,"wav-decoder":27}],72:[function(require,module,exports){
"use strict";

var WavEncoder = require("wav-encoder");
var EncoderUtils = require("./utils/EncoderUtils");

var encoders = {};

/**
 * @param {string}    type
 * @return {function}
 */
function get(type) {
  return encoders[type] || null;
}

/**
 * @param {string}   type
 * @param {function} fn
 */
function set(type, fn) {
  /* istanbul ignore else */
  if (typeof fn === "function") {
    encoders[type] = fn;
  }
}

/**
 * @param {AudioData} audioData
 * @param {object}    opts
 * @return {Promise<ArrayBuffer>}
 */
function encode(audioData) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var type = opts.type || "wav";
  var encodeFn = encoders[type];

  if (typeof encodeFn !== "function") {
    return Promise.reject(new TypeError("Encoder does not support the audio format: " + type));
  }

  return EncoderUtils.encode(encodeFn, audioData, opts);
}

set("wav", WavEncoder.encode);

module.exports = { get: get, set: set, encode: encode };

},{"./utils/EncoderUtils":130,"wav-encoder":28}],73:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("./AudioNode");
var AnalyserNodeDSP = require("./dsp/AnalyserNode");

var _require = require("../utils"),
    defaults = _require.defaults,
    clamp = _require.clamp;

var _require2 = require("../utils"),
    toNumber = _require2.toNumber,
    toPowerOfTwo = _require2.toPowerOfTwo;

var _require3 = require("../constants/ChannelCountMode"),
    MAX = _require3.MAX;

var DEFAULT_FFT_SIZE = 2048;
var DEFAULT_MIN_DECIBELS = -100;
var DEFAULT_MAX_DECIBELS = -30;
var DEFAULT_SMOOTHING_TIME_CONSTANT = 0.8;
var MIN_FFT_SIZE = 32;
var MAX_FFT_SIZE = 32768;

var AnalyserNode = function (_AudioNode) {
  _inherits(AnalyserNode, _AudioNode);

  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.fftSize
   * @param {number}       opts.minDecibels
   * @param {number}       opts.maxDecibels
   * @param {number}       opts.smoothingTimeConstant
   */
  function AnalyserNode(context) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, AnalyserNode);

    var fftSize = defaults(opts.fftSize, DEFAULT_FFT_SIZE);
    var minDecibels = defaults(opts.minDecibels, DEFAULT_MIN_DECIBELS);
    var maxDecibels = defaults(opts.maxDecibels, DEFAULT_MAX_DECIBELS);
    var smoothingTimeConstant = defaults(opts.smoothingTimeConstant, DEFAULT_SMOOTHING_TIME_CONSTANT);

    var _this = _possibleConstructorReturn(this, (AnalyserNode.__proto__ || Object.getPrototypeOf(AnalyserNode)).call(this, context, opts, {
      inputs: [1],
      outputs: [1],
      channelCount: 1,
      channelCountMode: MAX
    }));

    _this._fftSize = fftSize;
    _this._minDecibels = minDecibels;
    _this._maxDecibels = maxDecibels;
    _this._smoothingTimeConstant = smoothingTimeConstant;

    _this.dspInit(context.sampleRate);
    _this.setFftSize(fftSize);
    return _this;
  }

  /**
   * @return {number}
   */


  _createClass(AnalyserNode, [{
    key: "getFftSize",
    value: function getFftSize() {
      return this._fftSize;
    }

    /**
     * @param {number} value
     */

  }, {
    key: "setFftSize",
    value: function setFftSize(value) {
      value = clamp(value | 0, MIN_FFT_SIZE, MAX_FFT_SIZE);
      value = toPowerOfTwo(value, Math.ceil);
      this._fftSize = value;
      this.dspUpdateSizes(this._fftSize);
    }

    /**
     * @return {number}
     */

  }, {
    key: "getFrequencyBinCount",
    value: function getFrequencyBinCount() {
      return this._fftSize / 2;
    }

    /**
     * @return {number}
     */

  }, {
    key: "getMinDecibels",
    value: function getMinDecibels() {
      return this._minDecibels;
    }

    /**
     * @param {number} value
     */

  }, {
    key: "setMinDecibels",
    value: function setMinDecibels(value) {
      value = toNumber(value);
      /* istanbul ignore else */
      if (-Infinity < value && value < this._maxDecibels) {
        this._minDecibels = value;
      }
    }

    /**
     * @return {number}
     */

  }, {
    key: "getMaxDecibels",
    value: function getMaxDecibels() {
      return this._maxDecibels;
    }

    /**
     * @param {number} value
     */

  }, {
    key: "setMaxDecibels",
    value: function setMaxDecibels(value) {
      value = toNumber(value);
      /* istanbul ignore else */
      if (this._minDecibels < value && value < Infinity) {
        this._maxDecibels = value;
      }
    }

    /**
     * @return {number}
     */

  }, {
    key: "getSmoothingTimeConstant",
    value: function getSmoothingTimeConstant() {
      return this._smoothingTimeConstant;
    }

    /**
     * @param {number}
     */

  }, {
    key: "setSmoothingTimeConstant",
    value: function setSmoothingTimeConstant(value) {
      value = clamp(toNumber(value), 0, 1);
      this._smoothingTimeConstant = value;
    }

    /**
     * @param {Float32Array} array
     */

  }, {
    key: "getFloatFrequencyData",
    value: function getFloatFrequencyData(array) {
      this.dspGetFloatFrequencyData(array);
    }

    /**
     * @param {Uint8Array} array
     */

  }, {
    key: "getByteFrequencyData",
    value: function getByteFrequencyData(array) {
      this.dspGetByteFrequencyData(array);
    }

    /**
     * @param {Float32Array} array
     */

  }, {
    key: "getFloatTimeDomainData",
    value: function getFloatTimeDomainData(array) {
      this.dspGetFloatTimeDomainData(array);
    }

    /**
     * @param {Uint8Array} array
     */

  }, {
    key: "getByteTimeDomainData",
    value: function getByteTimeDomainData(array) {
      this.dspGetByteTimeDomainData(array);
    }

    /**
     * @param {number} numberOfChannels
     */

  }, {
    key: "channelDidUpdate",
    value: function channelDidUpdate(numberOfChannels) {
      this.outputs[0].setNumberOfChannels(numberOfChannels);
    }
  }]);

  return AnalyserNode;
}(AudioNode);

Object.assign(AnalyserNode.prototype, AnalyserNodeDSP);

module.exports = AnalyserNode;

},{"../constants/ChannelCountMode":62,"../utils":135,"./AudioNode":79,"./dsp/AnalyserNode":105}],74:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AudioData = require("./core/AudioData");

var _require = require("../utils"),
    toValidNumberOfChannels = _require.toValidNumberOfChannels,
    toNumber = _require.toNumber,
    toValidSampleRate = _require.toValidSampleRate;

/**
 * @prop {AudioData} audioData
 */


var AudioBuffer = function () {
  /**
   * @param {object}       opts
   * @param {number}       opts.numberOfChannels
   * @param {number}       opts.length
   * @param {number}       opts.sampleRate
   */
  function AudioBuffer() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, AudioBuffer);

    var numberOfChannels = opts.numberOfChannels;
    var length = opts.length;
    var sampleRate = opts.sampleRate;

    numberOfChannels = toValidNumberOfChannels(numberOfChannels);
    length = Math.max(0, toNumber(length));
    sampleRate = toValidSampleRate(sampleRate);

    this.audioData = new AudioData(numberOfChannels, length, sampleRate);
  }

  /**
   * @return {number}
   */


  _createClass(AudioBuffer, [{
    key: "getSampleRate",
    value: function getSampleRate() {
      return this.audioData.sampleRate;
    }

    /**
     * @return {number}
     */

  }, {
    key: "getLength",
    value: function getLength() {
      return this.audioData.length;
    }

    /**
     * @return {number}
     */

  }, {
    key: "getDuration",
    value: function getDuration() {
      return this.audioData.length / this.audioData.sampleRate;
    }

    /**
     * @return {number}
     */

  }, {
    key: "getNumberOfChannels",
    value: function getNumberOfChannels() {
      return this.audioData.numberOfChannels;
    }

    /**
     * @return {Float32Array}
     */

  }, {
    key: "getChannelData",
    value: function getChannelData(channel) {
      return this.audioData.channelData[channel | 0];
    }

    /**
     * @param {Float32Array} destination
     * @param {number}       channelNumber
     * @param {number}       startInChannel
     */

  }, {
    key: "copyFromChannel",
    value: function copyFromChannel(destination, channelNumber, startInChannel) {
      var source = this.audioData.channelData[channelNumber | 0];

      startInChannel = startInChannel | 0;

      destination.set(source.subarray(startInChannel, startInChannel + destination.length));
    }

    /**
     * @param {Float32Array} source
     * @param {number}       channelNumber
     * @param {number}       startInChannel
     */

  }, {
    key: "copyToChannel",
    value: function copyToChannel(source, channelNumber, startInChannel) {
      var destination = this.audioData.channelData[channelNumber | 0];

      startInChannel = startInChannel | 0;

      destination.set(source, startInChannel);
    }
  }]);

  return AudioBuffer;
}();

module.exports = AudioBuffer;

},{"../utils":135,"./core/AudioData":102}],75:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioScheduledSourceNode = require("./AudioScheduledSourceNode");
var AudioBuffer = require("./AudioBuffer");
var AudioBufferSourceNodeDSP = require("./dsp/AudioBufferSourceNode");

var _require = require("../utils"),
    defaults = _require.defaults;

var _require2 = require("../utils"),
    toImpl = _require2.toImpl,
    toNumber = _require2.toNumber;

var _require3 = require("../constants/AudioParamRate"),
    CONTROL_RATE = _require3.CONTROL_RATE;

var _require4 = require("../constants/PlaybackState"),
    FINISHED = _require4.FINISHED;

var DEFAULT_PLAYBACK_RATE = 1;
var DEFAULT_DETUNE = 0;
var DEFAULT_LOOP = false;
var DEFAULT_LOOP_START = 0;
var DEFAULT_LOOP_END = 0;

var AudioBufferSourceNode = function (_AudioScheduledSource) {
  _inherits(AudioBufferSourceNode, _AudioScheduledSource);

  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.playbackRate
   * @param {number}       opts.detune
   * @param {boolean}      opts.loop
   * @param {number}       opts.loopStart
   * @param {number}       opts.loopEnd
   */
  function AudioBufferSourceNode(context) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, AudioBufferSourceNode);

    var playbackRate = defaults(opts.playbackRate, DEFAULT_PLAYBACK_RATE);
    var detune = defaults(opts.detune, DEFAULT_DETUNE);
    var loop = defaults(opts.loop, DEFAULT_LOOP);
    var loopStart = defaults(opts.loopStart, DEFAULT_LOOP_START);
    var loopEnd = defaults(opts.loopEnd, DEFAULT_LOOP_END);

    var _this = _possibleConstructorReturn(this, (AudioBufferSourceNode.__proto__ || Object.getPrototypeOf(AudioBufferSourceNode)).call(this, context, opts));

    _this._buffer = null;
    _this._audioData = null;
    _this._playbackRate = _this.addParam(CONTROL_RATE, playbackRate);
    _this._detune = _this.addParam(CONTROL_RATE, detune);
    _this._loop = !!loop;
    _this._loopStart = loopStart;
    _this._loopEnd = loopEnd;
    _this._offset = 0;
    _this._duration = Infinity;
    _this._done = false;
    return _this;
  }

  /**
   * @return {AudioBuffer}
   */


  _createClass(AudioBufferSourceNode, [{
    key: "getBuffer",
    value: function getBuffer() {
      return this._buffer;
    }

    /**
     * @param {AudioBuffer} value
     */

  }, {
    key: "setBuffer",
    value: function setBuffer(value) {
      value = toImpl(value);

      /* istanbul ignore else */
      if (value instanceof AudioBuffer) {
        this._buffer = value;
        this._audioData = this._buffer.audioData;
        this.outputs[0].setNumberOfChannels(this._audioData.numberOfChannels);
      }
    }

    /**
     * @return {number}
     */

  }, {
    key: "getStartOffset",
    value: function getStartOffset() {
      return this._offset;
    }

    /**
     * @return {number}
     */

  }, {
    key: "getStartDuration",
    value: function getStartDuration() {
      if (this._duration !== Infinity) {
        return this._duration;
      }
    }

    /**
     * @return {string}
     */

  }, {
    key: "getPlaybackState",
    value: function getPlaybackState() {
      if (this._done) {
        return FINISHED;
      }
      return _get(AudioBufferSourceNode.prototype.__proto__ || Object.getPrototypeOf(AudioBufferSourceNode.prototype), "getPlaybackState", this).call(this);
    }

    /**
     * @return {AudioParam}
     */

  }, {
    key: "getPlaybackRate",
    value: function getPlaybackRate() {
      return this._playbackRate;
    }

    /**
     * @return {AudioParam}
     */

  }, {
    key: "getDetune",
    value: function getDetune() {
      return this._detune;
    }

    /**
     * @return {boolean}
     */

  }, {
    key: "getLoop",
    value: function getLoop() {
      return this._loop;
    }

    /**
     * @param {boolean}
     */

  }, {
    key: "setLoop",
    value: function setLoop(value) {
      this._loop = !!value;
    }

    /**
     * @return {number}
     */

  }, {
    key: "getLoopStart",
    value: function getLoopStart() {
      return this._loopStart;
    }

    /**
     * @param {number} value
     */

  }, {
    key: "setLoopStart",
    value: function setLoopStart(value) {
      value = Math.max(0, toNumber(value));
      this._loopStart = value;
    }

    /**
     * @return {number}
     */

  }, {
    key: "getLoopEnd",
    value: function getLoopEnd() {
      return this._loopEnd;
    }

    /**
     * @param {number} value
     */

  }, {
    key: "setLoopEnd",
    value: function setLoopEnd(value) {
      value = Math.max(0, toNumber(value));
      this._loopEnd = value;
    }

    /**
     * @param {number} when
     * @param {number} offset
     * @param {number} duration
     */

  }, {
    key: "start",
    value: function start(when, offset, duration) {
      var _this2 = this;

      /* istanbul ignore next */
      if (this._startTime !== Infinity) {
        return;
      }

      offset = defaults(offset, 0);
      duration = defaults(duration, Infinity);

      when = Math.max(this.context.currentTime, toNumber(when));
      offset = Math.max(0, offset);
      duration = Math.max(0, toNumber(duration));

      this._startTime = when;
      this._startFrame = Math.round(when * this.sampleRate);
      this._offset = offset;

      if (duration !== Infinity) {
        this._duration = duration;
        this._stopFrame = Math.round((this._startTime + duration) * this.sampleRate);
      }

      this.context.sched(when, function () {
        _this2.dspStart();
        _this2.outputs[0].enable();
      });
    }
  }]);

  return AudioBufferSourceNode;
}(AudioScheduledSourceNode);

Object.assign(AudioBufferSourceNode.prototype, AudioBufferSourceNodeDSP);

module.exports = AudioBufferSourceNode;

},{"../constants/AudioParamRate":60,"../constants/PlaybackState":65,"../utils":135,"./AudioBuffer":74,"./AudioScheduledSourceNode":81,"./dsp/AudioBufferSourceNode":106}],76:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var config = require("../config");
var EventTarget = require("./EventTarget");
var AudioDestinationNode = require("./AudioDestinationNode");
var AudioListener = require("./AudioListener");

var _require = require("../utils"),
    defaults = _require.defaults,
    fillRange = _require.fillRange;

var _require2 = require("../utils"),
    toValidSampleRate = _require2.toValidSampleRate,
    toValidBlockSize = _require2.toValidBlockSize,
    toValidNumberOfChannels = _require2.toValidNumberOfChannels;

var _require3 = require("../constants/AudioContextState"),
    RUNNING = _require3.RUNNING,
    SUSPENDED = _require3.SUSPENDED,
    CLOSED = _require3.CLOSED;

/**
 * @prop {number} sampleRate
 * @prop {number} blockSize
 * @prop {number} numberOfChannels
 * @prop {number} currentTime
 * @prop {number} currentSampleFrame
 */


var AudioContext = function (_EventTarget) {
  _inherits(AudioContext, _EventTarget);

  /**
   * @param {object} opts
   * @param {number} opts.sampleRate
   * @param {number} opts.blockSize
   * @param {number} opts.numberOfChannels
   */
  function AudioContext() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, AudioContext);

    var _this = _possibleConstructorReturn(this, (AudioContext.__proto__ || Object.getPrototypeOf(AudioContext)).call(this));

    var sampleRate = defaults(opts.sampleRate, config.sampleRate);
    var blockSize = defaults(opts.blockSize, config.blockSize);
    var numberOfChannels = defaults(opts.channels || opts.numberOfChannels, config.numberOfChannels);

    sampleRate = toValidSampleRate(sampleRate);
    blockSize = toValidBlockSize(blockSize);
    numberOfChannels = toValidNumberOfChannels(numberOfChannels);

    _this.sampleRate = sampleRate | 0;
    _this.blockSize = blockSize | 0;
    _this.numberOfChannels = numberOfChannels | 0;
    _this.currentTime = 0;
    _this.currentSampleFrame = 0;
    _this.state = SUSPENDED;
    _this._destination = new AudioDestinationNode(_this, { numberOfChannels: numberOfChannels });
    _this._listener = new AudioListener(_this);
    _this._sched = {};
    _this._callbacksForPostProcess = null;
    _this._currentFrameIndex = 0;
    return _this;
  }

  /**
   * @return {AudioDestinationNode}
   */


  _createClass(AudioContext, [{
    key: "getDestination",
    value: function getDestination() {
      return this._destination;
    }

    /**
     * @return {number}
     */

  }, {
    key: "getSampleRate",
    value: function getSampleRate() {
      return this.sampleRate;
    }

    /**
     * @return {number}
     */

  }, {
    key: "getCurrentTime",
    value: function getCurrentTime() {
      return this.currentTime;
    }

    /**
     * @return {AudioListener}
     */

  }, {
    key: "getListener",
    value: function getListener() {
      return this._listener;
    }

    /**
     * @return {string}
     */

  }, {
    key: "getState",
    value: function getState() {
      return this.state;
    }

    /**
     * @return {Promise<void>}
     */

  }, {
    key: "suspend",
    value: function suspend() {
      if (this.state === RUNNING) {
        return this.changeState(SUSPENDED);
      }
      return this.notChangeState();
    }

    /**
     * @return {Promise<void>}
     */

  }, {
    key: "resume",
    value: function resume() {
      if (this.state === SUSPENDED) {
        return this.changeState(RUNNING);
      }
      return this.notChangeState();
    }

    /**
     * @return {Promise<void>}
     */

  }, {
    key: "close",
    value: function close() {
      if (this.state !== CLOSED) {
        return this.changeState(CLOSED);
      }
      return this.notChangeState();
    }

    /**
     * @param {string} state
     * @return {Promise<void>}
     */

  }, {
    key: "changeState",
    value: function changeState(state) {
      var _this2 = this;

      this.state = state;
      return new Promise(function (resolve) {
        _this2.dispatchEvent({ type: "statechange" });
        resolve();
      });
    }

    /**
     * @return {Promise<void>}
     */

  }, {
    key: "notChangeState",
    value: function notChangeState() {
      return Promise.resolve();
    }

    /**
     * @param {number}   time
     * @param {function} task
     */

  }, {
    key: "sched",
    value: function sched(time, task) {
      var schedSampleFrame = Math.floor(time * this.sampleRate / this.blockSize) * this.blockSize | 0;

      if (!this._sched[schedSampleFrame]) {
        this._sched[schedSampleFrame] = [task];
      } else {
        this._sched[schedSampleFrame].push(task);
      }
    }

    /**
     * @param {function} task
     */

  }, {
    key: "addPostProcess",
    value: function addPostProcess(task) {
      if (this._callbacksForPostProcess === null) {
        this._callbacksForPostProcess = [task];
      } else {
        this._callbacksForPostProcess.push(task);
      }
    }

    /**
     * @param {Float32Array[]} channelData
     * @param {number}         offset
     */

  }, {
    key: "process",
    value: function process(channelData, offset) {
      var destination = this._destination;

      if (this.state !== RUNNING) {
        var numberOfChannels = channelData.length;
        var offsetEnd = offset + this.blockSize;

        for (var ch = 0; ch < numberOfChannels; ch++) {
          fillRange(channelData[ch], offset, offsetEnd);
        }
      } else {
        var sched = this._sched;
        var currentSampleFrame = this.currentSampleFrame | 0;

        if (sched[currentSampleFrame]) {
          var tasks = sched[currentSampleFrame];

          for (var i = 0, imax = tasks.length; i < imax; i++) {
            tasks[i]();
          }

          delete sched[currentSampleFrame];
        }

        destination.process(channelData, offset);

        if (this._callbacksForPostProcess !== null) {
          var _tasks = this._callbacksForPostProcess;

          for (var _i = 0, _imax = _tasks.length; _i < _imax; _i++) {
            _tasks[_i]();
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

  }, {
    key: "reset",
    value: function reset() {
      this.currentTime = 0;
      this.currentSampleFrame = 0;
      this.state = SUSPENDED;
      this._destination = new AudioDestinationNode(this, { numberOfChannels: this.numberOfChannels });
      this._listener = new AudioListener(this);
      this._sched = [];
      this._callbacksForPostProcess = null;
    }
  }]);

  return AudioContext;
}(EventTarget);

module.exports = AudioContext;

},{"../config":57,"../constants/AudioContextState":58,"../utils":135,"./AudioDestinationNode":77,"./AudioListener":78,"./EventTarget":91}],77:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("./AudioNode");

var _require = require("../utils"),
    toValidNumberOfChannels = _require.toValidNumberOfChannels;

var _require2 = require("../constants/ChannelCountMode"),
    EXPLICIT = _require2.EXPLICIT;

/**
 * @prop {AudioNodeOutput} output
 * @prop {AudioBus}        outputBus
 */


var AudioDestinationNode = function (_AudioNode) {
  _inherits(AudioDestinationNode, _AudioNode);

  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.numberOfChannels
   */
  function AudioDestinationNode(context) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, AudioDestinationNode);

    var numberOfChannels = opts.numberOfChannels;

    numberOfChannels = toValidNumberOfChannels(numberOfChannels);

    var _this = _possibleConstructorReturn(this, (AudioDestinationNode.__proto__ || Object.getPrototypeOf(AudioDestinationNode)).call(this, context, opts, {
      inputs: [numberOfChannels],
      outputs: [],
      channelCount: numberOfChannels,
      channelCountMode: EXPLICIT,
      allowedMaxChannelCount: numberOfChannels
    }));

    _this._numberOfChannels = numberOfChannels | 0;
    _this._destinationChannelData = _this.inputs[0].bus.getChannelData();
    return _this;
  }

  /**
   * @return {number}
   */


  _createClass(AudioDestinationNode, [{
    key: "getMaxChannelCount",
    value: function getMaxChannelCount() {
      return this._numberOfChannels;
    }

    /**
     * @param {Float32Array[]} channelData
     * @param {number}         offset
     */

  }, {
    key: "process",
    value: function process(channelData, offset) {
      var inputs = this.inputs;
      var destinationChannelData = this._destinationChannelData;
      var numberOfChannels = channelData.length;

      for (var i = 0, imax = inputs.length; i < imax; i++) {
        inputs[i].pull();
      }

      for (var ch = 0; ch < numberOfChannels; ch++) {
        channelData[ch].set(destinationChannelData[ch], offset);
      }
    }
  }]);

  return AudioDestinationNode;
}(AudioNode);

module.exports = AudioDestinationNode;

},{"../constants/ChannelCountMode":62,"../utils":135,"./AudioNode":79}],78:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AudioListener = function () {
  /**
   * @param {AudioContext} context
   */
  function AudioListener(context) {
    _classCallCheck(this, AudioListener);

    this.context = context;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  /* istanbul ignore next */


  _createClass(AudioListener, [{
    key: "setPosition",
    value: function setPosition() {
      throw new TypeError("NOT YET IMPLEMENTED");
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} xUp
     * @param {number} yUp
     * @param {number} zUp
     */
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

},{}],79:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventTarget = require("./EventTarget");
var AudioNodeInput = require("./core/AudioNodeInput");
var AudioNodeOutput = require("./core/AudioNodeOutput");
var AudioParam = require("./AudioParam");

var _require = require("../utils"),
    defaults = _require.defaults,
    clamp = _require.clamp;

var _require2 = require("../utils"),
    toNumber = _require2.toNumber;

var _require3 = require("../constants"),
    MIN_NUMBER_OF_CHANNELS = _require3.MIN_NUMBER_OF_CHANNELS,
    MAX_NUMBER_OF_CHANNELS = _require3.MAX_NUMBER_OF_CHANNELS;

var _require4 = require("../constants/ChannelCountMode"),
    MAX = _require4.MAX,
    CLAMPED_MAX = _require4.CLAMPED_MAX,
    EXPLICIT = _require4.EXPLICIT;

var _require5 = require("../constants/ChannelInterpretation"),
    DISCRETE = _require5.DISCRETE,
    SPEAKERS = _require5.SPEAKERS;

/**
 * @prop {AudioContext}      context
 * @prop {number}            blockSize
 * @prop {number}            sampleRate
 * @prop {AudioNodeInput[]}  inputs
 * @prop {AudioNodeOutput[]} outputs
 */


var AudioNode = function (_EventTarget) {
  _inherits(AudioNode, _EventTarget);

  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.channelCount
   * @param {string}       opts.channelCountMode
   * @param {string}       opts.channelInterpretation
   * @param {number[]}     config.inputs
   * @param {number[]}     config.outputs
   * @param {number}       config.channelCount
   * @param {string}       config.channelCountMode
   */
  function AudioNode(context) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, AudioNode);

    var inputs = defaults(config.inputs, []);
    var outputs = defaults(config.outputs, []);
    var channelCount = defaults(config.channelCount, 1);
    var channelCountMode = defaults(config.channelCountMode, MAX);
    var channelInterpretation = SPEAKERS;
    var allowedMinChannelCount = defaults(config.allowedMinChannelCount, MIN_NUMBER_OF_CHANNELS);
    var allowedMaxChannelCount = defaults(config.allowedMaxChannelCount, MAX_NUMBER_OF_CHANNELS);
    var allowedChannelCountMode = defaults(config.allowedChannelCountMode, [MAX, CLAMPED_MAX, EXPLICIT]);
    var allowedChannelInterpretation = defaults(config.allowedChannelInterpretation, [DISCRETE, SPEAKERS]);

    var _this = _possibleConstructorReturn(this, (AudioNode.__proto__ || Object.getPrototypeOf(AudioNode)).call(this));

    _this.context = context;
    _this.blockSize = context.blockSize;
    _this.sampleRate = context.sampleRate;
    _this.inputs = [];
    _this.outputs = [];
    _this.channelCount = channelCount;
    _this.channelCountMode = channelCountMode;
    _this.channelInterpretation = channelInterpretation;
    _this.allowedMinChannelCount = allowedMinChannelCount;
    _this.allowedMaxChannelCount = allowedMaxChannelCount;
    _this.allowedChannelCountMode = allowedChannelCountMode;
    _this.allowedChannelInterpretation = allowedChannelInterpretation;
    _this.currentSampleFrame = -1;

    _this._params = [];
    _this._enabled = false;
    _this._suicideAtSampleFrame = Infinity;

    inputs.forEach(function (numberOfChannels) {
      _this.addInput(numberOfChannels, channelCount, channelCountMode);
    });
    outputs.forEach(function (numberOfChannels) {
      _this.addOutput(numberOfChannels);
    });

    if (typeof opts.channelCount === "number") {
      _this.setChannelCount(opts.channelCount);
    }
    if (typeof opts.channelCountMode === "string") {
      _this.setChannelCountMode(opts.channelCountMode);
    }
    if (typeof opts.channelInterpretation === "string") {
      _this.setChannelInterpretation(opts.channelInterpretation);
    }
    return _this;
  }

  /**
   * @return {number}
   */


  _createClass(AudioNode, [{
    key: "getNumberOfInputs",
    value: function getNumberOfInputs() {
      return this.inputs.length;
    }

    /**
     * @return {number}
     */

  }, {
    key: "getNumberOfOutputs",
    value: function getNumberOfOutputs() {
      return this.outputs.length;
    }

    /**
     * @return {number}
     */

  }, {
    key: "getChannelCount",
    value: function getChannelCount() {
      return this.channelCount;
    }

    /**
     * @param {number} value
     */

  }, {
    key: "setChannelCount",
    value: function setChannelCount(value) {
      value = toNumber(value);

      var channelCount = clamp(value, this.allowedMinChannelCount, this.allowedMaxChannelCount);

      if (channelCount !== this.channelCount) {
        this.channelCount = channelCount;
        this.inputs.forEach(function (input) {
          input.setChannelCount(value);
        });
      }
    }

    /**
     * @return {string}
     */

  }, {
    key: "getChannelCountMode",
    value: function getChannelCountMode() {
      return this.channelCountMode;
    }

    /**
     * @param {string} value
     */

  }, {
    key: "setChannelCountMode",
    value: function setChannelCountMode(value) {
      if (this.allowedChannelCountMode.indexOf(value) !== -1) {
        if (value !== this.channelCountMode) {
          this.channelCountMode = value;
          this.inputs.forEach(function (input) {
            input.setChannelCountMode(value);
          });
        }
      }
    }

    /**
     * @return {string}
     */

  }, {
    key: "getChannelInterpretation",
    value: function getChannelInterpretation() {
      return this.channelInterpretation;
    }

    /**
     * @param {string} value
     */

  }, {
    key: "setChannelInterpretation",
    value: function setChannelInterpretation(value) {
      if (this.allowedChannelInterpretation.indexOf(value) !== -1) {
        if (value !== this.channelInterpretation) {
          this.channelInterpretation = value;
          this.inputs.forEach(function (input) {
            input.setChannelInterpretation(value);
          });
        }
      }
    }

    /**
     * @param {AudioNode|AudioParam} destination
     * @param {number}               output
     * @param {number}               input
     */

  }, {
    key: "connect",
    value: function connect(destination, output, input) {
      this.outputs[output | 0].connect(destination, input | 0);
    }

    /**
     *
     */

  }, {
    key: "disconnect",
    value: function disconnect() {
      if (arguments.length === 0) {
        return this.disconnectAll();
      }
      if (typeof (arguments.length <= 0 ? undefined : arguments[0]) === "number") {
        return this.disconnectAllFromOutput((arguments.length <= 0 ? undefined : arguments[0]) | 0);
      }
      if (arguments.length === 1) {
        return this.disconnectIfConnected(arguments.length <= 0 ? undefined : arguments[0]);
      }
      return this.disconnectFromOutputIfConnected((arguments.length <= 1 ? undefined : arguments[1]) | 0, arguments.length <= 0 ? undefined : arguments[0], (arguments.length <= 2 ? undefined : arguments[2]) | 0);
    }

    /**
     * @param {number} numberOfChannels
     * @param {number} channelCount
     * @param {string} channelCountMode
     * @return {AudioNodeInput}
     */

  }, {
    key: "addInput",
    value: function addInput(numberOfChannels, channelCount, channelCountMode) {
      var node = this;
      var index = this.inputs.length;
      var input = new AudioNodeInput({ node: node, index: index, numberOfChannels: numberOfChannels, channelCount: channelCount, channelCountMode: channelCountMode });

      this.inputs.push(input);

      return input;
    }

    /**
     * @param {number} numberOfChannels
     * @return {AudioNodeOutput}
     */

  }, {
    key: "addOutput",
    value: function addOutput(numberOfChannels) {
      var node = this;
      var index = this.outputs.length;
      var output = new AudioNodeOutput({ node: node, index: index, numberOfChannels: numberOfChannels });

      this.outputs.push(output);

      return output;
    }

    /**
     * @param {string} rate - [ "audio", "control" ]
     * @param {number} defaultValue
     * @return {AudioParam}
     */

  }, {
    key: "addParam",
    value: function addParam(rate, defaultValue) {
      var param = new AudioParam(this.context, { rate: rate, defaultValue: defaultValue });

      this._params.push(param);

      return param;
    }

    /**
     * @return {boolean}
     */

  }, {
    key: "isEnabled",
    value: function isEnabled() {
      return this._enabled;
    }

    /**
     * @return {number}
     */

  }, {
    key: "getTailTime",
    value: function getTailTime() {
      return 0;
    }

    /**
     *
     */

  }, {
    key: "enableOutputsIfNecessary",
    value: function enableOutputsIfNecessary() {
      if (!this._enabled) {
        this._suicideAtSampleFrame = Infinity;
        this._enabled = true;
        this.outputs.forEach(function (output) {
          output.enable();
        });
      }
    }

    /**
     *
     */

  }, {
    key: "disableOutputsIfNecessary",
    value: function disableOutputsIfNecessary() {
      var currentTime = this.context.currentTime;
      var disableAtTime = currentTime + this.getTailTime();

      if (disableAtTime === currentTime) {
        this._disableOutputsIfNecessary();
      } else if (disableAtTime !== Infinity) {
        this._suicideAtSampleFrame = Math.round(disableAtTime * this.sampleRate);
      }
    }

    /**
     * @private
     */

  }, {
    key: "_disableOutputsIfNecessary",
    value: function _disableOutputsIfNecessary() {
      if (this._enabled) {
        this._enabled = false;
        this.outputs.forEach(function (output) {
          output.disable();
        });
      }
    }

    /**
     *
     */

  }, {
    key: "channelDidUpdate",
    value: function channelDidUpdate() {}

    /**
     *
     */

  }, {
    key: "disconnectAll",
    value: function disconnectAll() {
      this.outputs.forEach(function (output) {
        output.disconnect();
      });
    }

    /**
     * @param {number} output
     */

  }, {
    key: "disconnectAllFromOutput",
    value: function disconnectAllFromOutput(output) {
      this.outputs[output | 0].disconnect();
    }

    /**
     * @param {AudioNode|AudioParam} destination
     */

  }, {
    key: "disconnectIfConnected",
    value: function disconnectIfConnected(destination) {
      this.outputs.forEach(function (output) {
        output.disconnect(destination);
      });
    }

    /**
     * @param {number} output
     * @param {AudioNode|AudioParam} destination
     * @param {number} output
     */

  }, {
    key: "disconnectFromOutputIfConnected",
    value: function disconnectFromOutputIfConnected(output, destination, input) {
      this.outputs[output | 0].disconnect(destination, input | 0);
    }

    /**
     *
     */

  }, {
    key: "processIfNecessary",
    value: function processIfNecessary() {
      var _this2 = this;

      // prevent infinite loop when audio graph has feedback
      if (this.context.currentSampleFrame <= this.currentSampleFrame) {
        return;
      }
      this.currentSampleFrame = this.context.currentSampleFrame;

      if (this._suicideAtSampleFrame <= this.currentSampleFrame) {
        var outputs = this.outputs;

        for (var i = 0, imax = outputs.length; i < imax; i++) {
          outputs[i].zeros();
        }

        this.context.addPostProcess(function () {
          _this2._disableOutputsIfNecessary();
        });
        return;
      }

      var inputs = this.inputs;

      for (var _i = 0, _imax = inputs.length; _i < _imax; _i++) {
        inputs[_i].pull();
      }

      var params = this._params;

      for (var _i2 = 0, _imax2 = params.length; _i2 < _imax2; _i2++) {
        params[_i2].dspProcess();
      }

      this.dspProcess();
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

},{"../constants":66,"../constants/ChannelCountMode":62,"../constants/ChannelInterpretation":63,"../utils":135,"./AudioParam":80,"./EventTarget":91,"./core/AudioNodeInput":103,"./core/AudioNodeOutput":104}],80:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AudioNodeInput = require("./core/AudioNodeInput");
var AudioBus = require("./core/AudioBus");
var AudioParamDSP = require("./dsp/AudioParam");

var _require = require("../utils"),
    defaults = _require.defaults;

var _require2 = require("../utils"),
    toNumber = _require2.toNumber;

var _require3 = require("../constants/ChannelCountMode"),
    EXPLICIT = _require3.EXPLICIT;

var _require4 = require("../constants/AudioParamRate"),
    CONTROL_RATE = _require4.CONTROL_RATE;

var _require5 = require("../constants/AudioParamEvent"),
    SET_VALUE_AT_TIME = _require5.SET_VALUE_AT_TIME;

var _require6 = require("../constants/AudioParamEvent"),
    LINEAR_RAMP_TO_VALUE_AT_TIME = _require6.LINEAR_RAMP_TO_VALUE_AT_TIME;

var _require7 = require("../constants/AudioParamEvent"),
    EXPONENTIAL_RAMP_TO_VALUE_AT_TIME = _require7.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME;

var _require8 = require("../constants/AudioParamEvent"),
    SET_TARGET_AT_TIME = _require8.SET_TARGET_AT_TIME;

var _require9 = require("../constants/AudioParamEvent"),
    SET_VALUE_CURVE_AT_TIME = _require9.SET_VALUE_CURVE_AT_TIME;

/**
 * @prop {AudioContext}      context
 * @prop {number}            blockSize
 * @prop {number}            sampleRate
 * @prop {AudioNodeInput[]}  inputs
 * @prop {AudioBus}          outputBus
 */


var AudioParam = function () {
  /**
   * @param {AudioContext} context
   * @param {string}       opts.rate - [ AUDIO_RATE, CONTROL_RATE ]
   * @param {number}       opts.defaultValue
   */
  function AudioParam(context) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, AudioParam);

    var rate = defaults(opts.rate, CONTROL_RATE);
    var defaultValue = defaults(opts.defaultValue, 0);

    this.context = context;
    this.blockSize = context.blockSize;
    this.sampleRate = context.sampleRate;
    this.inputs = [new AudioNodeInput({
      node: this,
      index: 0,
      numberOfChannels: 1,
      channelCount: 1,
      channelCountMode: EXPLICIT
    })];
    this.outputBus = new AudioBus(1, this.blockSize, this.sampleRate);

    this._rate = rate;
    this._defaultValue = toNumber(defaultValue);
    this._value = this._defaultValue;
    this._userValue = this._value;
    this._timeline = [];

    this.dspInit(this._rate);
  }

  /**
   * @return {number}
   */


  _createClass(AudioParam, [{
    key: "getValue",
    value: function getValue() {
      return this._value;
    }

    /**
     * @param {number} value
     */

  }, {
    key: "setValue",
    value: function setValue(value) {
      this._value = this._userValue = toNumber(value);
    }

    /**
     * @return {number}
     */

  }, {
    key: "getDefaultValue",
    value: function getDefaultValue() {
      return this._defaultValue;
    }

    /**
     * @param {number} value
     * @param {number} startTime
     */

  }, {
    key: "setValueAtTime",
    value: function setValueAtTime(value, startTime) {
      value = toNumber(value);
      startTime = Math.max(0, toNumber(startTime));

      var eventItem = {
        type: SET_VALUE_AT_TIME,
        time: startTime,
        args: [value, startTime],
        startFrame: Math.round(startTime * this.sampleRate),
        endFrame: Infinity,
        startValue: value,
        endValue: value
      };
      var index = this.insertEvent(eventItem);
      var prevEventItem = this._timeline[index - 1];
      var nextEventItem = this._timeline[index + 1];

      if (prevEventItem) {
        switch (prevEventItem.type) {
          case SET_VALUE_AT_TIME:
          case SET_TARGET_AT_TIME:
            prevEventItem.endFrame = eventItem.startFrame;
            break;
        }
      }

      if (nextEventItem) {
        switch (nextEventItem.type) {
          case LINEAR_RAMP_TO_VALUE_AT_TIME:
          case EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
            nextEventItem.startFrame = eventItem.startFrame;
            nextEventItem.startValue = eventItem.startValue;
            break;
        }
        eventItem.endFrame = nextEventItem.startFrame;
      }

      if (index <= this._currentEventIndex) {
        this._currentEventIndex = index;
        this._remainSamples = 0;
      }
    }

    /**
     * @param {number} value
     * @param {number} endTime
     */

  }, {
    key: "linearRampToValueAtTime",
    value: function linearRampToValueAtTime(value, endTime) {
      value = toNumber(value);
      endTime = Math.max(0, toNumber(endTime));

      var eventItem = {
        type: LINEAR_RAMP_TO_VALUE_AT_TIME,
        time: endTime,
        args: [value, endTime],
        startFrame: 0,
        endFrame: Math.round(endTime * this.sampleRate),
        startValue: this._defaultValue,
        endValue: value
      };
      var index = this.insertEvent(eventItem);
      var prevEventItem = this._timeline[index - 1];
      var nextEventItem = this._timeline[index + 1];

      if (prevEventItem) {
        switch (prevEventItem.type) {
          case SET_VALUE_AT_TIME:
          case SET_TARGET_AT_TIME:
            eventItem.startFrame = prevEventItem.startFrame;
            eventItem.startValue = prevEventItem.startValue;
            prevEventItem.endFrame = eventItem.startFrame;
            break;
          case LINEAR_RAMP_TO_VALUE_AT_TIME:
          case EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
          case SET_VALUE_CURVE_AT_TIME:
            eventItem.startFrame = prevEventItem.endFrame;
            eventItem.startValue = prevEventItem.endValue;
            break;
        }
      }

      if (nextEventItem) {
        switch (nextEventItem.type) {
          case LINEAR_RAMP_TO_VALUE_AT_TIME:
          case EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
            nextEventItem.startFrame = eventItem.endFrame;
            nextEventItem.startValue = eventItem.endValue;
            break;
        }
      }

      if (index <= this._currentEventIndex) {
        this._currentEventIndex = index;
        this._remainSamples = 0;
      }
    }

    /**
     * @param {number} value
     * @param {number} endTime
     */

  }, {
    key: "exponentialRampToValueAtTime",
    value: function exponentialRampToValueAtTime(value, endTime) {
      value = Math.max(1e-6, toNumber(value));
      endTime = Math.max(0, toNumber(endTime));

      var eventItem = {
        type: EXPONENTIAL_RAMP_TO_VALUE_AT_TIME,
        time: endTime,
        args: [value, endTime],
        startFrame: 0,
        endFrame: Math.round(endTime * this.sampleRate),
        startValue: Math.max(1e-6, this._defaultValue),
        endValue: value
      };
      var index = this.insertEvent(eventItem);
      var prevEventItem = this._timeline[index - 1];
      var nextEventItem = this._timeline[index + 1];

      if (prevEventItem) {
        switch (prevEventItem.type) {
          case SET_VALUE_AT_TIME:
          case SET_TARGET_AT_TIME:
            eventItem.startFrame = prevEventItem.startFrame;
            eventItem.startValue = prevEventItem.startValue;
            prevEventItem.endFrame = eventItem.startFrame;
            break;
          case LINEAR_RAMP_TO_VALUE_AT_TIME:
          case EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
          case SET_VALUE_CURVE_AT_TIME:
            eventItem.startFrame = prevEventItem.endFrame;
            eventItem.startValue = prevEventItem.endValue;
            break;
        }
      }

      if (nextEventItem) {
        switch (nextEventItem.type) {
          case LINEAR_RAMP_TO_VALUE_AT_TIME:
          case EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
            nextEventItem.startFrame = eventItem.endFrame;
            nextEventItem.startValue = eventItem.endValue;
            break;
        }
      }

      if (index <= this._currentEventIndex) {
        this._currentEventIndex = index;
        this._remainSamples = 0;
      }
    }

    /**
     * @param {number} target
     * @param {number} startTime
     * @param {number} timeConstant
     */

  }, {
    key: "setTargetAtTime",
    value: function setTargetAtTime(target, startTime, timeConstant) {
      target = toNumber(target);
      startTime = Math.max(0, toNumber(startTime));
      timeConstant = Math.max(0, toNumber(timeConstant));

      var eventItem = {
        type: SET_TARGET_AT_TIME,
        time: startTime,
        args: [target, startTime, timeConstant],
        startFrame: Math.round(startTime * this.sampleRate),
        endFrame: Infinity,
        startValue: 0,
        endValue: target
      };
      var index = this.insertEvent(eventItem);
      var prevEventItem = this._timeline[index - 1];
      var nextEventItem = this._timeline[index + 1];

      if (prevEventItem) {
        switch (prevEventItem.type) {
          case SET_VALUE_AT_TIME:
            eventItem.startValue = prevEventItem.endValue;
            prevEventItem.endFrame = eventItem.startFrame;
            break;
          case SET_TARGET_AT_TIME:
            eventItem.startValue = 0;
            prevEventItem.endFrame = eventItem.startFrame;
            break;
          case LINEAR_RAMP_TO_VALUE_AT_TIME:
          case EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
          case SET_VALUE_CURVE_AT_TIME:
            eventItem.startValue = prevEventItem.endValue;
            break;
        }
      }

      if (nextEventItem) {
        switch (nextEventItem.type) {
          case LINEAR_RAMP_TO_VALUE_AT_TIME:
          case EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
            nextEventItem.startFrame = eventItem.startFrame;
            nextEventItem.startValue = eventItem.startValue;
            break;
        }
        eventItem.endFrame = nextEventItem.startFrame;
      }

      if (index <= this._currentEventIndex) {
        this._currentEventIndex = index;
        this._remainSamples = 0;
      }
    }

    /**
     * @param {Float32Array[]} values
     * @param {number}         startTime
     * @param {number}         duration
     */

  }, {
    key: "setValueCurveAtTime",
    value: function setValueCurveAtTime(values, startTime, duration) {
      startTime = Math.max(0, toNumber(startTime));
      duration = Math.max(0, toNumber(duration));

      if (values.length === 0 || duration === 0) {
        return;
      }

      var eventItem = {
        type: SET_VALUE_CURVE_AT_TIME,
        time: startTime,
        args: [values, startTime, duration],
        startFrame: Math.round(startTime * this.sampleRate),
        endFrame: Math.round((startTime + duration) * this.sampleRate),
        startValue: values[0],
        endValue: values[values.length - 1]
      };
      var index = this.insertEvent(eventItem);
      var prevEventItem = this._timeline[index - 1];
      var nextEventItem = this._timeline[index + 1];

      if (prevEventItem) {
        switch (prevEventItem.type) {
          case SET_VALUE_AT_TIME:
          case SET_TARGET_AT_TIME:
            prevEventItem.endFrame = eventItem.startFrame;
            break;
        }
      }

      if (nextEventItem) {
        switch (nextEventItem.type) {
          case LINEAR_RAMP_TO_VALUE_AT_TIME:
          case EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
            nextEventItem.startFrame = eventItem.startFrame;
            nextEventItem.startValue = eventItem.endValue;
            break;
        }
      }

      if (index <= this._currentEventIndex) {
        this._currentEventIndex = index;
        this._remainSamples = 0;
      }
    }

    /**
     * @param {number} startTime
     */

  }, {
    key: "cancelScheduledValues",
    value: function cancelScheduledValues(startTime) {
      startTime = Math.max(0, toNumber(startTime));

      this._timeline = this._timeline.filter(function (eventItem) {
        return eventItem.time < startTime;
      });

      var index = this._timeline.length - 1;
      var lastEventItem = this._timeline[index];

      if (lastEventItem) {
        switch (lastEventItem.type) {
          case SET_VALUE_AT_TIME:
          case SET_TARGET_AT_TIME:
            lastEventItem.endFrame = Infinity;
            break;
        }
      }

      if (index <= this._currentEventIndex) {
        this._currentEventIndex = index;
        this._remainSamples = 0;
      }
    }

    /**
     * @return {string}
     */

  }, {
    key: "getRate",
    value: function getRate() {
      return this._rate;
    }

    /**
     * @return {boolean}
     */

  }, {
    key: "hasSampleAccurateValues",
    value: function hasSampleAccurateValues() {
      return this._hasSampleAccurateValues;
    }

    /**
     * @return {Float32Array}
     */

  }, {
    key: "getSampleAccurateValues",
    value: function getSampleAccurateValues() {
      return this.outputBus.getChannelData()[0];
    }

    /**
     *
     */

  }, {
    key: "enableOutputsIfNecessary",
    value: function enableOutputsIfNecessary() {}

    /**
     *
     */

  }, {
    key: "disableOutputsIfNecessary",
    value: function disableOutputsIfNecessary() {}

    /**
     * @return {object[]}
     */

  }, {
    key: "getTimeline",
    value: function getTimeline() {
      return this._timeline;
    }

    /**
     * @return {object[]}
     */

  }, {
    key: "getEvents",
    value: function getEvents() {
      return this._timeline.map(function (event) {
        return { type: event.type, time: event.time, args: event.args };
      });
    }

    /**
     * @param {object}
     * @return {number}
     */

  }, {
    key: "insertEvent",
    value: function insertEvent(eventItem) {
      var time = eventItem.time;
      var timeline = this._timeline;

      if (timeline.length === 0 || timeline[timeline.length - 1].time < time) {
        timeline.push(eventItem);
        return timeline.length - 1;
      }

      var pos = 0;
      var replace = 0;

      while (pos < timeline.length) {
        if (timeline[pos].time === time && timeline[pos].type === eventItem.type) {
          replace = 1;
          break;
        }
        if (time < timeline[pos].time) {
          break;
        }
        pos += 1;
      }

      timeline.splice(pos, replace, eventItem);

      return pos;
    }
  }]);

  return AudioParam;
}();

Object.assign(AudioParam.prototype, AudioParamDSP);

module.exports = AudioParam;

},{"../constants/AudioParamEvent":59,"../constants/AudioParamRate":60,"../constants/ChannelCountMode":62,"../utils":135,"./core/AudioBus":101,"./core/AudioNodeInput":103,"./dsp/AudioParam":107}],81:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioSourceNode = require("./AudioSourceNode");

var _require = require("../utils"),
    toNumber = _require.toNumber;

var _require2 = require("../constants/PlaybackState"),
    UNSCHEDULED = _require2.UNSCHEDULED,
    SCHEDULED = _require2.SCHEDULED,
    PLAYING = _require2.PLAYING,
    FINISHED = _require2.FINISHED;

var AudioScheduledSourceNode = function (_AudioSourceNode) {
  _inherits(AudioScheduledSourceNode, _AudioSourceNode);

  /**
   * @param {AudioContext} context
   */
  function AudioScheduledSourceNode(context, opts) {
    _classCallCheck(this, AudioScheduledSourceNode);

    var _this = _possibleConstructorReturn(this, (AudioScheduledSourceNode.__proto__ || Object.getPrototypeOf(AudioScheduledSourceNode)).call(this, context, opts));

    _this._startTime = Infinity;
    _this._stopTime = Infinity;
    _this._startFrame = Infinity;
    _this._stopFrame = Infinity;
    return _this;
  }

  /**
   * @return {number}
   */


  _createClass(AudioScheduledSourceNode, [{
    key: "getStartTime",
    value: function getStartTime() {
      if (this._startTime !== Infinity) {
        return this._startTime;
      }
    }

    /**
     * @return {number}
     */

  }, {
    key: "getStopTime",
    value: function getStopTime() {
      if (this._stopTime !== Infinity) {
        return this._stopTime;
      }
    }

    /**
     * @return {string}
     */

  }, {
    key: "getPlaybackState",
    value: function getPlaybackState() {
      if (this._startTime === Infinity) {
        return UNSCHEDULED;
      }
      if (this.context.currentTime < this._startTime) {
        return SCHEDULED;
      }
      if (this._stopTime <= this.context.currentTime) {
        return FINISHED;
      }
      return PLAYING;
    }

    /**
     * @param {number} when
     */

  }, {
    key: "start",
    value: function start(when) {
      var _this2 = this;

      /* istanbul ignore next */
      if (this._startTime !== Infinity) {
        return;
      }

      when = Math.max(this.context.currentTime, toNumber(when));

      this._startTime = when;
      this._startFrame = Math.round(when * this.sampleRate);

      this.context.sched(when, function () {
        _this2.outputs[0].enable();
      });
    }

    /**
     * @param {number} when
     */

  }, {
    key: "stop",
    value: function stop(when) {
      /* istanbul ignore next */
      if (this._stopTime !== Infinity) {
        return;
      }

      when = Math.max(this.context.currentTime, this._startTime, toNumber(when));

      this._stopTime = when;
      this._stopFrame = Math.round(when * this.sampleRate);
    }
  }]);

  return AudioScheduledSourceNode;
}(AudioSourceNode);

module.exports = AudioScheduledSourceNode;

},{"../constants/PlaybackState":65,"../utils":135,"./AudioSourceNode":82}],82:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("./AudioNode");

/* istanbul ignore next */

var AudioSourceNode = function (_AudioNode) {
  _inherits(AudioSourceNode, _AudioNode);

  /**
   * @param {AudioContext} context
   */
  function AudioSourceNode(context, opts) {
    _classCallCheck(this, AudioSourceNode);

    return _possibleConstructorReturn(this, (AudioSourceNode.__proto__ || Object.getPrototypeOf(AudioSourceNode)).call(this, context, opts, {
      inputs: [],
      outputs: [1]
    }));
  }

  _createClass(AudioSourceNode, [{
    key: "enableOutputsIfNecessary",
    value: function enableOutputsIfNecessary() {}
  }, {
    key: "disableOutputsIfNecessary",
    value: function disableOutputsIfNecessary() {}
  }]);

  return AudioSourceNode;
}(AudioNode);

module.exports = AudioSourceNode;

},{"./AudioNode":79}],83:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("./AudioNode");

var _require = require("../utils"),
    defaults = _require.defaults;

var _require2 = require("../utils"),
    toNumber = _require2.toNumber;

var _require3 = require("../constants/ChannelCountMode"),
    CLAMPED_MAX = _require3.CLAMPED_MAX,
    EXPLICIT = _require3.EXPLICIT;

var PanningModelTypes = ["equalpower", "HRTF"];
var DistanceModelTypes = ["linear", "inverse", "exponential"];

var DEFAULT_PANNING_MODEL = "equalpower";
var DEFAULT_DISTANCE_MODEL = "inverse";
var DEFAULT_REF_DISTANCE = 1;
var DEFAULT_MAX_DISTANCE = 10000;
var DEFAULT_ROLLOFF_FACTOR = 1;
var DEFAULT_CONE_INNER_ANGLE = 360;
var DEFAULT_CONE_OUTER_ANGLE = 360;
var DEFAULT_CONE_OUTER_GAIN = 0;

var BasePannerNode = function (_AudioNode) {
  _inherits(BasePannerNode, _AudioNode);

  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {string}       opts.panningModel
   * @param {string}       opts.distanceModel
   * @param {number}       opts.refDistance
   * @param {number}       opts.maxDistance
   * @param {number}       opts.rolloffFactor
   * @param {number}       opts.coneInnerAngle
   * @param {number}       opts.coneOuterAngle
   * @param {number}       opts.coneOuterGain
   */
  function BasePannerNode(context) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, BasePannerNode);

    var panningModel = defaults(opts.panningModel, DEFAULT_PANNING_MODEL);
    var distanceModel = defaults(opts.distanceModel, DEFAULT_DISTANCE_MODEL);
    var refDistance = defaults(opts.refDistance, DEFAULT_REF_DISTANCE);
    var maxDistance = defaults(opts.maxDistance, DEFAULT_MAX_DISTANCE);
    var rolloffFactor = defaults(opts.rolloffFactor, DEFAULT_ROLLOFF_FACTOR);
    var coneInnerAngle = defaults(opts.coneInnerAngle, DEFAULT_CONE_INNER_ANGLE);
    var coneOuterAngle = defaults(opts.coneOuterAngle, DEFAULT_CONE_OUTER_ANGLE);
    var coneOuterGain = defaults(opts.coneOuterGain, DEFAULT_CONE_OUTER_GAIN);

    var _this = _possibleConstructorReturn(this, (BasePannerNode.__proto__ || Object.getPrototypeOf(BasePannerNode)).call(this, context, opts, {
      inputs: [1],
      outputs: [2],
      channelCount: 2,
      channelCountMode: CLAMPED_MAX,
      allowedMaxChannelCount: 2,
      allowedChannelCountMode: [CLAMPED_MAX, EXPLICIT]
    }));

    _this._panningModel = panningModel;
    _this._distanceModel = distanceModel;
    _this._refDistance = refDistance;
    _this._maxDistance = maxDistance;
    _this._rolloffFactor = rolloffFactor;
    _this._coneInnerAngle = coneInnerAngle;
    _this._coneOuterAngle = coneOuterAngle;
    _this._coneOuterGain = coneOuterGain;
    return _this;
  }

  /**
   * @return {string}
   */


  _createClass(BasePannerNode, [{
    key: "getPanningModel",
    value: function getPanningModel() {
      return this._panningModel;
    }

    /**
     * @param {string} value
     */

  }, {
    key: "setPanningModel",
    value: function setPanningModel(value) {
      /* istanbul ignore else */
      if (PanningModelTypes.indexOf(value) !== -1) {
        this._panningModel = value;
      }
    }

    /**
     * @return {string}
     */

  }, {
    key: "getDistanceModel",
    value: function getDistanceModel() {
      return this._distanceModel;
    }

    /**
     * @param {string} value
     */

  }, {
    key: "setDistanceModel",
    value: function setDistanceModel(value) {
      /* istanbul ignore else */
      if (DistanceModelTypes.indexOf(value) !== -1) {
        this._distanceModel = value;
      }
    }

    /**
     * @return {number}
     */

  }, {
    key: "getRefDistance",
    value: function getRefDistance() {
      return this._refDistance;
    }

    /**
     * @param {number} value
     */

  }, {
    key: "setRefDistance",
    value: function setRefDistance(value) {
      this._refDistance = toNumber(value);
    }

    /**
     * @return {number}
     */

  }, {
    key: "getMaxDistance",
    value: function getMaxDistance() {
      return this._maxDistance;
    }

    /**
     * @param {number} value
     */

  }, {
    key: "setMaxDistance",
    value: function setMaxDistance(value) {
      this._maxDistance = toNumber(value);
    }

    /**
     * @return {number}
     */

  }, {
    key: "getRolloffFactor",
    value: function getRolloffFactor() {
      return this._rolloffFactor;
    }

    /**
     * @param {number} value
     */

  }, {
    key: "setRolloffFactor",
    value: function setRolloffFactor(value) {
      this._rolloffFactor = toNumber(value);
    }

    /**
     * @return {number}
     */

  }, {
    key: "getConeInnerAngle",
    value: function getConeInnerAngle() {
      return this._coneInnerAngle;
    }

    /**
     * @param {number} value
     */

  }, {
    key: "setConeInnerAngle",
    value: function setConeInnerAngle(value) {
      this._coneInnerAngle = toNumber(value);
    }

    /**
     * @return {number}
     */

  }, {
    key: "getConeOuterAngle",
    value: function getConeOuterAngle() {
      return this._coneOuterAngle;
    }

    /**
     * @param {number} value
     */

  }, {
    key: "setConeOuterAngle",
    value: function setConeOuterAngle(value) {
      this._coneOuterAngle = toNumber(value);
    }

    /**
     * @return {number}
     */

  }, {
    key: "getConeOuterGain",
    value: function getConeOuterGain() {
      return this._coneOuterGain;
    }

    /**
     * @param {number} value
     */

  }, {
    key: "setConeOuterGain",
    value: function setConeOuterGain(value) {
      this._coneOuterGain = toNumber(value);
    }
  }]);

  return BasePannerNode;
}(AudioNode);

module.exports = BasePannerNode;

},{"../constants/ChannelCountMode":62,"../utils":135,"./AudioNode":79}],84:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("./AudioNode");
var BiquadFilterNodeDSP = require("./dsp/BiquadFilterNode");

var _require = require("../utils"),
    defaults = _require.defaults;

var _require2 = require("../constants/ChannelCountMode"),
    MAX = _require2.MAX;

var _require3 = require("../constants/AudioParamRate"),
    CONTROL_RATE = _require3.CONTROL_RATE;

var _require4 = require("../constants/BiquadFilterType"),
    LOWPASS = _require4.LOWPASS;

var _require5 = require("../constants/BiquadFilterType"),
    HIGHPASS = _require5.HIGHPASS;

var _require6 = require("../constants/BiquadFilterType"),
    BANDPASS = _require6.BANDPASS;

var _require7 = require("../constants/BiquadFilterType"),
    LOWSHELF = _require7.LOWSHELF;

var _require8 = require("../constants/BiquadFilterType"),
    HIGHSHELF = _require8.HIGHSHELF;

var _require9 = require("../constants/BiquadFilterType"),
    PEAKING = _require9.PEAKING;

var _require10 = require("../constants/BiquadFilterType"),
    NOTCH = _require10.NOTCH;

var _require11 = require("../constants/BiquadFilterType"),
    ALLPASS = _require11.ALLPASS;

var allowedBiquadFilterTypes = [LOWPASS, HIGHPASS, BANDPASS, LOWSHELF, HIGHSHELF, PEAKING, NOTCH, ALLPASS];

var DEFAULT_TYPE = LOWPASS;
var DEFAULT_FREQUENCY = 350;
var DEFAULT_DETUNE = 0;
var DEFAULT_Q = 1;
var DEFAULT_GAIN = 0;

var BiquadFilterNode = function (_AudioNode) {
  _inherits(BiquadFilterNode, _AudioNode);

  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {string}       opts.type
   * @param {number}       opts.frequency
   * @param {number}       opts.detune
   * @param {number}       opts.Q
   * @param {number}       opts.gain
   */
  function BiquadFilterNode(context) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, BiquadFilterNode);

    var type = defaults(opts.type, DEFAULT_TYPE);
    var frequency = defaults(opts.frequency, DEFAULT_FREQUENCY);
    var detune = defaults(opts.detune, DEFAULT_DETUNE);
    var Q = defaults(opts.Q, DEFAULT_Q);
    var gain = defaults(opts.gain, DEFAULT_GAIN);

    var _this = _possibleConstructorReturn(this, (BiquadFilterNode.__proto__ || Object.getPrototypeOf(BiquadFilterNode)).call(this, context, opts, {
      inputs: [1],
      outputs: [1],
      channelCount: 2,
      channelCountMode: MAX
    }));

    _this._type = type;
    _this._frequency = _this.addParam(CONTROL_RATE, frequency);
    _this._detune = _this.addParam(CONTROL_RATE, detune);
    _this._Q = _this.addParam(CONTROL_RATE, Q);
    _this._gain = _this.addParam(CONTROL_RATE, gain);

    _this.dspInit();
    _this.dspUpdateKernel(1);
    return _this;
  }

  /**
   * @return {string}
   */


  _createClass(BiquadFilterNode, [{
    key: "getType",
    value: function getType() {
      return this._type;
    }

    /**
     * @param {string} value
     */

  }, {
    key: "setType",
    value: function setType(value) {
      /* istanbul ignore else */
      if (allowedBiquadFilterTypes.indexOf(value) !== -1) {
        this._type = value;
      }
    }

    /**
     * @return {AudioParam}
     */

  }, {
    key: "getFrequency",
    value: function getFrequency() {
      return this._frequency;
    }

    /**
     * @return {AudioParam}
     */

  }, {
    key: "getDetune",
    value: function getDetune() {
      return this._detune;
    }

    /**
     * @return {AudioParam}
     */

  }, {
    key: "getQ",
    value: function getQ() {
      return this._Q;
    }

    /**
     * @return {AudioParam}
     */

  }, {
    key: "getGain",
    value: function getGain() {
      return this._gain;
    }

    /**
     * @param {Float32Array} frequencyHz
     * @param {Float32Array} magResponse
     * @param {Float32Array} phaseResponse
     */

  }, {
    key: "getFrequencyResponse",
    value: function getFrequencyResponse(frequencyHz, magResponse, phaseResponse) {
      this.dspGetFrequencyResponse(frequencyHz, magResponse, phaseResponse);
    }

    /**
     * @param {number} numberOfChannels
     */

  }, {
    key: "channelDidUpdate",
    value: function channelDidUpdate(numberOfChannels) {
      this.dspUpdateKernel(numberOfChannels);
      this.outputs[0].setNumberOfChannels(numberOfChannels);
    }

    /**
     * @return {number}
     */

  }, {
    key: "getTailTime",
    value: function getTailTime() {
      return 0.2;
    }
  }]);

  return BiquadFilterNode;
}(AudioNode);

Object.assign(BiquadFilterNode.prototype, BiquadFilterNodeDSP);

module.exports = BiquadFilterNode;

},{"../constants/AudioParamRate":60,"../constants/BiquadFilterType":61,"../constants/ChannelCountMode":62,"../utils":135,"./AudioNode":79,"./dsp/BiquadFilterNode":109}],85:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("./AudioNode");
var ChannelMergerNodeDSP = require("./dsp/ChannelMergerNode");

var _require = require("../utils"),
    defaults = _require.defaults,
    fill = _require.fill;

var _require2 = require("../utils"),
    toValidNumberOfChannels = _require2.toValidNumberOfChannels;

var _require3 = require("../constants/ChannelCountMode"),
    EXPLICIT = _require3.EXPLICIT;

var DEFAULT_NUMBER_OF_INPUTS = 6;

var ChannelMergerNode = function (_AudioNode) {
  _inherits(ChannelMergerNode, _AudioNode);

  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.numberOfInputs
   */
  function ChannelMergerNode(context) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, ChannelMergerNode);

    var numberOfInputs = defaults(opts.numberOfInputs, DEFAULT_NUMBER_OF_INPUTS);

    numberOfInputs = toValidNumberOfChannels(numberOfInputs);

    return _possibleConstructorReturn(this, (ChannelMergerNode.__proto__ || Object.getPrototypeOf(ChannelMergerNode)).call(this, context, opts, {
      inputs: fill(new Array(numberOfInputs), 1),
      outputs: [numberOfInputs],
      channelCount: 1,
      channelCountMode: EXPLICIT,
      allowedMaxChannelCount: 1,
      allowedChannelCountMode: [EXPLICIT]
    }));
  }

  _createClass(ChannelMergerNode, [{
    key: "disableOutputsIfNecessary",
    value: function disableOutputsIfNecessary() {
      // disable if all inputs are disabled

      /* istanbul ignore else */
      if (this.isEnabled()) {
        var inputs = this.inputs;

        for (var i = 0, imax = inputs.length; i < imax; i++) {
          if (inputs[i].isEnabled()) {
            return;
          }
        }

        _get(ChannelMergerNode.prototype.__proto__ || Object.getPrototypeOf(ChannelMergerNode.prototype), "disableOutputsIfNecessary", this).call(this);
      }
    }
  }]);

  return ChannelMergerNode;
}(AudioNode);

Object.assign(ChannelMergerNode.prototype, ChannelMergerNodeDSP);

module.exports = ChannelMergerNode;

},{"../constants/ChannelCountMode":62,"../utils":135,"./AudioNode":79,"./dsp/ChannelMergerNode":110}],86:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("./AudioNode");
var ChannelSplitterNodeDSP = require("./dsp/ChannelSplitterNode");

var _require = require("../utils"),
    defaults = _require.defaults,
    fill = _require.fill;

var _require2 = require("../utils"),
    toValidNumberOfChannels = _require2.toValidNumberOfChannels;

var _require3 = require("../constants/ChannelCountMode"),
    MAX = _require3.MAX;

var DEFAULT_NUMBER_OF_OUTPUTS = 6;

var ChannelSplitterNode = function (_AudioNode) {
  _inherits(ChannelSplitterNode, _AudioNode);

  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.numberOfOutputs
   */
  function ChannelSplitterNode(context) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, ChannelSplitterNode);

    var numberOfOutputs = defaults(opts.numberOfOutputs, DEFAULT_NUMBER_OF_OUTPUTS);

    numberOfOutputs = toValidNumberOfChannels(numberOfOutputs);

    return _possibleConstructorReturn(this, (ChannelSplitterNode.__proto__ || Object.getPrototypeOf(ChannelSplitterNode)).call(this, context, opts, {
      inputs: [1],
      outputs: fill(new Array(numberOfOutputs), 1),
      channelCount: 2,
      channelCountMode: MAX
    }));
  }

  return ChannelSplitterNode;
}(AudioNode);

Object.assign(ChannelSplitterNode.prototype, ChannelSplitterNodeDSP);

module.exports = ChannelSplitterNode;

},{"../constants/ChannelCountMode":62,"../utils":135,"./AudioNode":79,"./dsp/ChannelSplitterNode":111}],87:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioScheduledSourceNode = require("./AudioScheduledSourceNode");
var ConstantSourceNodeDSP = require("./dsp/ConstantSourceNode");

var _require = require("../utils"),
    defaults = _require.defaults;

var _require2 = require("../constants/ChannelCountMode"),
    MAX = _require2.MAX;

var _require3 = require("../constants/AudioParamRate"),
    AUDIO_RATE = _require3.AUDIO_RATE;

var DEFAULT_OFFSET = 1;

var ConstantSourceNode = function (_AudioScheduledSource) {
  _inherits(ConstantSourceNode, _AudioScheduledSource);

  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.offset
   */
  function ConstantSourceNode(context) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, ConstantSourceNode);

    var offset = defaults(opts.offset, DEFAULT_OFFSET);

    var _this = _possibleConstructorReturn(this, (ConstantSourceNode.__proto__ || Object.getPrototypeOf(ConstantSourceNode)).call(this, context, opts, {
      inputs: [1],
      outputs: [1],
      channelCount: 2,
      channelCountMode: MAX
    }));

    _this._offset = _this.addParam(AUDIO_RATE, offset);
    return _this;
  }

  /**
   * @return {AudioParam}
   */


  _createClass(ConstantSourceNode, [{
    key: "getOffset",
    value: function getOffset() {
      return this._offset;
    }
  }]);

  return ConstantSourceNode;
}(AudioScheduledSourceNode);

Object.assign(ConstantSourceNode.prototype, ConstantSourceNodeDSP);

module.exports = ConstantSourceNode;

},{"../constants/AudioParamRate":60,"../constants/ChannelCountMode":62,"../utils":135,"./AudioScheduledSourceNode":81,"./dsp/ConstantSourceNode":112}],88:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("./AudioNode");
var AudioBuffer = require("./AudioBuffer");
var ConvolverNodeDSP = require("./dsp/ConvolverNode");

var _require = require("../utils"),
    defaults = _require.defaults;

var _require2 = require("../utils"),
    toImpl = _require2.toImpl;

var _require3 = require("../constants/ChannelCountMode"),
    CLAMPED_MAX = _require3.CLAMPED_MAX,
    EXPLICIT = _require3.EXPLICIT;

var DEFAULT_DISABLE_NORMALIZATION = false;

var ConvolverNode = function (_AudioNode) {
  _inherits(ConvolverNode, _AudioNode);

  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {boolean}      opts.disableNormalization
   */
  function ConvolverNode(context) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, ConvolverNode);

    var disableNormalization = defaults(opts.disableNormalization, DEFAULT_DISABLE_NORMALIZATION);

    var _this = _possibleConstructorReturn(this, (ConvolverNode.__proto__ || Object.getPrototypeOf(ConvolverNode)).call(this, context, opts, {
      inputs: [1],
      outputs: [1],
      channelCount: 2,
      channelCountMode: CLAMPED_MAX,
      allowedMaxChannelCount: 2,
      allowedChannelCountMode: [CLAMPED_MAX, EXPLICIT]
    }));

    _this._buffer = null;
    _this._audioData = null;
    _this._normalize = !disableNormalization;
    return _this;
  }

  /**
   * @return {AudioBuffer}
   */


  _createClass(ConvolverNode, [{
    key: "getBuffer",
    value: function getBuffer() {
      return this._buffer;
    }

    /**
     * @param {AudioBuffer} value
     */

  }, {
    key: "setBuffer",
    value: function setBuffer(value) {
      value = toImpl(value);

      /* istanbul ignore else */
      if (value instanceof AudioBuffer) {
        this._buffer = value;
        this._audioData = this._buffer.audioData;
      }
    }

    /**
     * @return {boolean}
     */

  }, {
    key: "getNormalize",
    value: function getNormalize() {
      return this._normalize;
    }

    /**
     * @param {boolean} value
     */

  }, {
    key: "setNormalize",
    value: function setNormalize(value) {
      this._normalize = !!value;
    }

    /**
     * @param {number} numberOfChannels
     */

  }, {
    key: "channelDidUpdate",
    value: function channelDidUpdate(numberOfChannels) {
      numberOfChannels = Math.min(numberOfChannels, 2);

      this.outputs[0].setNumberOfChannels(numberOfChannels);
    }
  }]);

  return ConvolverNode;
}(AudioNode);

Object.assign(ConvolverNode.prototype, ConvolverNodeDSP);

module.exports = ConvolverNode;

},{"../constants/ChannelCountMode":62,"../utils":135,"./AudioBuffer":74,"./AudioNode":79,"./dsp/ConvolverNode":113}],89:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("./AudioNode");
var DelayNodeDSP = require("./dsp/DelayNode");

var _require = require("../utils"),
    defaults = _require.defaults;

var _require2 = require("../utils"),
    toNumber = _require2.toNumber;

var _require3 = require("../constants/ChannelCountMode"),
    MAX = _require3.MAX;

var _require4 = require("../constants/AudioParamRate"),
    AUDIO_RATE = _require4.AUDIO_RATE;

var DEFAULT_MAX_DELAY_TIME = 1;
var DEFAULT_DELAY_TIME = 0;

var DelayNode = function (_AudioNode) {
  _inherits(DelayNode, _AudioNode);

  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.maxDelayTime
   * @param {number}       opts.delayTime
   */
  function DelayNode(context) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, DelayNode);

    var maxDelayTime = defaults(opts.maxDelayTime, DEFAULT_MAX_DELAY_TIME);
    var delayTime = defaults(opts.delayTime, DEFAULT_DELAY_TIME);

    maxDelayTime = Math.max(0, toNumber(maxDelayTime));
    delayTime = Math.min(delayTime, maxDelayTime);

    var _this = _possibleConstructorReturn(this, (DelayNode.__proto__ || Object.getPrototypeOf(DelayNode)).call(this, context, opts, {
      inputs: [1],
      outputs: [1],
      channelCount: 2,
      channelCountMode: MAX
    }));

    _this._maxDelayTime = maxDelayTime;
    _this._delayTime = _this.addParam(AUDIO_RATE, delayTime);

    _this.dspInit(_this._maxDelayTime);
    _this.dspUpdateKernel(1);
    return _this;
  }

  /**
   * @return {number}
   */


  _createClass(DelayNode, [{
    key: "getDelayTime",
    value: function getDelayTime() {
      return this._delayTime;
    }

    /**
     * @return {number}
     */

  }, {
    key: "getMaxDelayTime",
    value: function getMaxDelayTime() {
      return this._maxDelayTime;
    }

    /**
     * @param {number} numberOfChannels
     */

  }, {
    key: "channelDidUpdate",
    value: function channelDidUpdate(numberOfChannels) {
      this.dspUpdateKernel(numberOfChannels);
      this.outputs[0].setNumberOfChannels(numberOfChannels);
    }

    /**
     * @return {number}
     */

  }, {
    key: "getTailTime",
    value: function getTailTime() {
      return this._maxDelayTime;
    }
  }]);

  return DelayNode;
}(AudioNode);

Object.assign(DelayNode.prototype, DelayNodeDSP);

module.exports = DelayNode;

},{"../constants/AudioParamRate":60,"../constants/ChannelCountMode":62,"../utils":135,"./AudioNode":79,"./dsp/DelayNode":114}],90:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("./AudioNode");
var DynamicsCompressorNodeDSP = require("./dsp/DynamicsCompressorNode");

var _require = require("../utils"),
    defaults = _require.defaults;

var _require2 = require("../constants/ChannelCountMode"),
    EXPLICIT = _require2.EXPLICIT;

var _require3 = require("../constants/AudioParamRate"),
    CONTROL_RATE = _require3.CONTROL_RATE;

var DEFAULT_THRESHOLD = -24;
var DEFAULT_KNEE = 30;
var DEFAULT_RATIO = 12;
var DEFAULT_ATTACK = 0.003;
var DEFAULT_RELEASE = 0.25;

var DynamicsCompressorNode = function (_AudioNode) {
  _inherits(DynamicsCompressorNode, _AudioNode);

  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.threshold
   * @param {number}       opts.knee
   * @param {number}       opts.ratio
   * @param {number}       opts.attack
   * @param {number}       opts.release
   */
  function DynamicsCompressorNode(context) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, DynamicsCompressorNode);

    var threshold = defaults(opts.threshold, DEFAULT_THRESHOLD);
    var knee = defaults(opts.knee, DEFAULT_KNEE);
    var ratio = defaults(opts.ratio, DEFAULT_RATIO);
    var attack = defaults(opts.attack, DEFAULT_ATTACK);
    var release = defaults(opts.release, DEFAULT_RELEASE);

    var _this = _possibleConstructorReturn(this, (DynamicsCompressorNode.__proto__ || Object.getPrototypeOf(DynamicsCompressorNode)).call(this, context, opts, {
      inputs: [1],
      outputs: [2],
      channelCount: 2,
      channelCountMode: EXPLICIT
    }));

    _this._threshold = _this.addParam(CONTROL_RATE, threshold);
    _this._knee = _this.addParam(CONTROL_RATE, knee);
    _this._ratio = _this.addParam(CONTROL_RATE, ratio);
    _this._attack = _this.addParam(CONTROL_RATE, attack);
    _this._release = _this.addParam(CONTROL_RATE, release);
    return _this;
  }

  /**
   * @param {AudioParam}
   */


  _createClass(DynamicsCompressorNode, [{
    key: "getThreshold",
    value: function getThreshold() {
      return this._threshold;
    }

    /**
     * @param {AudioParam}
     */

  }, {
    key: "getKnee",
    value: function getKnee() {
      return this._knee;
    }

    /**
     * @param {AudioParam}
     */

  }, {
    key: "getRatio",
    value: function getRatio() {
      return this._ratio;
    }

    /**
     * @return {number}
     */
    /* istanbul ignore next */

  }, {
    key: "getReduction",
    value: function getReduction() {
      throw new TypeError("NOT YET IMPLEMENTED");
    }

    /**
     * @param {AudioParam}
     */

  }, {
    key: "getAttack",
    value: function getAttack() {
      return this._attack;
    }

    /**
     * @param {AudioParam}
     */

  }, {
    key: "getRelease",
    value: function getRelease() {
      return this._release;
    }
  }]);

  return DynamicsCompressorNode;
}(AudioNode);

Object.assign(DynamicsCompressorNode.prototype, DynamicsCompressorNodeDSP);

module.exports = DynamicsCompressorNode;

},{"../constants/AudioParamRate":60,"../constants/ChannelCountMode":62,"../utils":135,"./AudioNode":79,"./dsp/DynamicsCompressorNode":115}],91:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var events = require("events");

var EventTarget = function () {
  function EventTarget() {
    _classCallCheck(this, EventTarget);

    this._emitter = new events.EventEmitter();
  }

  /**
   * @param {string}   type
   * @param {function} listener
   */


  _createClass(EventTarget, [{
    key: "addEventListener",
    value: function addEventListener(type, listener) {
      /* istanbul ignore else */
      if (typeof listener === "function") {
        this._emitter.addListener(type, listener);
      }
    }

    /**
     * @param {string}   type
     * @param {function} listener
     */

  }, {
    key: "removeEventListener",
    value: function removeEventListener(type, listener) {
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

  }, {
    key: "replaceEventListener",
    value: function replaceEventListener(type, oldListener, newListener) {
      this.removeEventListener(type, oldListener);
      this.addEventListener(type, newListener);
    }

    /**
     * @param {object} event
     * @param {string} event.type
     */

  }, {
    key: "dispatchEvent",
    value: function dispatchEvent(event) {
      this._emitter.emit(event.type, event);
    }
  }]);

  return EventTarget;
}();

module.exports = EventTarget;

},{"events":18}],92:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("./AudioNode");
var GainNodeDSP = require("./dsp/GainNode");

var _require = require("../utils"),
    defaults = _require.defaults;

var _require2 = require("../constants/ChannelCountMode"),
    MAX = _require2.MAX;

var _require3 = require("../constants/AudioParamRate"),
    AUDIO_RATE = _require3.AUDIO_RATE;

var DEFAULT_GAIN = 1;

var GainNode = function (_AudioNode) {
  _inherits(GainNode, _AudioNode);

  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.gain
   */
  function GainNode(context) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, GainNode);

    var gain = defaults(opts.gain, DEFAULT_GAIN);

    var _this = _possibleConstructorReturn(this, (GainNode.__proto__ || Object.getPrototypeOf(GainNode)).call(this, context, opts, {
      inputs: [1],
      outputs: [1],
      channelCount: 2,
      channelCountMode: MAX
    }));

    _this._gain = _this.addParam(AUDIO_RATE, gain);
    return _this;
  }

  /**
   * @return {AudioParam}
   */


  _createClass(GainNode, [{
    key: "getGain",
    value: function getGain() {
      return this._gain;
    }

    /**
     * @param {number} numberOfChannels
     */

  }, {
    key: "channelDidUpdate",
    value: function channelDidUpdate(numberOfChannels) {
      this.outputs[0].setNumberOfChannels(numberOfChannels);
    }
  }]);

  return GainNode;
}(AudioNode);

Object.assign(GainNode.prototype, GainNodeDSP);

module.exports = GainNode;

},{"../constants/AudioParamRate":60,"../constants/ChannelCountMode":62,"../utils":135,"./AudioNode":79,"./dsp/GainNode":116}],93:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("./AudioNode");
var IIRFilterNodeDSP = require("./dsp/IIRFilterNode");

var _require = require("../utils"),
    defaults = _require.defaults;

var _require2 = require("../constants/ChannelCountMode"),
    MAX = _require2.MAX;

var IIRFilterNode = function (_AudioNode) {
  _inherits(IIRFilterNode, _AudioNode);

  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {Float32Array} opts.feedforward
   * @param {Float32Array} opts.feedback
   */
  function IIRFilterNode(context) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, IIRFilterNode);

    var feedforward = defaults(opts.feedforward, [0]);
    var feedback = defaults(opts.feedback, [1]);

    var _this = _possibleConstructorReturn(this, (IIRFilterNode.__proto__ || Object.getPrototypeOf(IIRFilterNode)).call(this, context, opts, {
      inputs: [1],
      outputs: [1],
      channelCount: 2,
      channelCountMode: MAX
    }));

    _this._feedforward = feedforward;
    _this._feedback = feedback;

    _this.dspInit();
    _this.dspUpdateKernel(1);
    return _this;
  }

  /**
   * @param {Float32Array} frequencyHz
   * @param {Float32Array} magResponse
   * @param {Float32Array} phaseResponse
   */


  _createClass(IIRFilterNode, [{
    key: "getFrequencyResponse",
    value: function getFrequencyResponse(frequencyHz, magResponse, phaseResponse) {
      this.dspGetFrequencyResponse(frequencyHz, magResponse, phaseResponse);
    }

    /**
     * @return {Float32Array}
     */

  }, {
    key: "getFeedforward",
    value: function getFeedforward() {
      return this._feedforward;
    }

    /**
     * @return {Float32Array}
     */

  }, {
    key: "getFeedback",
    value: function getFeedback() {
      return this._feedback;
    }

    /**
     * @param {number} numberOfChannels
     */

  }, {
    key: "channelDidUpdate",
    value: function channelDidUpdate(numberOfChannels) {
      this.dspUpdateKernel(numberOfChannels);
      this.outputs[0].setNumberOfChannels(numberOfChannels);
    }
  }]);

  return IIRFilterNode;
}(AudioNode);

Object.assign(IIRFilterNode.prototype, IIRFilterNodeDSP);

module.exports = IIRFilterNode;

},{"../constants/ChannelCountMode":62,"../utils":135,"./AudioNode":79,"./dsp/IIRFilterNode":118}],94:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioScheduledSourceNode = require("./AudioScheduledSourceNode");
var PeriodicWave = require("./PeriodicWave");
var OscillatorNodeDSP = require("./dsp/OscillatorNode");

var _require = require("../utils"),
    defaults = _require.defaults;

var _require2 = require("../utils"),
    toImpl = _require2.toImpl;

var _require3 = require("../constants/AudioParamRate"),
    AUDIO_RATE = _require3.AUDIO_RATE;

var _require4 = require("../constants/OscillatorType"),
    SINE = _require4.SINE,
    SAWTOOTH = _require4.SAWTOOTH,
    TRIANGLE = _require4.TRIANGLE,
    SQUARE = _require4.SQUARE,
    CUSTOM = _require4.CUSTOM;

var DefaultPeriodicWaves = {};
var allowedOscillatorTypes = [SINE, SAWTOOTH, TRIANGLE, SQUARE];

var DEFAULT_TYPE = SINE;
var DEFAULT_FREQUENCY = 440;
var DEFAULT_DETUNE = 0;

var OscillatorNode = function (_AudioScheduledSource) {
  _inherits(OscillatorNode, _AudioScheduledSource);

  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {string}       opts.type
   * @param {number}       opts.frequency
   * @param {number}       opts.detune
   */
  function OscillatorNode(context) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, OscillatorNode);

    var type = defaults(opts.type, DEFAULT_TYPE);
    var frequency = defaults(opts.frequency, DEFAULT_FREQUENCY);
    var detune = defaults(opts.detune, DEFAULT_DETUNE);

    var _this = _possibleConstructorReturn(this, (OscillatorNode.__proto__ || Object.getPrototypeOf(OscillatorNode)).call(this, context, opts));

    _this._frequency = _this.addParam(AUDIO_RATE, frequency);
    _this._detune = _this.addParam(AUDIO_RATE, detune);
    _this._type = type;
    _this._periodicWave = _this.buildPeriodicWave(_this._type);
    _this._waveTable = null;

    _this.dspInit();
    return _this;
  }

  /**
   * @return {string}
   */


  _createClass(OscillatorNode, [{
    key: "getType",
    value: function getType() {
      return this._type;
    }

    /**
     * @param {string} value
     */

  }, {
    key: "setType",
    value: function setType(value) {
      /* istanbul ignore else */
      if (allowedOscillatorTypes.indexOf(value) !== -1) {
        this._type = value;
        this._periodicWave = this.buildPeriodicWave(value);
        this._waveTable = this._periodicWave.getWaveTable();
      }
    }

    /**
     * @param {AudioParam}
     */

  }, {
    key: "getFrequency",
    value: function getFrequency() {
      return this._frequency;
    }

    /**
     * @param {AudioParam}
     */

  }, {
    key: "getDetune",
    value: function getDetune() {
      return this._detune;
    }

    /**
     * @param {PeriodicWave} periodicWave
     */

  }, {
    key: "setPeriodicWave",
    value: function setPeriodicWave(periodicWave) {
      periodicWave = toImpl(periodicWave);

      /* istanbul ignore else */
      if (periodicWave instanceof PeriodicWave) {
        this._type = CUSTOM;
        this._periodicWave = periodicWave;
        this._waveTable = this._periodicWave.getWaveTable();
      }
    }

    /**
     * @return {PeriodicWave}
     */

  }, {
    key: "getPeriodicWave",
    value: function getPeriodicWave() {
      return this._periodicWave;
    }

    /**
     * @param {string} type
     * @return {PeriodicWave}
     */

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
}(AudioScheduledSourceNode);

Object.assign(OscillatorNode.prototype, OscillatorNodeDSP);

module.exports = OscillatorNode;

},{"../constants/AudioParamRate":60,"../constants/OscillatorType":64,"../utils":135,"./AudioScheduledSourceNode":81,"./PeriodicWave":96,"./dsp/OscillatorNode":119}],95:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BasePannerNode = require("./BasePannerNode");
var PannerNodeDSP = require("./dsp/PannerNode");

var PannerNode = function (_BasePannerNode) {
  _inherits(PannerNode, _BasePannerNode);

  /**
   * @param {AudioContext} context
   */
  function PannerNode(context, opts) {
    _classCallCheck(this, PannerNode);

    return _possibleConstructorReturn(this, (PannerNode.__proto__ || Object.getPrototypeOf(PannerNode)).call(this, context, opts));
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {number} z
   */
  /* istanbul ignore next */


  _createClass(PannerNode, [{
    key: "setPosition",
    value: function setPosition() {
      throw new TypeError("NOT YET IMPLEMENTED");
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    /* istanbul ignore next */

  }, {
    key: "setOrientation",
    value: function setOrientation() {
      throw new TypeError("NOT YET IMPLEMENTED");
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    /* istanbul ignore next */

  }, {
    key: "setVelocity",
    value: function setVelocity() {
      throw new TypeError("NOT YET IMPLEMENTED");
    }
  }]);

  return PannerNode;
}(BasePannerNode);

Object.assign(PannerNode.prototype, PannerNodeDSP);

module.exports = PannerNode;

},{"./BasePannerNode":83,"./dsp/PannerNode":120}],96:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var nmap = require("nmap");
var PeriodicWaveDSP = require("./dsp/PeriodicWave");

var _require = require("../constants/OscillatorType"),
    SINE = _require.SINE,
    SAWTOOTH = _require.SAWTOOTH,
    TRIANGLE = _require.TRIANGLE,
    SQUARE = _require.SQUARE,
    CUSTOM = _require.CUSTOM;

var PeriodicWave = function () {
  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {Float32Array} opts.real
   * @param {Float32Array} opts.imag
   * @param {boolean}      opts.constraints
   */
  function PeriodicWave(context) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, PeriodicWave);

    var real = opts.real;
    var imag = opts.imag;
    var constraints = opts.constraints;

    this.context = context;
    this._real = real;
    this._imag = imag;
    this._constants = !!constraints;
    this._name = CUSTOM;

    this.dspInit();
  }

  /**
   * @return {Float32Array}
   */


  _createClass(PeriodicWave, [{
    key: "getReal",
    value: function getReal() {
      return this._real;
    }

    /**
     * @return {Float32Array}
     */

  }, {
    key: "getImag",
    value: function getImag() {
      return this._imag;
    }

    /**
     * @return {booleam}
     */

  }, {
    key: "getConstraints",
    value: function getConstraints() {
      return this._constants;
    }

    /**
     * @return {string}
     */

  }, {
    key: "getName",
    value: function getName() {
      return this._name;
    }

    /**
     * @return {Float32Array}
     */

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
        case SINE:
          this._real = new Float32Array([0, 0]);
          this._imag = new Float32Array([0, 1]);
          this._name = SINE;
          break;
        case SAWTOOTH:
          this._real = new Float32Array(length);
          this._imag = new Float32Array(nmap(length, function (_, n) {
            return n === 0 ? 0 : Math.pow(-1, n + 1) * (2 / (n * Math.PI));
          }));
          this._name = SAWTOOTH;
          this.dspBuildWaveTable();
          break;
        case TRIANGLE:
          this._real = new Float32Array(length);
          this._imag = new Float32Array(nmap(length, function (_, n) {
            return n === 0 ? 0 : 8 * Math.sin(n * Math.PI / 2) / Math.pow(n * Math.PI, 2);
          }));
          this._name = TRIANGLE;
          this.dspBuildWaveTable();
          break;
        case SQUARE:
          this._real = new Float32Array(length);
          this._imag = new Float32Array(nmap(length, function (_, n) {
            return n === 0 ? 0 : 2 / (n * Math.PI) * (1 - Math.pow(-1, n));
          }));
          this._name = SQUARE;
          this.dspBuildWaveTable();
          break;
        default:
          this._real = new Float32Array([0]);
          this._imag = new Float32Array([0]);
          this._name = CUSTOM;
          this.dspBuildWaveTable();
          break;
      }
    }
  }]);

  return PeriodicWave;
}();

Object.assign(PeriodicWave.prototype, PeriodicWaveDSP);

module.exports = PeriodicWave;

},{"../constants/OscillatorType":64,"./dsp/PeriodicWave":121,"nmap":25}],97:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("./AudioNode");
var ScriptProcessorNodeDSP = require("./dsp/ScriptProcessorNode");

var _require = require("../utils"),
    defaults = _require.defaults,
    clamp = _require.clamp;

var _require2 = require("../utils"),
    toPowerOfTwo = _require2.toPowerOfTwo,
    toValidNumberOfChannels = _require2.toValidNumberOfChannels;

var _require3 = require("../constants/ChannelCountMode"),
    EXPLICIT = _require3.EXPLICIT;

var DEFAULT_BUFFER_SIZE = 1024;
var DEFAULT_NUMBER_OF_INPUT_CHANNELS = 1;
var DEFAULT_NUMBER_OF_OUTPUT_CHANNELS = 1;
var MIN_BUFFER_SIZE = 256;
var MAX_BUFFER_SIZE = 16384;

var ScriptProcessorNode = function (_AudioNode) {
  _inherits(ScriptProcessorNode, _AudioNode);

  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.bufferSize
   * @param {number}       opts.numberOfInputChannels
   * @param {number}       opts.numberOfOutputChannels
   */
  function ScriptProcessorNode(context) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, ScriptProcessorNode);

    var bufferSize = defaults(opts.bufferSize, DEFAULT_BUFFER_SIZE);
    var numberOfInputChannels = defaults(opts.numberOfInputChannels, DEFAULT_NUMBER_OF_INPUT_CHANNELS);
    var numberOfOutputChannels = defaults(opts.numberOfOutputChannels, DEFAULT_NUMBER_OF_OUTPUT_CHANNELS);

    bufferSize = clamp(bufferSize | 0, MIN_BUFFER_SIZE, MAX_BUFFER_SIZE);
    bufferSize = toPowerOfTwo(bufferSize, Math.ceil);
    numberOfInputChannels = toValidNumberOfChannels(numberOfInputChannels);
    numberOfOutputChannels = toValidNumberOfChannels(numberOfOutputChannels);

    var _this = _possibleConstructorReturn(this, (ScriptProcessorNode.__proto__ || Object.getPrototypeOf(ScriptProcessorNode)).call(this, context, opts, {
      inputs: [numberOfInputChannels],
      outputs: [numberOfOutputChannels],
      channelCount: numberOfInputChannels,
      channelCountMode: EXPLICIT,
      allowedMaxChannelCount: numberOfInputChannels,
      allowedMinChannelCount: numberOfInputChannels,
      allowedChannelCountMode: [EXPLICIT]
    }));

    _this._bufferSize = bufferSize;

    _this.enableOutputsIfNecessary();
    _this.dspInit();
    return _this;
  }

  /**
   * @return {number}
   */


  _createClass(ScriptProcessorNode, [{
    key: "getBufferSize",
    value: function getBufferSize() {
      return this._bufferSize;
    }

    /**
     * @return {object} eventItem
     */

  }, {
    key: "setEventItem",
    value: function setEventItem(eventItem) {
      this.dspSetEventItem(eventItem);
    }

    /**
     * @return {number}
     */

  }, {
    key: "getTailTime",
    value: function getTailTime() {
      return Infinity;
    }
  }]);

  return ScriptProcessorNode;
}(AudioNode);

Object.assign(ScriptProcessorNode.prototype, ScriptProcessorNodeDSP);

module.exports = ScriptProcessorNode;

},{"../constants/ChannelCountMode":62,"../utils":135,"./AudioNode":79,"./dsp/ScriptProcessorNode":122}],98:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BasePannerNode = require("./BasePannerNode");
var SpatialPannerNodeDSP = require("./dsp/SpatialPannerNode");

var _require = require("../constants/AudioParamRate"),
    AUDIO_RATE = _require.AUDIO_RATE;

var SpatialPannerNode = function (_BasePannerNode) {
  _inherits(SpatialPannerNode, _BasePannerNode);

  /**
   * @param {AudioContext}
   */
  function SpatialPannerNode(context, opts) {
    _classCallCheck(this, SpatialPannerNode);

    var _this = _possibleConstructorReturn(this, (SpatialPannerNode.__proto__ || Object.getPrototypeOf(SpatialPannerNode)).call(this, context, opts));

    _this._positionX = _this.addParam(AUDIO_RATE, 0);
    _this._positionY = _this.addParam(AUDIO_RATE, 0);
    _this._positionZ = _this.addParam(AUDIO_RATE, 0);
    _this._orientationX = _this.addParam(AUDIO_RATE, 0);
    _this._orientationY = _this.addParam(AUDIO_RATE, 0);
    _this._orientationZ = _this.addParam(AUDIO_RATE, 0);
    return _this;
  }

  /**
   * @param {AudioParam}
   */


  _createClass(SpatialPannerNode, [{
    key: "getPositionX",
    value: function getPositionX() {
      return this._positionX;
    }

    /**
     * @param {AudioParam}
     */

  }, {
    key: "getPositionY",
    value: function getPositionY() {
      return this._positionY;
    }

    /**
     * @param {AudioParam}
     */

  }, {
    key: "getPositionZ",
    value: function getPositionZ() {
      return this._positionZ;
    }

    /**
     * @param {AudioParam}
     */

  }, {
    key: "getOrientationX",
    value: function getOrientationX() {
      return this._positionX;
    }

    /**
     * @param {AudioParam}
     */

  }, {
    key: "getOrientationY",
    value: function getOrientationY() {
      return this._positionY;
    }

    /**
     * @param {AudioParam}
     */

  }, {
    key: "getOrientationZ",
    value: function getOrientationZ() {
      return this._positionZ;
    }
  }]);

  return SpatialPannerNode;
}(BasePannerNode);

Object.assign(SpatialPannerNode.prototype, SpatialPannerNodeDSP);

module.exports = SpatialPannerNode;

},{"../constants/AudioParamRate":60,"./BasePannerNode":83,"./dsp/SpatialPannerNode":123}],99:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BasePannerNode = require("./BasePannerNode");
var StereoPannerNodeDSP = require("./dsp/StereoPannerNode");

var _require = require("../utils"),
    defaults = _require.defaults;

var _require2 = require("../constants/AudioParamRate"),
    AUDIO_RATE = _require2.AUDIO_RATE;

var DEFAULT_PAN = 0;

var StereoPannerNode = function (_BasePannerNode) {
  _inherits(StereoPannerNode, _BasePannerNode);

  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {number}       opts.pan
   */
  function StereoPannerNode(context) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, StereoPannerNode);

    var pan = defaults(opts.pan, DEFAULT_PAN);

    var _this = _possibleConstructorReturn(this, (StereoPannerNode.__proto__ || Object.getPrototypeOf(StereoPannerNode)).call(this, context, opts));

    _this._pan = _this.addParam(AUDIO_RATE, pan);
    return _this;
  }

  /**
   * @param {AudioParam}
   */


  _createClass(StereoPannerNode, [{
    key: "getPan",
    value: function getPan() {
      return this._pan;
    }
  }]);

  return StereoPannerNode;
}(BasePannerNode);

Object.assign(StereoPannerNode.prototype, StereoPannerNodeDSP);

module.exports = StereoPannerNode;

},{"../constants/AudioParamRate":60,"../utils":135,"./BasePannerNode":83,"./dsp/StereoPannerNode":124}],100:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AudioNode = require("./AudioNode");
var WaveShaperNodeDSP = require("./dsp/WaveShaperNode");

var _require = require("../utils"),
    defaults = _require.defaults;

var _require2 = require("../constants/ChannelCountMode"),
    MAX = _require2.MAX;

var OverSampleTypes = ["none", "2x", "4x"];

var DEFAULT_CURVE = null;
var DEFAULT_OVERSAMPLE = "none";

var WaveShaperNode = function (_AudioNode) {
  _inherits(WaveShaperNode, _AudioNode);

  /**
   * @param {AudioContext} context
   * @param {object}       opts
   * @param {Float32Arrat} opts.curve
   * @param {string}       opts.overSample
   */
  function WaveShaperNode(context) {
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, WaveShaperNode);

    var curve = defaults(opts.curve, DEFAULT_CURVE);
    var overSample = defaults(opts.overSample, DEFAULT_OVERSAMPLE);

    var _this = _possibleConstructorReturn(this, (WaveShaperNode.__proto__ || Object.getPrototypeOf(WaveShaperNode)).call(this, context, opts, {
      inputs: [1],
      outputs: [1],
      channelCount: 2,
      channelCountMode: MAX
    }));

    _this._curve = curve;
    _this._overSample = overSample;

    _this.dspInit();
    _this.dspUpdateKernel(null, 1);
    return _this;
  }

  /**
   * @return {Float32Array}
   */


  _createClass(WaveShaperNode, [{
    key: "getCurve",
    value: function getCurve() {
      return this._curve;
    }

    /**
     * @param {Float32Array} value
     */

  }, {
    key: "setCurve",
    value: function setCurve(value) {
      /* istanbul ignore else */
      if (value === null || value instanceof Float32Array) {
        this._curve = value;
        this.dspUpdateKernel(this._curve, this.outputs[0].getNumberOfChannels());
      }
    }

    /**
     * @return {boolean}
     */

  }, {
    key: "getOversample",
    value: function getOversample() {
      return this._overSample;
    }

    /**
     * @param {boolean} value
     */

  }, {
    key: "setOversample",
    value: function setOversample(value) {
      /* istanbul ignore else */
      if (OverSampleTypes.indexOf(value) !== -1) {
        this._overSample = value;
      }
    }

    /**
     * @param {number} numberOfChannels
     */

  }, {
    key: "channelDidUpdate",
    value: function channelDidUpdate(numberOfChannels) {
      this.dspUpdateKernel(this._curve, numberOfChannels);
      this.outputs[0].setNumberOfChannels(numberOfChannels);
    }
  }]);

  return WaveShaperNode;
}(AudioNode);

Object.assign(WaveShaperNode.prototype, WaveShaperNodeDSP);

module.exports = WaveShaperNode;

},{"../constants/ChannelCountMode":62,"../utils":135,"./AudioNode":79,"./dsp/WaveShaperNode":125}],101:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AudioData = require("./AudioData");

var _require = require("../../utils"),
    fill = _require.fill;

var _require2 = require("../../constants/ChannelInterpretation"),
    DISCRETE = _require2.DISCRETE;

var DSPAlgorithm = {};

/**
 * @prop {AudioData} audioData
 * @prop {boolean}   isSilent
 */

var AudioBus = function () {
  /**
   * @param {number} numberOfChannels
   * @param {number} length
   * @param {number} sampleRate
   */
  function AudioBus(numberOfChannels, length, sampleRate) {
    _classCallCheck(this, AudioBus);

    this.audioData = new AudioData(numberOfChannels, length, sampleRate);
    this.isSilent = true;
    this.channelInterpretation = DISCRETE;
  }

  /**
   * @return {string} [ SPEAKERS, DISCRETE ]
   */


  _createClass(AudioBus, [{
    key: "getChannelInterpretation",
    value: function getChannelInterpretation() {
      return this.channelInterpretation;
    }

    /**
     * @param {string} value - [ SPEAKERS, DISCRETE ]
     */

  }, {
    key: "setChannelInterpretation",
    value: function setChannelInterpretation(value) {
      this.channelInterpretation = value;
    }

    /**
     * @return {number}
     */

  }, {
    key: "getNumberOfChannels",
    value: function getNumberOfChannels() {
      return this.audioData.numberOfChannels;
    }

    /**
     * @param {number} numberOfChannels
     */

  }, {
    key: "setNumberOfChannels",
    value: function setNumberOfChannels(numberOfChannels) {
      var audioBus = new AudioBus(numberOfChannels, this.getLength(), this.getSampleRate());

      audioBus.channelInterpretation = this.channelInterpretation;
      audioBus.sumFrom(this);

      this.audioData = audioBus.audioData;
    }

    /**
     * @return {number}
     */

  }, {
    key: "getLength",
    value: function getLength() {
      return this.audioData.length;
    }

    /**
     * @return {number}
     */

  }, {
    key: "getSampleRate",
    value: function getSampleRate() {
      return this.audioData.sampleRate;
    }

    /**
     * @return {Float32Array[]}
     */

  }, {
    key: "getChannelData",
    value: function getChannelData() {
      return this.audioData.channelData;
    }

    /**
     * @return {Float32Array[]}
     */

  }, {
    key: "getMutableData",
    value: function getMutableData() {
      this.isSilent = false;
      return this.audioData.channelData;
    }

    /**
     *
     */

  }, {
    key: "zeros",
    value: function zeros() {
      /* istanbul ignore else */
      if (!this.isSilent) {
        var channelData = this.audioData.channelData;

        for (var i = 0, imax = channelData.length; i < imax; i++) {
          fill(channelData[i], 0);
        }
      }
      this.isSilent = true;
    }

    /**
     * @param {AudioBus} audioBus
     */

  }, {
    key: "copyFrom",
    value: function copyFrom(audioBus) {
      var source = audioBus.audioData.channelData;
      var destination = this.audioData.channelData;
      var numberOfChannels = destination.length;

      for (var ch = 0; ch < numberOfChannels; ch++) {
        destination[ch].set(source[ch]);
      }

      this.isSilent = audioBus.isSilent;
    }

    /**
     * @param {AudioBus} audioBus
     * @param {number}   offset
     */

  }, {
    key: "copyFromWithOffset",
    value: function copyFromWithOffset(audioBus, offset) {
      var source = audioBus.audioData.channelData;
      var destination = this.audioData.channelData;
      var numberOfChannels = destination.length;

      offset = offset | 0;

      for (var ch = 0; ch < numberOfChannels; ch++) {
        destination[ch].set(source[ch], offset);
      }

      this.isSilent = this.isSilent && audioBus.isSilent;
    }

    /**
     * @param {AudioBus} audioBus
     */

  }, {
    key: "sumFrom",
    value: function sumFrom(audioBus) {

      /* istanbul ignore next */
      if (audioBus.isSilent) {
        return;
      }

      var source = audioBus.audioData.channelData;
      var destination = this.audioData.channelData;

      this._sumFrom(source, destination, audioBus.getLength());
    }

    /**
     * @param {AudioBus} audioBus
     * @param {number}   offset
     */

  }, {
    key: "sumFromWithOffset",
    value: function sumFromWithOffset(audioBus, offset) {

      /* istanbul ignore next */
      if (audioBus.isSilent) {
        return;
      }

      offset = offset | 0;

      var source = audioBus.audioData.channelData;
      var destination = this.audioData.channelData.map(function (data) {
        return data.subarray(offset);
      });

      this._sumFrom(source, destination, audioBus.getLength());
    }

    /**
     * @private
     */

  }, {
    key: "_sumFrom",
    value: function _sumFrom(source, destination, length) {
      var mixFunction = void 0;
      var algoIndex = source.length * 1000 + destination.length;

      if (this.channelInterpretation === DISCRETE) {
        algoIndex += 2000000;
      } else {
        algoIndex += 1000000;
      }

      mixFunction = DSPAlgorithm[algoIndex] || DSPAlgorithm[0];

      if (this.isSilent && mixFunction.set) {
        mixFunction = mixFunction.set;
      }

      mixFunction(source, destination, length);

      this.isSilent = false;
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

module.exports = AudioBus;

},{"../../constants/ChannelInterpretation":63,"../../utils":135,"./AudioData":102}],102:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var nmap = require("nmap");

/**
 * AudioData is struct like AudioBuffer.
 * This instance has no methods.
 * The channel data of this instance are taken via property accessor.
 * @prop {number}         numberOfChannels
 * @prop {number}         length
 * @prop {number}         sampleRate
 * @prop {Float32Array[]} channelData
 */

var AudioData =
/**
 * @param {number} numberOfChannels
 * @param {number} length
 * @param {number} sampleRate
 */
function AudioData(numberOfChannels, length, sampleRate) {
  var _this = this;

  _classCallCheck(this, AudioData);

  this.numberOfChannels = numberOfChannels | 0;
  this.length = length | 0;
  this.sampleRate = sampleRate | 0;
  this.channelData = nmap(this.numberOfChannels, function () {
    return new Float32Array(_this.length);
  });
};

module.exports = AudioData;

},{"nmap":25}],103:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AudioBus = require("./AudioBus");

var _require = require("../../utils"),
    toValidNumberOfChannels = _require.toValidNumberOfChannels;

var _require2 = require("../../constants/ChannelCountMode"),
    CLAMPED_MAX = _require2.CLAMPED_MAX,
    EXPLICIT = _require2.EXPLICIT;

var _require3 = require("../../constants/ChannelInterpretation"),
    SPEAKERS = _require3.SPEAKERS;

/**
 * @prop {AudioNode} node
 * @prop {number}    index
 * @prop {AudioBus}  bus
 */


var AudioNodeInput = function () {
  /**
   * @param {object}    opts
   * @param {AudioNode} opts.node
   * @param {number}    opts.index
   * @param {number}    opts.numberOfChannels
   * @param {number}    opts.channelCount
   * @param {string}    opts.channelCountMode
   */
  function AudioNodeInput(opts) {
    _classCallCheck(this, AudioNodeInput);

    var node = opts.node;
    var index = opts.index;
    var numberOfChannels = opts.numberOfChannels;
    var channelCount = opts.channelCount;
    var channelCountMode = opts.channelCountMode;

    this.node = node;
    this.index = index | 0;
    this.bus = new AudioBus(numberOfChannels, node.blockSize, node.sampleRate);

    this.bus.setChannelInterpretation(SPEAKERS);
    this.outputs = [];
    this._disabledOutputs = new WeakSet();
    this._channelCount = channelCount | 0;
    this._channelCountMode = channelCountMode;
  }

  /**
   * @return {number}
   */


  _createClass(AudioNodeInput, [{
    key: "getChannelCount",
    value: function getChannelCount() {
      return this._channelCount;
    }

    /**
     * @param {number} value
     */

  }, {
    key: "setChannelCount",
    value: function setChannelCount(value) {
      var channelCount = toValidNumberOfChannels(value);

      /* istanbul ignore else */
      if (channelCount !== this._channelCount) {
        this._channelCount = channelCount;
        this.updateNumberOfChannels();
      }
    }

    /**
     * @return {number}
     */

  }, {
    key: "getChannelCountMode",
    value: function getChannelCountMode() {
      return this._channelCountMode;
    }

    /**
     * @param {number} value
     */

  }, {
    key: "setChannelCountMode",
    value: function setChannelCountMode(value) {
      /* istanbul ignore else */
      if (value !== this._channelCountMode) {
        this._channelCountMode = value;
        this.updateNumberOfChannels();
      }
    }

    /**
     * @return {string}
     */

  }, {
    key: "getChannelInterpretation",
    value: function getChannelInterpretation() {
      return this.bus.getChannelInterpretation();
    }

    /**
     * @param {string} value
     */

  }, {
    key: "setChannelInterpretation",
    value: function setChannelInterpretation(value) {
      this.bus.setChannelInterpretation(value);
    }

    /**
     * @return {number}
     */

  }, {
    key: "getNumberOfChannels",
    value: function getNumberOfChannels() {
      return this.bus.getNumberOfChannels();
    }

    /**
     *
     */

  }, {
    key: "computeNumberOfChannels",
    value: function computeNumberOfChannels() {
      if (this._channelCountMode === EXPLICIT) {
        return this._channelCount;
      }

      var maxChannels = this.outputs.reduce(function (maxChannels, output) {
        return Math.max(maxChannels, output.getNumberOfChannels());
      }, 1);

      if (this._channelCountMode === CLAMPED_MAX) {
        return Math.min(this._channelCount, maxChannels);
      }

      return maxChannels;
    }

    /**
     *
     */

  }, {
    key: "updateNumberOfChannels",
    value: function updateNumberOfChannels() {
      var numberOfChannels = this.computeNumberOfChannels();

      /* istanbul ignore else */
      if (numberOfChannels !== this.bus.getNumberOfChannels()) {
        this.bus.setNumberOfChannels(numberOfChannels);
        this.node.channelDidUpdate(numberOfChannels);
      }
    }

    /**
     * @return {boolean}
     */

  }, {
    key: "isEnabled",
    value: function isEnabled() {
      return this.outputs.length !== 0;
    }

    /**
     * @param {AudioNodeOutput} output
     */

  }, {
    key: "enableFrom",
    value: function enableFrom(output) {
      /* istanbul ignore else */
      if (moveItem(output, this._disabledOutputs, this.outputs)) {
        this.inputDidUpdate();
      }
    }

    /**
     * @param {AudioNodeOutput} output
     */

  }, {
    key: "disableFrom",
    value: function disableFrom(output) {
      /* istanbul ignore else */
      if (moveItem(output, this.outputs, this._disabledOutputs)) {
        this.inputDidUpdate();
      }
    }

    /**
     * @param {AudioNodeOutput} output
     */

  }, {
    key: "connectFrom",
    value: function connectFrom(output) {
      if (output.isEnabled()) {
        /* istanbul ignore else */
        if (addItem(output, this.outputs)) {
          this.inputDidUpdate();
        }
      } else {
        addItem(output, this._disabledOutputs);
      }
    }

    /**
     * @param {AudioNodeOutput} output
     */

  }, {
    key: "disconnectFrom",
    value: function disconnectFrom(output) {
      if (output.isEnabled()) {
        /* istanbul ignore else */
        if (removeItem(output, this.outputs)) {
          this.inputDidUpdate();
        }
      } else {
        removeItem(output, this._disabledOutputs);
      }
    }

    /**
     *
     */

  }, {
    key: "inputDidUpdate",
    value: function inputDidUpdate() {
      this.updateNumberOfChannels();
      if (this.outputs.length === 0) {
        this.node.disableOutputsIfNecessary();
      } else {
        this.node.enableOutputsIfNecessary();
      }
    }

    /**
     * @return {boolean}
     */

  }, {
    key: "isConnectedFrom",
    value: function isConnectedFrom(node) {
      var _this = this;

      return this.outputs.some(function (target) {
        return target.node === node;
      }) || !!(node && Array.isArray(node.outputs) && node.outputs.some(function (target) {
        return _this._disabledOutputs.has(target);
      }));
    }

    /**
     * @return {AudioBus}
     */

  }, {
    key: "sumAllConnections",
    value: function sumAllConnections() {
      var audioBus = this.bus;
      var outputs = this.outputs;

      audioBus.zeros();

      for (var i = 0, imax = outputs.length; i < imax; i++) {
        audioBus.sumFrom(outputs[i].pull());
      }

      return audioBus;
    }

    /**
     * @return {AudioBus}
     */

  }, {
    key: "pull",
    value: function pull() {
      if (this.outputs.length === 1) {
        var output = this.outputs[0];

        /* istanbul ignore else */
        if (output.getNumberOfChannels() === this.getNumberOfChannels()) {
          return this.bus.copyFrom(output.pull());
        }
      }

      return this.sumAllConnections();
    }
  }]);

  return AudioNodeInput;
}();

function addItem(target, destination) {
  if (destination instanceof WeakSet) {
    /* istanbul ignore next */
    if (destination.has(target)) {
      return false;
    }
    destination.add(target);
  } else {
    var index = destination.indexOf(target);

    /* istanbul ignore next */
    if (index !== -1) {
      return false;
    }
    destination.push(target);
  }
  return true;
}

function removeItem(target, source) {
  if (source instanceof WeakSet) {
    /* istanbul ignore next */
    if (!source.has(target)) {
      return false;
    }
    source.delete(target);
  } else {
    var index = source.indexOf(target);

    /* istanbul ignore next */
    if (index === -1) {
      return false;
    }
    source.splice(index, 1);
  }
  return true;
}

function moveItem(target, source, destination) {
  return removeItem(target, source) && addItem(target, destination);
}

module.exports = AudioNodeInput;

},{"../../constants/ChannelCountMode":62,"../../constants/ChannelInterpretation":63,"../../utils":135,"./AudioBus":101}],104:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AudioBus = require("./AudioBus");

/**
 * @prop {AudioNode} node
 * @prop {number}    index
 * @prop {AudioBus}  bus
 */

var AudioNodeOutput = function () {
  /**
   * @param {object} opts
   * @param {AudioNode} opts.node
   * @param {number}    opts.index
   * @param {number}    opts.numberOfChannels
   * @param {boolean}   opts.enabled
   */
  function AudioNodeOutput(opts) {
    _classCallCheck(this, AudioNodeOutput);

    var node = opts.node;
    var index = opts.index;
    var numberOfChannels = opts.numberOfChannels;
    var enabled = opts.enabled;

    this.node = node;
    this.index = index | 0;
    this.bus = new AudioBus(numberOfChannels, node.blockSize, node.sampleRate);
    this.inputs = [];
    this._enabled = !!enabled;
  }

  /**
   * @return {number}
   */


  _createClass(AudioNodeOutput, [{
    key: "getNumberOfChannels",
    value: function getNumberOfChannels() {
      return this.bus.getNumberOfChannels();
    }

    /**
     * @param {number} numberOfChannels
     */

  }, {
    key: "setNumberOfChannels",
    value: function setNumberOfChannels(numberOfChannels) {
      /* istanbul ignore else */
      if (numberOfChannels !== this.getNumberOfChannels()) {
        var channelInterpretation = this.node.getChannelInterpretation();

        this.bus.setNumberOfChannels(numberOfChannels, channelInterpretation);

        this.inputs.forEach(function (input) {
          input.updateNumberOfChannels();
        });
      }
    }

    /**
     * @return {boolean}
     */

  }, {
    key: "isEnabled",
    value: function isEnabled() {
      return this._enabled;
    }

    /**
     *
     */

  }, {
    key: "enable",
    value: function enable() {
      var _this = this;

      /* istanbul ignore else */
      if (!this._enabled) {
        this._enabled = true;
        this.inputs.forEach(function (input) {
          input.enableFrom(_this);
        });
      }
    }

    /**
     *
     */

  }, {
    key: "disable",
    value: function disable() {
      var _this2 = this;

      /* istanbul ignore else */
      if (this._enabled) {
        this._enabled = false;
        this.inputs.forEach(function (input) {
          input.disableFrom(_this2);
        });
      }
    }

    /**
     *
     */

  }, {
    key: "zeros",
    value: function zeros() {
      this.bus.zeros();
    }

    /**
     * @param {AudioNode|AudioParam} destination
     * @param {number}               index
     */

  }, {
    key: "connect",
    value: function connect(destination, input) {
      var target = destination.inputs[input | 0];

      if (this.inputs.indexOf(target) === -1) {
        this.inputs.push(target);
        target.connectFrom(this);
      }
    }

    /**
     *
     */

  }, {
    key: "disconnect",
    value: function disconnect() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var isTargetToDisconnect = args.length === 1 ? function (target) {
        return target.node === args[0];
      } : args.length === 2 ? function (target) {
        return target.node === args[0] && target.index === args[1];
      } : function () {
        return true;
      };

      for (var i = this.inputs.length - 1; i >= 0; i--) {
        var target = this.inputs[i];

        if (isTargetToDisconnect(target)) {
          target.disconnectFrom(this);
          this.inputs.splice(i, 1);
        }
      }
    }

    /**
     * @return {boolean}
     */

  }, {
    key: "isConnectedTo",
    value: function isConnectedTo(node) {
      return this.inputs.some(function (target) {
        return target.node === node;
      });
    }

    /**
     * @return {AudioBus}
     */

  }, {
    key: "pull",
    value: function pull() {
      this.node.processIfNecessary();
      return this.bus;
    }
  }]);

  return AudioNodeOutput;
}();

module.exports = AudioNodeOutput;

},{"./AudioBus":101}],105:[function(require,module,exports){
"use strict";

var fft = require("fourier-transform");
var blackman = require("scijs-window-functions/blackman");
var AudioBus = require("../core/AudioBus");

var _require = require("../../utils"),
    toDecibel = _require.toDecibel,
    normalize = _require.normalize;

var MAX_FFT_SIZE = 32768;

var AnalyserNodeDSP = {
  dspInit: function dspInit(sampleRate) {
    this._timeDomainBuffer = [];
    this._analyserBus = new AudioBus(1, MAX_FFT_SIZE, sampleRate);
    this._analyserBusOffset = 0;
    this._audioData = this._analyserBus.audioData.channelData[0];
  },
  dspUpdateSizes: function dspUpdateSizes(fftSize) {
    var previousSmooth = new Float32Array(fftSize / 2);
    var blackmanTable = new Float32Array(fftSize);

    for (var i = 0; i < fftSize; i++) {
      blackmanTable[i] = blackman(i, fftSize);
    }

    this._previousSmooth = previousSmooth;
    this._blackmanTable = blackmanTable;
  },
  dspGetFloatFrequencyData: function dspGetFloatFrequencyData(array) {
    var fftSize = this._fftSize;
    var blackmanTable = this._blackmanTable;
    var previousSmooth = this._previousSmooth;
    var waveform = new Float32Array(fftSize);
    var length = Math.min(array.length, fftSize / 2);
    var s = this._smoothingTimeConstant;

    // 1. down-mix
    this.dspGetFloatTimeDomainData(waveform);

    // 2. Apply Blackman window
    for (var i = 0; i < fftSize; i++) {
      waveform[i] = waveform[i] * blackmanTable[i] || 0;
    }

    // 3. FFT
    var spectrum = fft(waveform);

    // re-size to frequencyBinCount, then do more processing
    for (var _i = 0; _i < length; _i++) {
      var v0 = spectrum[_i];
      // 4. Smooth over data
      previousSmooth[_i] = s * previousSmooth[_i] + (1 - s) * v0;
      // 5. Convert to dB
      var v1 = toDecibel(previousSmooth[_i]);
      // store in array
      array[_i] = Number.isFinite(v1) ? v1 : 0;
    }
  },
  dspGetByteFrequencyData: function dspGetByteFrequencyData(array) {
    var length = Math.min(array.length, this._fftSize / 2);
    var dBMin = this._minDecibels;
    var dBMax = this._maxDecibels;
    var spectrum = new Float32Array(length);

    this.dspGetFloatFrequencyData(spectrum);

    for (var i = 0; i < length; i++) {
      array[i] = Math.round(normalize(spectrum[i], dBMin, dBMax) * 255);
    }
  },
  dspGetByteTimeDomainData: function dspGetByteTimeDomainData(array) {
    var length = Math.min(array.length, this._fftSize);
    var waveform = new Float32Array(length);

    this.dspGetFloatTimeDomainData(waveform);

    for (var i = 0; i < length; i++) {
      array[i] = Math.round(normalize(waveform[i], -1, 1) * 255);
    }
  },
  dspGetFloatTimeDomainData: function dspGetFloatTimeDomainData(array) {
    var audioData = this._audioData;
    var fftSize = this._fftSize;
    var i0 = (this._analyserBusOffset - fftSize + MAX_FFT_SIZE) % MAX_FFT_SIZE;
    var i1 = Math.min(i0 + fftSize, MAX_FFT_SIZE);
    var copied = i1 - i0;

    array.set(audioData.subarray(i0, i1));

    if (copied !== fftSize) {
      var remain = fftSize - copied;
      var subarray2 = audioData.subarray(0, remain);

      array.set(subarray2, copied);
    }
  },
  dspProcess: function dspProcess() {
    var inputBus = this.inputs[0].bus;
    var outputBus = this.outputs[0].bus;
    var analyserBus = this._analyserBus;
    var blockSize = inputBus.audioData.length;

    // just pass data through
    outputBus.copyFrom(inputBus);

    // merge and store data in our buffer
    analyserBus.copyFromWithOffset(inputBus, this._analyserBusOffset);

    this._analyserBusOffset += blockSize;
    if (MAX_FFT_SIZE <= this._analyserBusOffset) {
      this._analyserBusOffset = 0;
    }
  }
};

module.exports = AnalyserNodeDSP;

},{"../../utils":135,"../core/AudioBus":101,"fourier-transform":19,"scijs-window-functions/blackman":26}],106:[function(require,module,exports){
"use strict";

var AudioBufferSourceNodeDSP = {
  dspInit: function dspInit() {
    this._phase = 0;
  },
  dspStart: function dspStart() {
    if (this._audioData) {
      var bufferSampleRate = this._audioData.sampleRate;
      var bufferDuration = this._audioData.length / bufferSampleRate;

      this._phase = Math.max(0, Math.min(this._offset, bufferDuration)) * bufferSampleRate;
    }
  },
  dspProcess: function dspProcess() {
    if (this._audioData === null) {
      return this.dspEmitEnded();
    }

    var blockSize = this.blockSize;
    var quantumStartFrame = this.context.currentSampleFrame;
    var quantumEndFrame = quantumStartFrame + blockSize;
    var sampleOffset = Math.max(0, this._startFrame - quantumStartFrame);
    var fillToSample = Math.min(quantumEndFrame, this._stopFrame) - quantumStartFrame;
    var outputs = this.outputs[0].bus.getMutableData();

    var writeIndex = 0;

    writeIndex = this.dspBufferRendering(outputs, sampleOffset, fillToSample, this.sampleRate);

    // timeline
    // |----------------|-------*--------|----------------|----------------|
    //                  ^       ^        ^
    //                  |------>|        quantumEndFrame
    //                  | wrote |
    //                  |       stopFrame
    //                  quantumStartFrame
    if (this._stopFrame <= quantumStartFrame + writeIndex) {
      // rest samples fill zero
      var numberOfChannels = outputs.length;

      while (writeIndex < blockSize) {
        for (var ch = 0; ch < numberOfChannels; ch++) {
          outputs[ch][writeIndex] = 0;
        }
        writeIndex += 1;
      }

      this.dspEmitEnded();
    }
  },
  dspBufferRendering: function dspBufferRendering(outputs, writeIndex, inNumSamples, sampleRate) {
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

      if (this._loop) {
        if (0 <= this._loopStart && this._loopStart < this._loopEnd) {
          var loopEndSamples = this._loopEnd * bufferSampleRate;

          if (loopEndSamples <= phase) {
            phase = this._loopStart * bufferSampleRate;
          }
        } else {
          if (bufferLength <= phase) {
            phase = 0;
          }
        }
      } else {
        if (bufferLength <= phase) {
          this.dspEmitEnded();
          break;
        }
      }
    }

    this._phase = phase;

    return writeIndex;
  },
  dspEmitEnded: function dspEmitEnded() {
    var _this = this;

    this._done = true;
    this.context.addPostProcess(function () {
      _this.outputs[0].bus.zeros();
      _this.outputs[0].disable();
      _this.dispatchEvent({ type: "ended" });
    });
  }
};

module.exports = AudioBufferSourceNodeDSP;

},{}],107:[function(require,module,exports){
"use strict";

var AudioParamUtils = require("../../utils/AudioParamUtils");

var _require = require("../../utils"),
    fill = _require.fill;

var _require2 = require("../../constants/AudioParamEvent"),
    SET_VALUE_AT_TIME = _require2.SET_VALUE_AT_TIME;

var _require3 = require("../../constants/AudioParamEvent"),
    LINEAR_RAMP_TO_VALUE_AT_TIME = _require3.LINEAR_RAMP_TO_VALUE_AT_TIME;

var _require4 = require("../../constants/AudioParamEvent"),
    EXPONENTIAL_RAMP_TO_VALUE_AT_TIME = _require4.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME;

var _require5 = require("../../constants/AudioParamEvent"),
    SET_TARGET_AT_TIME = _require5.SET_TARGET_AT_TIME;

var _require6 = require("../../constants/AudioParamEvent"),
    SET_VALUE_CURVE_AT_TIME = _require6.SET_VALUE_CURVE_AT_TIME;

var AudioParamDSP = {
  dspInit: function dspInit() {
    this._prevValue = NaN;
    this._hasSampleAccurateValues = false;
    this._currentEventIndex = -1;
    this._quantumStartFrame = -1;
    this._remainSamples = 0;
    this._schedParams = {};
  },
  dspProcess: function dspProcess() {
    var input = this.inputs[0];
    var inputBus = input.bus;

    input.pull();

    var hasEvents = !!this._timeline.length;
    var hasInput = !inputBus.isSilent;
    var algorithm = hasEvents * 2 + hasInput;

    switch (algorithm) {
      case 0:
        // events: x / input: x
        return this.dspStaticValue();
      case 1:
        // events: x / input: o
        return this.dspInputAndOffset(inputBus);
      case 2:
        // events: o / input: x
        return this.dspEvents();
      case 3:
        // events: o / input: o
        return this.dspEventsAndInput(inputBus);
      default:
        /* istanbul ignore next */
        void 0;
    }
  },
  dspStaticValue: function dspStaticValue() {
    var value = this._value;

    if (value !== this._prevValue) {
      if (value === 0) {
        this.outputBus.zeros();
      } else {
        fill(this.outputBus.getMutableData()[0], value);
      }
      this._prevValue = value;
    }

    this._hasSampleAccurateValues = false;
  },
  dspInputAndOffset: function dspInputAndOffset(inputBus) {
    var blockSize = this.blockSize;
    var outputBus = this.outputBus;
    var output = outputBus.getMutableData()[0];
    var input = inputBus.getChannelData()[0];
    var value = this._value;

    output.set(input);

    if (value !== 0) {
      for (var i = 0; i < blockSize; i++) {
        output[i] += value;
      }
    }

    this._prevValue = NaN;
    this._hasSampleAccurateValues = true;
  },
  dspEvents: function dspEvents() {
    var outputBus = this.outputBus;
    var output = outputBus.getMutableData()[0];

    this.dspValuesForTimeRange(output);

    this._prevValue = NaN;
    this._hasSampleAccurateValues = true;
  },
  dspEventsAndInput: function dspEventsAndInput(inputBus) {
    var blockSize = this.blockSize;
    var outputBus = this.outputBus;
    var output = outputBus.getMutableData()[0];
    var input = inputBus.getChannelData()[0];

    this.dspValuesForTimeRange(output);

    for (var i = 0; i < blockSize; i++) {
      output[i] += input[i];
    }

    this._prevValue = NaN;
    this._hasSampleAccurateValues = true;
  },
  dspValuesForTimeRange: function dspValuesForTimeRange(output) {
    var blockSize = this.blockSize;
    var quantumStartFrame = this.context.currentSampleFrame;
    var quantumEndFrame = quantumStartFrame + blockSize;
    var sampleRate = this.sampleRate;
    var timeline = this._timeline;

    var value = this._value;
    var writeIndex = 0;

    // processing until the first event
    if (this._currentEventIndex === -1) {
      var firstEventStartFrame = timeline[0].startFrame;

      // timeline
      // |----------------|----------------|-------*--------|----------------|
      // ^                ^                        ^
      // |                quantumEndFrame          firstEventStartFrame
      // quantumStartFrame
      // <---------------> fill value with in range
      if (quantumEndFrame <= firstEventStartFrame) {
        for (var i = 0; i < blockSize; i++) {
          output[i] = value;
        }
        this._hasSampleAccurateValues = false;
        return;
      }

      // timeline
      // |----------------|----------------|-------*--------|----------------|
      //                                   ^       ^        ^
      //                                   |       |        quantumEndFrame
      //                                   |       firstEventStartFrame
      //                                   quantumStartFrame
      //                                   <------> fill value with in range
      for (var _i = 0, imax = firstEventStartFrame - quantumStartFrame; _i < imax; _i++) {
        output[writeIndex++] = value;
      }
      this._currentEventIndex = 0;
    }

    this._hasSampleAccurateValues = true;

    var remainSamples = this._quantumStartFrame === quantumStartFrame ? this._remainSamples : 0;
    var schedParams = this._schedParams;

    // if new event exists, should recalculate remainSamples
    if (remainSamples === Infinity && this._currentEventIndex + 1 !== timeline.length) {
      remainSamples = timeline[this._currentEventIndex + 1].startFrame - quantumStartFrame;
    }

    while (writeIndex < blockSize && this._currentEventIndex < timeline.length) {
      var eventItem = timeline[this._currentEventIndex];
      var startFrame = eventItem.startFrame;
      var endFrame = eventItem.endFrame;

      // timeline
      // |-------*--------|-------*--------|----------------|----------------|
      //         ^                ^        ^                ^
      //         |<-------------->|        |                quantumEndFrame
      //         |                |        quantumStartFrame
      //         startFrame       endFrame
      // skip event if
      // (endFrame < quantumStartFrame): past event
      //  or
      // (startFrame === endFrame): setValueAtTime before linearRampToValueAtTime or exponentialRampToValueAtTime.
      if (endFrame < quantumStartFrame || startFrame === endFrame) {
        remainSamples = 0;
        this._currentEventIndex += 1;
        continue;
      }

      if (remainSamples <= 0) {
        var processedSamples = Math.max(0, quantumStartFrame - startFrame);

        switch (eventItem.type) {
          case SET_VALUE_AT_TIME:
            {
              value = eventItem.startValue;
              schedParams = { type: SET_VALUE_AT_TIME };
            }
            break;
          case LINEAR_RAMP_TO_VALUE_AT_TIME:
            {
              var valueRange = eventItem.endValue - eventItem.startValue;
              var frameRange = eventItem.endFrame - eventItem.startFrame;
              var grow = valueRange / frameRange;

              if (grow) {
                value = eventItem.startValue + processedSamples * grow;
                schedParams = { type: LINEAR_RAMP_TO_VALUE_AT_TIME, grow: grow };
              } else {
                value = eventItem.startValue;
                schedParams = { type: SET_VALUE_AT_TIME };
              }
            }
            break;
          case EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
            {
              var valueRatio = eventItem.endValue / eventItem.startValue;
              var _frameRange = eventItem.endFrame - eventItem.startFrame;
              var _grow = Math.pow(valueRatio, 1 / _frameRange);

              if (_grow) {
                value = eventItem.startValue * Math.pow(_grow, processedSamples);
                schedParams = { type: EXPONENTIAL_RAMP_TO_VALUE_AT_TIME, grow: _grow };
              } else {
                value = eventItem.startValue;
                schedParams = { type: SET_VALUE_AT_TIME };
              }
            }
            break;
          case SET_TARGET_AT_TIME:
            {
              var target = Math.fround(eventItem.args[0]);
              var timeConstant = eventItem.args[2];
              var discreteTimeConstant = 1 - Math.exp(-1 / (sampleRate * timeConstant));
              var time = (quantumStartFrame + writeIndex) / sampleRate;

              value = AudioParamUtils.computeValueAtTime(timeline, time, this._userValue);

              if (discreteTimeConstant !== 1) {
                schedParams = { type: SET_TARGET_AT_TIME, target: target, discreteTimeConstant: discreteTimeConstant };
              } else {
                schedParams = { type: SET_VALUE_AT_TIME };
              }
            }
            break;
          case SET_VALUE_CURVE_AT_TIME:
            {
              var curve = eventItem.args[0];

              schedParams = { type: SET_VALUE_CURVE_AT_TIME, curve: curve, startFrame: startFrame, endFrame: endFrame };
            }
            break;
        }

        remainSamples = endFrame - startFrame - processedSamples;
      } // if (remainSamples === 0)

      var fillFrames = Math.min(blockSize - writeIndex, remainSamples);

      switch (schedParams.type) {
        case SET_VALUE_AT_TIME:
          {
            for (var _i2 = 0; _i2 < fillFrames; _i2++) {
              output[writeIndex++] = value;
            }
          }
          break;
        case LINEAR_RAMP_TO_VALUE_AT_TIME:
          {
            for (var _i3 = 0; _i3 < fillFrames; _i3++) {
              output[writeIndex++] = value;
              value += schedParams.grow;
            }
          }
          break;
        case EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
          {
            for (var _i4 = 0; _i4 < fillFrames; _i4++) {
              output[writeIndex++] = value;
              value *= schedParams.grow;
            }
          }
          break;
        case SET_TARGET_AT_TIME:
          {
            for (var _i5 = 0; _i5 < fillFrames; _i5++) {
              output[writeIndex++] = value;
              value += (schedParams.target - value) * schedParams.discreteTimeConstant;
            }
          }
          break;
        case SET_VALUE_CURVE_AT_TIME:
          {
            var _curve = schedParams.curve;
            var schedRange = schedParams.endFrame - schedParams.startFrame;
            var schedStartFrame = schedParams.startFrame;

            for (var _i6 = 0; _i6 < fillFrames; _i6++) {
              var xx = (quantumStartFrame + writeIndex - schedStartFrame) / schedRange;
              var ix = xx * (_curve.length - 1);
              var i0 = ix | 0;
              var i1 = i0 + 1;

              value = _curve[i0] + ix % 1 * (_curve[i1] - _curve[i0]);
              output[writeIndex++] = value;
            }

            if (remainSamples === fillFrames) {
              value = _curve[_curve.length - 1];
            }
          }
          break;
      }

      remainSamples -= fillFrames;

      if (remainSamples === 0) {
        this._currentEventIndex += 1;
      }
    } // while (writeIndex < blockSize)

    while (writeIndex < blockSize) {
      output[writeIndex++] = value;
    }

    this._value = value;
    this._schedParams = schedParams;
    this._remainSamples = remainSamples;
    this._quantumStartFrame = quantumEndFrame;
  }
};

module.exports = AudioParamDSP;

},{"../../constants/AudioParamEvent":59,"../../utils":135,"../../utils/AudioParamUtils":128}],108:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BiquadFilterKernel = function () {
  function BiquadFilterKernel() {
    _classCallCheck(this, BiquadFilterKernel);

    this.coefficients = [0, 0, 0, 0, 0];
    this._x1 = 0;
    this._x2 = 0;
    this._y1 = 0;
    this._y2 = 0;
  }

  _createClass(BiquadFilterKernel, [{
    key: "process",
    value: function process(input, output, inNumSamples) {
      var b0 = this.coefficients[0];
      var b1 = this.coefficients[1];
      var b2 = this.coefficients[2];
      var a1 = this.coefficients[3];
      var a2 = this.coefficients[4];

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
    value: function processWithCoefficients(input, output, inNumSamples, coefficients) {
      var b0 = this.coefficients[0];
      var b1 = this.coefficients[1];
      var b2 = this.coefficients[2];
      var a1 = this.coefficients[3];
      var a2 = this.coefficients[4];
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
      this.coefficients = coefficients;
    }
  }]);

  return BiquadFilterKernel;
}();

function flushDenormalFloatToZero(f) {
  return Math.abs(f) < 1.175494e-38 ? 0.0 : f;
}

module.exports = BiquadFilterKernel;

},{}],109:[function(require,module,exports){
"use strict";

var BiquadCoeffs = require("biquad-coeffs-webaudio");
var BiquadFilterKernel = require("./BiquadFilterKernel");

var _require = require("../../utils/FilterUtils"),
    getFilterResponse = _require.getFilterResponse;

var BiquadFilterNodeDSP = {
  dspInit: function dspInit() {
    this._kernels = [];
    this._quantumStartFrame = -1;
    this._coefficients = [0, 0, 0, 0, 0];
    this._prevFrequency = 0;
    this._prevDetune = 0;
    this._prevQ = 0;
    this._prevGain = 0;
  },
  dspUpdateKernel: function dspUpdateKernel(numberOfChannels) {
    if (numberOfChannels < this._kernels.length) {
      this._kernels.splice(numberOfChannels);
    } else if (this._kernels.length < numberOfChannels) {
      while (numberOfChannels !== this._kernels.length) {
        this._kernels.push(new BiquadFilterKernel(this, this._kernels.length));
      }
    }

    switch (numberOfChannels) {
      case 1:
        this.dspProcess = this.dspProcess1;
        break;
      case 2:
        this.dspProcess = this.dspProcess2;
        break;
      default:
        this.dspProcess = this.dspProcessN;
        break;
    }
  },
  dspProcess1: function dspProcess1() {
    var blockSize = this.blockSize;
    var quantumStartFrame = this.context.currentSampleFrame;
    var quantumEndFrame = quantumStartFrame + blockSize;
    var inputs = this.inputs[0].bus.getChannelData();
    var outputs = this.outputs[0].bus.getMutableData();
    var isCoefficientsUpdated = this.dspUpdateCoefficients();
    var coefficients = this._coefficients;
    var kernels = this._kernels;

    if (quantumStartFrame !== this._quantumStartFrame) {
      kernels[0].coefficients = coefficients;
      kernels[0].process(inputs[0], outputs[0], blockSize);
    } else if (isCoefficientsUpdated) {
      kernels[0].processWithCoefficients(inputs[0], outputs[0], blockSize, coefficients);
    } else {
      kernels[0].process(inputs[0], outputs[0], blockSize);
    }

    this._quantumStartFrame = quantumEndFrame;
  },
  dspProcess2: function dspProcess2() {
    var blockSize = this.blockSize;
    var quantumStartFrame = this.context.currentSampleFrame;
    var quantumEndFrame = quantumStartFrame + blockSize;
    var inputs = this.inputs[0].bus.getChannelData();
    var outputs = this.outputs[0].bus.getMutableData();
    var isCoefficientsUpdated = this.dspUpdateCoefficients();
    var coefficients = this._coefficients;
    var kernels = this._kernels;

    if (quantumStartFrame !== this._quantumStartFrame) {
      kernels[0].coefficients = coefficients;
      kernels[1].coefficients = coefficients;
      kernels[0].process(inputs[0], outputs[0], blockSize);
      kernels[1].process(inputs[1], outputs[1], blockSize);
    } else if (isCoefficientsUpdated) {
      kernels[0].processWithCoefficients(inputs[0], outputs[0], blockSize, coefficients);
      kernels[1].processWithCoefficients(inputs[1], outputs[1], blockSize, coefficients);
    } else {
      kernels[0].process(inputs[0], outputs[0], blockSize);
      kernels[1].process(inputs[1], outputs[1], blockSize);
    }

    this._quantumStartFrame = quantumEndFrame;
  },
  dspProcessN: function dspProcessN() {
    var blockSize = this.blockSize;
    var quantumStartFrame = this.context.currentSampleFrame;
    var quantumEndFrame = quantumStartFrame + blockSize;
    var inputs = this.inputs[0].bus.getChannelData();
    var outputs = this.outputs[0].bus.getMutableData();
    var isCoefficientsUpdated = this.dspUpdateCoefficients();
    var coefficients = this._coefficients;
    var kernels = this._kernels;

    if (quantumStartFrame !== this._quantumStartFrame) {
      for (var i = 0, imax = kernels.length; i < imax; i++) {
        kernels[i].coefficients = coefficients;
        kernels[i].process(inputs[i], outputs[i], blockSize);
      }
    } else if (isCoefficientsUpdated) {
      for (var _i = 0, _imax = kernels.length; _i < _imax; _i++) {
        kernels[_i].processWithCoefficients(inputs[_i], outputs[_i], blockSize, coefficients);
      }
    } else {
      for (var _i2 = 0, _imax2 = kernels.length; _i2 < _imax2; _i2++) {
        kernels[_i2].process(inputs[_i2], outputs[_i2], blockSize);
      }
    }

    this._quantumStartFrame = quantumEndFrame;
  },
  dspUpdateCoefficients: function dspUpdateCoefficients() {
    var frequency = this._frequency.getSampleAccurateValues()[0];
    var detune = this._detune.getSampleAccurateValues()[0];
    var Q = this._Q.getSampleAccurateValues()[0];
    var gain = this._gain.getSampleAccurateValues()[0];

    if (frequency === this._prevFrequency && detune === this._prevDetune && Q === this._prevQ && gain === this._prevGain) {
      return false;
    }

    var normalizedFrequency = frequency / this.sampleRate * Math.pow(2, detune / 1200);

    this._coefficients = BiquadCoeffs[this._type](normalizedFrequency, Q, gain);
    this._prevFrequency = frequency;
    this._prevDetune = detune;
    this._prevQ = Q;
    this._prevGain = gain;

    return true;
  },
  dspGetFrequencyResponse: function dspGetFrequencyResponse(frequencyHz, magResponse, phaseResponse) {
    var frequency = this._frequency.getValue();
    var detune = this._detune.getValue();
    var Q = this._Q.getValue();
    var gain = this._gain.getValue();
    var normalizedFrequency = frequency / this.sampleRate * Math.pow(2, detune / 1200);
    var coefficients = BiquadCoeffs[this._type](normalizedFrequency, Q, gain);

    var b = [coefficients[0], coefficients[1], coefficients[2]];
    var a = [1, coefficients[3], coefficients[4]];

    getFilterResponse(b, a, frequencyHz, magResponse, phaseResponse, this.sampleRate);
  }
};

module.exports = BiquadFilterNodeDSP;

},{"../../utils/FilterUtils":131,"./BiquadFilterKernel":108,"biquad-coeffs-webaudio":17}],110:[function(require,module,exports){
"use strict";

var ChannelMergerNodeDSP = {
  dspProcess: function dspProcess() {
    var outputBus = this.outputs[0].bus;
    var inputBuses = this.inputs.map(function (input) {
      return input.bus;
    });
    var allSilent = inputBuses.every(function (inputBus) {
      return inputBus.isSilent;
    });

    outputBus.zeros();

    if (!allSilent) {
      var outputChannelData = outputBus.getMutableData();

      for (var i = 0, imax = inputBuses.length; i < imax; i++) {
        outputChannelData[i].set(inputBuses[i].getChannelData()[0]);
      }
    }
  }
};

module.exports = ChannelMergerNodeDSP;

},{}],111:[function(require,module,exports){
"use strict";

var ChannelSplitterNodeDSP = {
  dspProcess: function dspProcess() {
    var inputBus = this.inputs[0].bus;
    var outputs = this.outputs;

    if (inputBus.isSilent) {
      for (var i = 0, imax = outputs.length; i < imax; i++) {
        outputs[i].bus.zeros();
      }
    } else {
      var inputChannelData = inputBus.getChannelData();

      for (var _i = 0, _imax = outputs.length; _i < _imax; _i++) {
        var outputBus = outputs[_i].bus;

        if (inputChannelData[_i]) {
          outputBus.getMutableData()[0].set(inputChannelData[_i]);
        } else {
          outputBus.zeros();
        }
      }
    }
  }
};

module.exports = ChannelSplitterNodeDSP;

},{}],112:[function(require,module,exports){
"use strict";

var _require = require("../../utils"),
    fill = _require.fill;

var ConstantSourceNode = {
  dspInit: function dspInit() {},
  dspProcess: function dspProcess() {
    var offsetParam = this._offset;
    var outputBus = this.outputs[0].bus;
    var outputs = outputBus.getMutableData();

    if (offsetParam.hasSampleAccurateValues()) {
      outputs[0].set(offsetParam.getSampleAccurateValues());
    } else {
      fill(outputs[0], offsetParam.getValue());
    }
  }
};

module.exports = ConstantSourceNode;

},{"../../utils":135}],113:[function(require,module,exports){
"use strict";

var ConvolverNodeDSP = {
  dspProcess: function dspProcess() {
    var outputBus = this.outputs[0].bus;

    outputBus.zeros();
    outputBus.sumFrom(this.inputs[0].bus);
  }
};

module.exports = ConvolverNodeDSP;

},{}],114:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DelayNodeDSP = {
  dspInit: function dspInit(maxDelayTime) {
    this._kernels = [];
    this._delayBufferLength = this.dspComputeDelayBufferLength(maxDelayTime);
    this._delayIndices = new Float32Array(this.blockSize);
  },
  dspComputeDelayBufferLength: function dspComputeDelayBufferLength(delayTime) {
    return Math.ceil(delayTime * this.sampleRate / this.blockSize) * this.blockSize + this.blockSize;
  },
  dspUpdateKernel: function dspUpdateKernel(numberOfChannels) {
    if (numberOfChannels < this._kernels.length) {
      this._kernels.splice(numberOfChannels);
    } else if (this._kernels.length < numberOfChannels) {
      while (numberOfChannels !== this._kernels.length) {
        this._kernels.push(new DelayKernel(this, this._kernels.length));
      }
    }

    switch (numberOfChannels) {
      case 1:
        this.dspProcess = this.dspProcess1;
        break;
      case 2:
        this.dspProcess = this.dspProcess2;
        break;
      default:
        this.dspProcess = this.dspProcessN;
        break;
    }
  },
  dspProcess1: function dspProcess1() {
    var blockSize = this.blockSize;
    var inputs = this.inputs[0].bus.getChannelData();
    var outputs = this.outputs[0].bus.getMutableData();
    var delayIndices = this._delayIndices;
    var kernel = this._kernels[0];

    if (this._delayTime.hasSampleAccurateValues()) {
      kernel.computeAccurateDelayIndices(delayIndices, this._delayTime.getSampleAccurateValues());
      kernel.processWithAccurateDelayIndices(inputs[0], outputs[0], delayIndices, blockSize);
    } else {
      kernel.computeStaticDelayIndices(delayIndices, this._delayTime.getValue());
      kernel.processWithStaticDelayIndices(inputs[0], outputs[0], delayIndices, blockSize);
    }
  },
  dspProcess2: function dspProcess2() {
    var blockSize = this.blockSize;
    var inputs = this.inputs[0].bus.getChannelData();
    var outputs = this.outputs[0].bus.getMutableData();
    var delayIndices = this._delayIndices;
    var kernels = this._kernels;

    if (this._delayTime.hasSampleAccurateValues()) {
      kernels[0].computeAccurateDelayIndices(delayIndices, this._delayTime.getSampleAccurateValues());
      kernels[0].processWithAccurateDelayIndices(inputs[0], outputs[0], delayIndices, blockSize);
      kernels[1].processWithAccurateDelayIndices(inputs[1], outputs[1], delayIndices, blockSize);
    } else {
      kernels[0].computeStaticDelayIndices(delayIndices, this._delayTime.getValue());
      kernels[0].processWithStaticDelayIndices(inputs[0], outputs[0], delayIndices, blockSize);
      kernels[1].processWithStaticDelayIndices(inputs[1], outputs[1], delayIndices, blockSize);
    }
  },
  dspProcessN: function dspProcessN() {
    var blockSize = this.blockSize;
    var inputs = this.inputs[0].bus.getChannelData();
    var outputs = this.outputs[0].bus.getMutableData();
    var delayIndices = this._delayIndices;
    var kernels = this._kernels;

    if (this._delayTime.hasSampleAccurateValues()) {
      kernels[0].computeAccurateDelayIndices(delayIndices, this._delayTime.getSampleAccurateValues());

      for (var i = 0, imax = kernels.length; i < imax; i++) {
        kernels[i].processWithAccurateDelayIndices(inputs[i], outputs[i], delayIndices, blockSize);
      }
    } else {
      kernels[0].computeStaticDelayIndices(delayIndices, this._delayTime.getValue());

      for (var _i = 0, _imax = kernels.length; _i < _imax; _i++) {
        kernels[_i].processWithStaticDelayIndices(inputs[_i], outputs[_i], delayIndices, blockSize);
      }
    }
  }
};

var DelayKernel = function () {
  function DelayKernel(delayNode) {
    _classCallCheck(this, DelayKernel);

    this._sampleRate = delayNode.sampleRate;
    this._maxDelayTime = delayNode._maxDelayTime;
    this._delayBufferLength = delayNode._delayBufferLength;
    this._delayBuffer = new Float32Array(this._delayBufferLength);
    this._virtualDelayIndex = 0;
  }

  _createClass(DelayKernel, [{
    key: "computeStaticDelayIndices",
    value: function computeStaticDelayIndices(delayIndices, delayTime) {
      var sampleRate = this._sampleRate;
      var maxDelayTime = this._maxDelayTime;
      var delayBufferLength = this._delayBufferLength;
      var virtualReadIndex = this._virtualDelayIndex;

      delayTime = Math.max(0, Math.min(delayTime, maxDelayTime));

      var delayIndex = virtualReadIndex - delayTime * sampleRate;

      if (delayIndex < 0) {
        delayIndex += delayBufferLength;
      }

      for (var i = 0, imax = delayIndices.length; i < imax; i++) {
        delayIndices[i] = delayIndex++;
        if (delayBufferLength <= delayIndex) {
          delayIndex -= delayBufferLength;
        }
      }

      return delayIndices;
    }
  }, {
    key: "computeAccurateDelayIndices",
    value: function computeAccurateDelayIndices(delayIndices, delayTimes) {
      var sampleRate = this._sampleRate;
      var maxDelayTime = this._maxDelayTime;
      var delayBufferLength = this._delayBufferLength;
      var virtualReadIndex = this._virtualDelayIndex;

      for (var i = 0, imax = delayIndices.length; i < imax; i++) {
        var delayTime = Math.max(0, Math.min(delayTimes[i], maxDelayTime));

        var delayIndex = virtualReadIndex + i - delayTime * sampleRate;

        if (delayIndex < 0) {
          delayIndex += delayBufferLength;
        }

        delayIndices[i] = delayIndex;
      }

      return delayIndices;
    }
  }, {
    key: "processWithStaticDelayIndices",
    value: function processWithStaticDelayIndices(input, output, delayIndices, inNumSamples) {
      var delayBufferLength = this._delayBufferLength;
      var delayBuffer = this._delayBuffer;

      this._delayBuffer.set(input, this._virtualDelayIndex);

      var ia = delayIndices[0] % 1;

      if (ia === 0) {
        for (var i = 0; i < inNumSamples; i++) {
          output[i] = delayBuffer[delayIndices[i]];
        }
      } else {
        for (var _i2 = 0; _i2 < inNumSamples; _i2++) {
          var i0 = delayIndices[_i2] | 0;
          var i1 = (i0 + 1) % delayBufferLength;

          output[_i2] = delayBuffer[i0] + ia * (delayBuffer[i1] - delayBuffer[i0]);
        }
      }

      this._virtualDelayIndex += inNumSamples;

      if (this._virtualDelayIndex === delayBufferLength) {
        this._virtualDelayIndex = 0;
      }
    }
  }, {
    key: "processWithAccurateDelayIndices",
    value: function processWithAccurateDelayIndices(input, output, delayIndices, inNumSamples) {
      var delayBufferLength = this._delayBufferLength;
      var delayBuffer = this._delayBuffer;

      delayBuffer.set(input, this._virtualDelayIndex);

      for (var i = 0; i < inNumSamples; i++) {
        var ix = delayIndices[i];
        var i0 = ix | 0;
        var ia = ix % 1;

        if (ia === 0) {
          output[i] = delayBuffer[i0];
        } else {
          var i1 = (i0 + 1) % delayBufferLength;

          output[i] = delayBuffer[i0] + ia * (delayBuffer[i1] - delayBuffer[i0]);
        }
      }

      this._virtualDelayIndex += inNumSamples;

      if (this._virtualDelayIndex === delayBufferLength) {
        this._virtualDelayIndex = 0;
      }
    }
  }]);

  return DelayKernel;
}();

module.exports = DelayNodeDSP;

},{}],115:[function(require,module,exports){
"use strict";

var DynamicsCompressorNodeDSP = {
  dspProcess: function dspProcess() {
    var outputBus = this.outputs[0].bus;

    outputBus.zeros();
    outputBus.sumFrom(this.inputs[0].bus);
  }
};

module.exports = DynamicsCompressorNodeDSP;

},{}],116:[function(require,module,exports){
"use strict";

var DSPAlgorithm = {};

var GainNodeDSP = {
  dspProcess: function dspProcess() {
    var inputBus = this.inputs[0].bus;
    var outputBus = this.outputs[0].bus;

    if (inputBus.isSilent) {
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

      _dsp(_inputs, _outputs, gainValues, this.blockSize);

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

    dsp(inputs, outputs, gainValue, this.blockSize);
  }
};

function selectAlgorithm(numberOfChannels, base) {
  var algorithmIndex = numberOfChannels + base;

  if (DSPAlgorithm[algorithmIndex]) {
    return DSPAlgorithm[algorithmIndex];
  }

  return DSPAlgorithm[base];
}

DSPAlgorithm[1000] = function (inputs, outputs, gainValues, blockSize) {
  var numberOfChannels = inputs.length;

  for (var ch = 0; ch < numberOfChannels; ch++) {
    for (var i = 0; i < blockSize; i++) {
      outputs[ch][i] = inputs[ch][i] * gainValues[i];
    }
  }
};

DSPAlgorithm[1001] = function (inputs, outputs, gainValues, blockSize) {
  var input = inputs[0];
  var output = outputs[0];

  for (var i = 0; i < blockSize; i++) {
    output[i] = input[i] * gainValues[i];
  }
};

DSPAlgorithm[1002] = function (inputs, outputs, gainValues, blockSize) {
  var inputL = inputs[0];
  var inputR = inputs[1];
  var outputL = outputs[0];
  var outputR = outputs[1];

  for (var i = 0; i < blockSize; i++) {
    outputL[i] = inputL[i] * gainValues[i];
    outputR[i] = inputR[i] * gainValues[i];
  }
};

DSPAlgorithm[2000] = function (inputs, outputs, gainValue, blockSize) {
  var numberOfChannels = inputs.length;

  for (var ch = 0; ch < numberOfChannels; ch++) {
    for (var i = 0; i < blockSize; i++) {
      outputs[ch][i] = inputs[ch][i] * gainValue;
    }
  }
};

DSPAlgorithm[2001] = function (inputs, outputs, gainValue, blockSize) {
  var input = inputs[0];
  var output = outputs[0];

  for (var i = 0; i < blockSize; i++) {
    output[i] = input[i] * gainValue;
  }
};

DSPAlgorithm[2002] = function (inputs, outputs, gainValue, blockSize) {
  var inputL = inputs[0];
  var inputR = inputs[1];
  var outputL = outputs[0];
  var outputR = outputs[1];

  for (var i = 0; i < blockSize; i++) {
    outputL[i] = inputL[i] * gainValue;
    outputR[i] = inputR[i] * gainValue;
  }
};

module.exports = GainNodeDSP;

},{}],117:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var IIRFilterKernel = function () {
  function IIRFilterKernel(feedforward, feedback) {
    _classCallCheck(this, IIRFilterKernel);

    this.a = toCoefficient(feedback, feedback[0]);
    this.b = toCoefficient(feedforward, feedback[0]);
    this.x = new Float32Array(this.b.length);
    this.y = new Float32Array(this.a.length);
  }

  _createClass(IIRFilterKernel, [{
    key: "process",
    value: function process(input, output, inNumSamples) {
      var a = this.a;
      var b = this.b;
      var x = this.x;
      var y = this.y;
      var alen = this.a.length - 1;
      var blen = this.b.length;

      for (var i = 0; i < inNumSamples; i++) {
        x[blen - 1] = input[i];
        y[alen] = 0;

        for (var j = 0; j < blen; j++) {
          y[alen] += b[j] * x[j];
          x[j] = flushDenormalFloatToZero(x[j + 1]);
        }

        for (var _j = 0; _j < alen; _j++) {
          y[alen] -= a[_j] * y[_j];
          y[_j] = flushDenormalFloatToZero(y[_j + 1]);
        }

        output[i] = y[alen];
      }
    }
  }]);

  return IIRFilterKernel;
}();

function toCoefficient(filter, a0) {
  var coeff = new Float32Array(filter.length);

  for (var i = 0, imax = coeff.length; i < imax; i++) {
    coeff[i] = filter[imax - i - 1] / a0;
  }

  return coeff;
}

function flushDenormalFloatToZero(f) {
  return Math.abs(f) < 1.175494e-38 ? 0.0 : f;
}

module.exports = IIRFilterKernel;

},{}],118:[function(require,module,exports){
"use strict";

var IIRFilterKernel = require("./IIRFilterKernel");

var _require = require("../../utils/FilterUtils"),
    getFilterResponse = _require.getFilterResponse;

var IIRFilterNodeDSP = {
  dspInit: function dspInit() {
    this._kernels = [];
  },
  dspUpdateKernel: function dspUpdateKernel(numberOfChannels) {
    if (numberOfChannels < this._kernels.length) {
      this._kernels.splice(numberOfChannels);
    } else if (this._kernels.length < numberOfChannels) {
      while (numberOfChannels !== this._kernels.length) {
        this._kernels.push(new IIRFilterKernel(this._feedforward, this._feedback));
      }
    }

    switch (numberOfChannels) {
      case 1:
        this.dspProcess = this.dspProcess1;
        break;
      case 2:
        this.dspProcess = this.dspProcess2;
        break;
      default:
        this.dspProcess = this.dspProcessN;
        break;
    }
  },
  dspProcess1: function dspProcess1() {
    var inputs = this.inputs[0].bus.getChannelData();
    var outputs = this.outputs[0].bus.getMutableData();
    var kernels = this._kernels;

    kernels[0].process(inputs[0], outputs[0], this.blockSize);
  },
  dspProcess2: function dspProcess2() {
    var blockSize = this.blockSize;
    var inputs = this.inputs[0].bus.getChannelData();
    var outputs = this.outputs[0].bus.getMutableData();
    var kernels = this._kernels;

    kernels[0].process(inputs[0], outputs[0], blockSize);
    kernels[1].process(inputs[1], outputs[1], blockSize);
  },
  dspProcessN: function dspProcessN() {
    var blockSize = this.blockSize;
    var inputs = this.inputs[0].bus.getChannelData();
    var outputs = this.outputs[0].bus.getMutableData();
    var kernels = this._kernels;

    for (var i = 0, imax = kernels.length; i < imax; i++) {
      kernels[i].process(inputs[i], outputs[i], blockSize);
    }
  },
  dspGetFrequencyResponse: function dspGetFrequencyResponse(frequencyHz, magResponse, phaseResponse) {
    var b = this._feedforward;
    var a = this._feedback;

    getFilterResponse(b, a, frequencyHz, magResponse, phaseResponse, this.sampleRate);
  }
};

module.exports = IIRFilterNodeDSP;

},{"../../utils/FilterUtils":131,"./IIRFilterKernel":117}],119:[function(require,module,exports){
"use strict";

var _require = require("../../constants/OscillatorType"),
    SINE = _require.SINE;

var OscillatorNodeDSP = {
  dspInit: function dspInit() {
    this._phase = 0;
  },
  dspProcess: function dspProcess() {
    var _this = this;

    var blockSize = this.blockSize;
    var quantumStartFrame = this.context.currentSampleFrame;
    var quantumEndFrame = quantumStartFrame + blockSize;
    var sampleOffset = Math.max(0, this._startFrame - quantumStartFrame);
    var fillToSample = Math.min(quantumEndFrame, this._stopFrame) - quantumStartFrame;
    var output = this.outputs[0].bus.getMutableData()[0];

    var writeIndex = 0;

    if (this._type === SINE) {
      writeIndex = this.dspSine(output, sampleOffset, fillToSample, this.sampleRate);
    } else {
      writeIndex = this.dspWave(output, sampleOffset, fillToSample, this.sampleRate);
    }

    // timeline
    // |----------------|-------*--------|----------------|----------------|
    //                  ^       ^        ^
    //                  |------>|        quantumEndFrame
    //                  | wrote |
    //                  |       stopFrame
    //                  quantumStartFrame
    if (this._stopFrame <= quantumStartFrame + writeIndex) {
      // rest samples fill zero
      while (writeIndex < blockSize) {
        output[writeIndex++] = 0;
      }

      this.context.addPostProcess(function () {
        _this.outputs[0].bus.zeros();
        _this.outputs[0].disable();
        _this.dispatchEvent({ type: "ended" });
      });
    }
  },
  dspSine: function dspSine(output, writeIndex, blockSize, sampleRate) {
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

      while (writeIndex < blockSize) {
        output[writeIndex++] = Math.sin(phase);
        phase += phaseIncr;
      }
    } else {
      var frequencyValues = frequency.getSampleAccurateValues();
      var detuneValues = detune.getSampleAccurateValues();

      while (writeIndex < blockSize) {
        var _frequencyValue = frequencyValues[writeIndex];
        var _detuneValue = detuneValues[writeIndex];
        var _computedFrequency = _frequencyValue * Math.pow(2, _detuneValue / 1200);

        output[writeIndex++] = Math.sin(phase);
        phase += frequencyToPhaseIncr * _computedFrequency;
      }
    }

    this._phase = phase;

    return writeIndex;
  },
  dspWave: function dspWave(output, writeIndex, blockSize, sampleRate) {
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

      while (writeIndex < blockSize) {
        var idx = phase * waveTableLength % waveTableLength;
        var v0 = waveTable[idx | 0];
        var v1 = waveTable[(idx | 0) + 1];

        output[writeIndex++] = v0 + idx % 1 * (v1 - v0);
        phase += phaseIncr;
      }
    } else {
      var frequencyValues = frequency.getSampleAccurateValues();
      var detuneValues = detune.getSampleAccurateValues();

      while (writeIndex < blockSize) {
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
};

module.exports = OscillatorNodeDSP;

},{"../../constants/OscillatorType":64}],120:[function(require,module,exports){
"use strict";

var PannerNodeDSP = {
  dspProcess: function dspProcess() {
    var outputBus = this.outputs[0].bus;

    outputBus.zeros();
    outputBus.sumFrom(this.inputs[0].bus);
  }
};

module.exports = PannerNodeDSP;

},{}],121:[function(require,module,exports){
"use strict";

var WAVE_TABLE_LENGTH = 8192;

var PeriodicWaveDSP = {
  dspInit: function dspInit() {
    this._waveTable = null;
  },
  dspBuildWaveTable: function dspBuildWaveTable() {
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
};

module.exports = PeriodicWaveDSP;

},{}],122:[function(require,module,exports){
"use strict";

var AudioBuffer = require("../AudioBuffer");

var _require = require("../../utils"),
    fill = _require.fill;

var ScriptProcessorNodeDSP = {
  dspInit: function dspInit() {
    this._eventItem = null;
    this._inputChannelData = null;
    this._outputChannelData = null;
    this._writeIndex = 0;
  },
  dspSetEventItem: function dspSetEventItem(eventItem) {
    var numberOfInputChannels = this.inputs[0].getNumberOfChannels();
    var numberOfOutputChannels = this.outputs[0].getNumberOfChannels();
    var inputBuffer = new AudioBuffer({
      numberOfChannels: numberOfInputChannels, length: this._bufferSize, sampleRate: this.sampleRate
    });
    var outputBuffer = new AudioBuffer({
      numberOfChannels: numberOfOutputChannels, length: this._bufferSize, sampleRate: this.sampleRate
    });

    eventItem.inputBuffer._impl = inputBuffer;
    eventItem.outputBuffer._impl = outputBuffer;

    this._inputChannelData = inputBuffer.audioData.channelData;
    this._outputChannelData = outputBuffer.audioData.channelData;

    this._eventItem = eventItem;
  },
  dspProcess: function dspProcess() {
    var _this = this;

    var blockSize = this.blockSize;
    var quantumStartFrame = this.context.currentSampleFrame;
    var quantumEndFrame = quantumStartFrame + blockSize;
    var inputs = this.inputs[0].bus.getChannelData();
    var outputs = this.outputs[0].bus.getMutableData();
    var inputChannelData = this._inputChannelData;
    var outputChannelData = this._outputChannelData;
    var numberOfInputChannels = inputs.length;
    var numberOfOutputChannels = outputs.length;
    var copyFrom = this._writeIndex;
    var copyTo = copyFrom + blockSize;

    for (var ch = 0; ch < numberOfInputChannels; ch++) {
      inputChannelData[ch].set(inputs[ch], copyFrom);
    }
    for (var _ch = 0; _ch < numberOfOutputChannels; _ch++) {
      outputs[_ch].set(outputChannelData[_ch].subarray(copyFrom, copyTo));
    }

    this._writeIndex += blockSize;

    if (this._writeIndex === this._bufferSize) {
      var playbackTime = quantumEndFrame / this.sampleRate;

      this.context.addPostProcess(function () {
        for (var _ch2 = 0; _ch2 < numberOfOutputChannels; _ch2++) {
          fill(outputChannelData[_ch2], 0);
        }
        _this._eventItem.playbackTime = playbackTime;
        _this.dispatchEvent(_this._eventItem);
      });
      this._writeIndex = 0;
    }
  }
};

module.exports = ScriptProcessorNodeDSP;

},{"../../utils":135,"../AudioBuffer":74}],123:[function(require,module,exports){
"use strict";

var SpatialPannerNodeDSP = {
  dspProcess: function dspProcess() {
    var outputBus = this.outputs[0].bus;

    outputBus.zeros();
    outputBus.sumFrom(this.inputs[0].bus);
  }
};

module.exports = SpatialPannerNodeDSP;

},{}],124:[function(require,module,exports){
"use strict";

var StereoPannerNodeDSP = {
  dspProcess: function dspProcess() {
    var inputBus = this.inputs[0].bus;
    var outputBus = this.outputs[0].bus;

    if (inputBus.isSilent) {
      outputBus.zeros();
      return;
    }

    var panParam = this._pan;

    if (panParam.hasSampleAccurateValues()) {
      this.dspSampleAccurateValues(inputBus, outputBus, panParam.getSampleAccurateValues(), this.blockSize);
    } else {
      this.dspStaticValue(inputBus, outputBus, panParam.getValue(), this.blockSize);
    }
  },
  dspSampleAccurateValues: function dspSampleAccurateValues(inputBus, outputBus, panValues, blockSize) {
    var outputs = outputBus.getMutableData();
    var numberOfChannels = inputBus.getNumberOfChannels();

    if (numberOfChannels === 1) {
      var input = inputBus.getChannelData()[0];

      for (var i = 0; i < blockSize; i++) {
        var panValue = Math.max(-1, Math.min(panValues[i], +1));
        var panRadian = (panValue * 0.5 + 0.5) * 0.5 * Math.PI;
        var gainL = Math.cos(panRadian);
        var gainR = Math.sin(panRadian);

        outputs[0][i] = input[i] * gainL;
        outputs[1][i] = input[i] * gainR;
      }
    } else {
      var inputs = inputBus.getChannelData();

      for (var _i = 0; _i < blockSize; _i++) {
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
  },
  dspStaticValue: function dspStaticValue(inputBus, outputBus, panValue, blockSize) {
    var outputs = outputBus.getMutableData();
    var numberOfChannels = inputBus.getNumberOfChannels();

    panValue = Math.max(-1, Math.min(panValue, +1));

    if (numberOfChannels === 1) {
      var input = inputBus.getChannelData()[0];
      var panRadian = (panValue * 0.5 + 0.5) * 0.5 * Math.PI;
      var gainL = Math.cos(panRadian);
      var gainR = Math.sin(panRadian);

      for (var i = 0; i < blockSize; i++) {
        outputs[0][i] = input[i] * gainL;
        outputs[1][i] = input[i] * gainR;
      }
    } else {
      var inputs = inputBus.getChannelData();
      var _panRadian2 = (panValue <= 0 ? panValue + 1 : panValue) * 0.5 * Math.PI;
      var _gainL2 = Math.cos(_panRadian2);
      var _gainR2 = Math.sin(_panRadian2);

      if (panValue <= 0) {
        for (var _i2 = 0; _i2 < blockSize; _i2++) {
          outputs[0][_i2] = inputs[0][_i2] + inputs[1][_i2] * _gainL2;
          outputs[1][_i2] = inputs[1][_i2] * _gainR2;
        }
      } else {
        for (var _i3 = 0; _i3 < blockSize; _i3++) {
          outputs[0][_i3] = inputs[0][_i3] * _gainL2;
          outputs[1][_i3] = inputs[1][_i3] + inputs[0][_i3] * _gainR2;
        }
      }
    }
  }
};

module.exports = StereoPannerNodeDSP;

},{}],125:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WaveShaperNodeDSP = {
  dspInit: function dspInit() {
    this._kernels = [];
  },
  dspUpdateKernel: function dspUpdateKernel(curve, numberOfChannels) {
    if (curve === null) {
      numberOfChannels = 0;
    }
    if (numberOfChannels < this._kernels.length) {
      this._kernels.splice(numberOfChannels);
    } else if (this._kernels.length < numberOfChannels) {
      while (numberOfChannels !== this._kernels.length) {
        this._kernels.push(new WaveShaperKernel(this, this._kernels.length));
      }
    }

    switch (numberOfChannels) {
      case 0:
        this.dspProcess = this.dspProcess0;
        break;
      case 1:
        this.dspProcess = this.dspProcess1;
        break;
      case 2:
        this.dspProcess = this.dspProcess2;
        break;
      default:
        this.dspProcess = this.dspProcessN;
        break;
    }
  },
  dspProcess0: function dspProcess0() {
    this.outputs[0].bus.copyFrom(this.inputs[0].bus);
  },
  dspProcess1: function dspProcess1() {
    var inputBus = this.inputs[0].bus;
    var outputBus = this.outputs[0].bus;
    var inputs = inputBus.getChannelData();
    var outputs = outputBus.getMutableData();
    var kernels = this._kernels;

    kernels[0].process(inputs[0], outputs[0], this._curve, this.blockSize);
  },
  dspProcess2: function dspProcess2() {
    var inputBus = this.inputs[0].bus;
    var outputBus = this.outputs[0].bus;
    var inputs = inputBus.getChannelData();
    var outputs = outputBus.getMutableData();
    var blockSize = this.blockSize;
    var curve = this._curve;
    var kernels = this._kernels;

    kernels[0].process(inputs[0], outputs[0], curve, blockSize);
    kernels[1].process(inputs[1], outputs[1], curve, blockSize);
  },
  dspProcessN: function dspProcessN() {
    var inputBus = this.inputs[0].bus;
    var outputBus = this.outputs[0].bus;
    var inputs = inputBus.getChannelData();
    var outputs = outputBus.getMutableData();
    var blockSize = this.blockSize;
    var curve = this._curve;
    var kernels = this._kernels;

    for (var i = 0, imax = kernels.length; i < imax; i++) {
      kernels[i].process(inputs[i], outputs[i], curve, blockSize);
    }
  }
};

var WaveShaperKernel = function () {
  function WaveShaperKernel() {
    _classCallCheck(this, WaveShaperKernel);
  }

  _createClass(WaveShaperKernel, [{
    key: "process",
    value: function process(input, output, curve, inNumSamples) {
      for (var i = 0; i < inNumSamples; i++) {
        var x = (Math.max(-1, Math.min(input[i], 1)) + 1) * 0.5;
        var ix = x * (curve.length - 1);
        var i0 = ix | 0;
        var i1 = i0 + 1;

        if (curve.length <= i1) {
          output[i] = curve[curve.length - 1];
        } else {
          output[i] = curve[i0] + ix % 1 * (curve[i1] - curve[i0]);
        }
      }
    }
  }]);

  return WaveShaperKernel;
}();

module.exports = WaveShaperNodeDSP;

},{}],126:[function(require,module,exports){
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
  BiquadFilterNode: require("./BiquadFilterNode"),
  ChannelMergerNode: require("./ChannelMergerNode"),
  ChannelSplitterNode: require("./ChannelSplitterNode"),
  ConstantSourceNode: require("./ConstantSourceNode"),
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

},{"./AnalyserNode":73,"./AudioBuffer":74,"./AudioBufferSourceNode":75,"./AudioContext":76,"./AudioDestinationNode":77,"./AudioListener":78,"./AudioNode":79,"./AudioParam":80,"./BiquadFilterNode":84,"./ChannelMergerNode":85,"./ChannelSplitterNode":86,"./ConstantSourceNode":87,"./ConvolverNode":88,"./DelayNode":89,"./DynamicsCompressorNode":90,"./GainNode":92,"./IIRFilterNode":93,"./OscillatorNode":94,"./PannerNode":95,"./PeriodicWave":96,"./ScriptProcessorNode":97,"./SpatialPannerNode":98,"./StereoPannerNode":99,"./WaveShaperNode":100}],127:[function(require,module,exports){
"use strict";

var nmap = require("nmap");

/**
 * @param {*} data
 * @return {boolean}
 */
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

/**
 * @param {object} data
 * @return {AudioData}
 */
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
    var _channelData = nmap(_numberOfChannels, function (_, ch) {
      return data.getChannelData(ch);
    });
    var _length = _numberOfChannels ? _channelData[0].length : 0;

    return { numberOfChannels: _numberOfChannels, length: _length, sampleRate: _sampleRate, channelData: _channelData };
  }
  return { numberOfChannels: 0, length: 0, sampleRate: 0, channelData: [] };
}

/**
 * @param {*} data
 * @return {boolean}
 */
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

/**
 * @param {object} data
 * @param {class}  AudioBuffer
 * @return {AudioBuffer}
 */
function toAudioBuffer(data, AudioBuffer) {
  data = toAudioData(data);

  var audioBuffer = new AudioBuffer({
    numberOfChannels: data.numberOfChannels,
    length: data.length,
    sampleRate: data.sampleRate
  });
  var audioData = (audioBuffer._impl || audioBuffer).audioData;

  audioData.numberOfChannels = data.numberOfChannels;
  audioData.length = data.length;
  audioData.sampleRate = data.sampleRate;
  audioData.channelData = data.channelData;

  return audioBuffer;
}

module.exports = { isAudioData: isAudioData, toAudioData: toAudioData, isAudioBuffer: isAudioBuffer, toAudioBuffer: toAudioBuffer };

},{"nmap":25}],128:[function(require,module,exports){
"use strict";

var _require = require("../constants/AudioParamEvent"),
    SET_VALUE_AT_TIME = _require.SET_VALUE_AT_TIME;

var _require2 = require("../constants/AudioParamEvent"),
    LINEAR_RAMP_TO_VALUE_AT_TIME = _require2.LINEAR_RAMP_TO_VALUE_AT_TIME;

var _require3 = require("../constants/AudioParamEvent"),
    EXPONENTIAL_RAMP_TO_VALUE_AT_TIME = _require3.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME;

var _require4 = require("../constants/AudioParamEvent"),
    SET_TARGET_AT_TIME = _require4.SET_TARGET_AT_TIME;

var _require5 = require("../constants/AudioParamEvent"),
    SET_VALUE_CURVE_AT_TIME = _require5.SET_VALUE_CURVE_AT_TIME;

/**
 * @param {object[]} timeline
 * @param {number}   time
 * @param {number}   defaultValue
 */


function computeValueAtTime(timeline, time, defaultValue) {
  var value = defaultValue;

  for (var i = 0, imax = timeline.length; i < imax; i++) {
    var e0 = timeline[i];
    var e1 = timeline[i + 1];
    var t0 = Math.min(time, e1 ? e1.time : time);

    if (time < e0.time) {
      break;
    }

    switch (e0.type) {
      case SET_VALUE_AT_TIME:
      case LINEAR_RAMP_TO_VALUE_AT_TIME:
      case EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
        value = e0.args[0];
        break;
      case SET_TARGET_AT_TIME:
        value = getTargetValueAtTime(t0, value, e0.args[0], e0.args[1], e0.args[2]);
        break;
      case SET_VALUE_CURVE_AT_TIME:
        value = getValueCurveAtTime(t0, e0.args[0], e0.args[1], e0.args[2]);
        break;
    }
    if (e1) {
      switch (e1.type) {
        case LINEAR_RAMP_TO_VALUE_AT_TIME:
          value = getLinearRampToValueAtTime(t0, value, e1.args[0], e0.time, e1.args[1]);
          break;
        case EXPONENTIAL_RAMP_TO_VALUE_AT_TIME:
          value = getExponentialRampToValueAtTime(t0, value, e1.args[0], e0.time, e1.args[1]);
          break;
      }
    }
  }

  return value;
}

function getLinearRampToValueAtTime(t, v0, v1, t0, t1) {
  var a;

  if (t <= t0) {
    return v0;
  }
  if (t1 <= t) {
    return v1;
  }

  a = (t - t0) / (t1 - t0);

  return v0 + a * (v1 - v0);
}

function getExponentialRampToValueAtTime(t, v0, v1, t0, t1) {
  var a;

  if (t <= t0) {
    return v0;
  }
  if (t1 <= t) {
    return v1;
  }

  a = (t - t0) / (t1 - t0);

  return v0 * Math.pow(v1 / v0, a);
}

function getTargetValueAtTime(t, v0, v1, t0, timeConstant) {
  if (t <= t0) {
    return v0;
  }
  return v1 + (v0 - v1) * Math.exp((t0 - t) / timeConstant);
}

function getValueCurveAtTime(t, curve, t0, duration) {
  var x, ix, i0, i1;
  var y0, y1, a;

  x = (t - t0) / duration;
  ix = x * (curve.length - 1);
  i0 = ix | 0;
  i1 = i0 + 1;

  if (curve.length <= i1) {
    return curve[curve.length - 1];
  }

  y0 = curve[i0];
  y1 = curve[i1];
  a = ix % 1;

  return y0 + a * (y1 - y0);
}

module.exports = { computeValueAtTime: computeValueAtTime, getLinearRampToValueAtTime: getLinearRampToValueAtTime, getExponentialRampToValueAtTime: getExponentialRampToValueAtTime, getTargetValueAtTime: getTargetValueAtTime, getValueCurveAtTime: getValueCurveAtTime };

},{"../constants/AudioParamEvent":59}],129:[function(require,module,exports){
"use strict";

var nmap = require("nmap");
var AudioDataUtils = require("./AudioDataUtils");

/**
 * @param {function}    decodeFn
 * @param {ArrayBuffer} audioData
 * @param {object}      opts
 * @return {Promise<AudioData>}
 */
function decode(decodeFn, audioData) {
  var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  return new Promise(function (resolve, reject) {
    return decodeFn(audioData, opts).then(function (result) {
      if (AudioDataUtils.isAudioData(result)) {
        if (typeof opts.sampleRate === "number") {
          result = resample(result, opts.sampleRate);
        }
        return resolve(result);
      }
      return reject(new TypeError("Failed to decode audio data"));
    }, reject);
  });
}

/**
 * @param {AudioData} audioData
 * @param {number}    sampleRate
 */
function resample(audioData, sampleRate) {
  if (audioData.sampleRate === sampleRate) {
    return audioData;
  }

  var rate = audioData.sampleRate / sampleRate;
  var numberOfChannels = audioData.channelData.length;
  var length = Math.round(audioData.channelData[0].length / rate);
  var channelData = nmap(numberOfChannels, function () {
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

module.exports = { decode: decode, resample: resample };

},{"./AudioDataUtils":127,"nmap":25}],130:[function(require,module,exports){
"use strict";

var AudioDataUtils = require("./AudioDataUtils");

/**
 * @param {function}  encodeFn
 * @param {AudioData} audioData
 * @param {object}    opts
 */
function encode(encodeFn, audioData) {
  var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (!AudioDataUtils.isAudioData(audioData)) {
    audioData = AudioDataUtils.toAudioData(audioData);
  }
  return encodeFn(audioData, opts);
}

module.exports = { encode: encode };

},{"./AudioDataUtils":127}],131:[function(require,module,exports){
"use strict";

function getFilterResponse(b, a, frequencyHz, magResponse, phaseResponse, sampleRate) {
  for (var i = 0, imax = frequencyHz.length; i < imax; i++) {
    var w0 = 2 * Math.PI * (frequencyHz[i] / sampleRate);
    var ca = compute(a, Math.cos, w0);
    var sa = compute(a, Math.sin, w0);
    var cb = compute(b, Math.cos, w0);
    var sb = compute(b, Math.sin, w0);

    magResponse[i] = Math.sqrt((cb * cb + sb * sb) / (ca * ca + sa * sa));
    phaseResponse[i] = Math.atan2(sa, ca) - Math.atan2(sb, cb);
  }
}

function compute(values, fn, w0) {
  var result = 0;

  for (var i = 0, imax = values.length; i < imax; i++) {
    result += values[i] * fn(w0 * i);
  }

  return result;
}

module.exports = { getFilterResponse: getFilterResponse };

},{}],132:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PCMArrayBufferWriter = function () {
  function PCMArrayBufferWriter(buffer) {
    _classCallCheck(this, PCMArrayBufferWriter);

    this._view = new DataView(buffer);
    this._pos = 0;
  }

  _createClass(PCMArrayBufferWriter, [{
    key: "pcm8",
    value: function pcm8(value) {
      value = Math.max(-1, Math.min(value, +1));
      value = (value * 0.5 + 0.5) * 128;
      this._view.setUint8(this._pos, value | 0);
      this._pos += 1;
    }
  }, {
    key: "pcm16",
    value: function pcm16(value) {
      value = Math.max(-1, Math.min(value, +1));
      value = value < 0 ? value * 32768 : value * 32767;
      this._view.setInt16(this._pos, value | 0, true);
      this._pos += 2;
    }
  }, {
    key: "pcm32",
    value: function pcm32(value) {
      value = Math.max(-1, Math.min(value, +1));
      value = value < 0 ? value * 2147483648 : value * 2147483647;
      this._view.setInt32(this._pos, value | 0, true);
      this._pos += 4;
    }
  }, {
    key: "pcm32f",
    value: function pcm32f(value) {
      this._view.setFloat32(this._pos, value, true);
      this._pos += 4;
    }
  }]);

  return PCMArrayBufferWriter;
}();

module.exports = PCMArrayBufferWriter;

},{}],133:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PCMBufferWriter = function () {
  function PCMBufferWriter(buffer) {
    _classCallCheck(this, PCMBufferWriter);

    this._buffer = buffer;
    this._pos = 0;
  }

  _createClass(PCMBufferWriter, [{
    key: "pcm8",
    value: function pcm8(value) {
      value = Math.max(-1, Math.min(value, +1));
      value = (value * 0.5 + 0.5) * 128;
      this._buffer.writeUInt8(value | 0, this._pos);
      this._pos += 1;
    }
  }, {
    key: "pcm16",
    value: function pcm16(value) {
      value = Math.max(-1, Math.min(value, +1));
      value = value < 0 ? value * 32768 : value * 32767;
      this._buffer.writeInt16LE(value | 0, this._pos);
      this._pos += 2;
    }
  }, {
    key: "pcm32",
    value: function pcm32(value) {
      value = Math.max(-1, Math.min(value, +1));
      value = value < 0 ? value * 2147483648 : value * 2147483647;
      this._buffer.writeInt32LE(value | 0, this._pos);
      this._pos += 4;
    }
  }, {
    key: "pcm32f",
    value: function pcm32f(value) {
      this._buffer.writeFloatLE(value, this._pos);
      this._pos += 4;
    }
  }]);

  return PCMBufferWriter;
}();

module.exports = PCMBufferWriter;

},{}],134:[function(require,module,exports){
(function (global){
"use strict";

var Buffer = global.Buffer;
var PCMArrayBufferWriter = require("./PCMArrayBufferWriter");
var PCMBufferWriter = require("./PCMBufferWriter");
var PCMWriter = getPCMWriter();
var alloc = getAllocFunction();

function create(length, format) {
  var bitDepth = resolveBitDepth(format.bitDepth, format.float);
  var methodName = resolveWriteMethodName(bitDepth, format.float);
  var bytes = bitDepth >> 3;
  var numberOfChannels = format.channels;
  var bufferLength = numberOfChannels * length * bytes;

  if (numberOfChannels === 1) {
    return {
      encode: function encode(channelData) {
        var buffer = alloc(bufferLength);
        var writer = new PCMWriter(buffer);
        var output = channelData[0];

        for (var i = 0, imax = length; i < imax; i++) {
          writer[methodName](output[i]);
        }

        return buffer;
      }
    };
  }

  if (numberOfChannels === 2) {
    return {
      encode: function encode(channelData) {
        var buffer = alloc(bufferLength);
        var writer = new PCMWriter(buffer);
        var outputL = channelData[0];
        var outputR = channelData[1];

        for (var i = 0, imax = length; i < imax; i++) {
          writer[methodName](outputL[i]);
          writer[methodName](outputR[i]);
        }

        return buffer;
      }
    };
  }

  return {
    encode: function encode(channelData) {
      var buffer = alloc(bufferLength);
      var writer = new PCMWriter(buffer);

      for (var i = 0, imax = length; i < imax; i++) {
        for (var ch = 0; ch < numberOfChannels; ch++) {
          writer[methodName](channelData[ch][i]);
        }
      }

      return buffer;
    }
  };
}

/* istanbul ignore next */
function resolveBitDepth(bitDepth, float) {
  return float ? 32 : bitDepth;
}

/* istanbul ignore next */
function resolveWriteMethodName(bitDepth, float) {
  if (float) {
    return "pcm32f";
  }
  return "pcm" + bitDepth;
}

/* istanbul ignore next */
function getPCMWriter() {
  return Buffer ? PCMBufferWriter : PCMArrayBufferWriter;
}

/* istanbul ignore next */
function getAllocFunction() {
  return Buffer ? Buffer.alloc ? Buffer.alloc : newBuffer : newArrayBuffer;
}

/* istanbul ignore next */
function newBuffer(size) {
  return new Buffer(size);
}

/* istanbul ignore next */
function newArrayBuffer(size) {
  return new Uint8Array(size).buffer;
}

module.exports = { create: create };

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./PCMArrayBufferWriter":132,"./PCMBufferWriter":133}],135:[function(require,module,exports){
"use strict";

module.exports.clamp = require("./utils/clamp");
module.exports.defaults = require("./utils/defaults");
module.exports.defineProp = require("./utils/defineProp");
module.exports.fill = require("./utils/fill");
module.exports.fillRange = require("./utils/fillRange");
module.exports.normalize = require("./utils/normalize");
module.exports.toArrayIfNeeded = require("./utils/toArrayIfNeeded");
module.exports.toAudioTime = require("./utils/toAudioTime");
module.exports.toDecibel = require("./utils/toDecibel");
module.exports.toGain = require("./utils/toGain");
module.exports.toImpl = require("./utils/toImpl");
module.exports.toNumber = require("./utils/toNumber");
module.exports.toPowerOfTwo = require("./utils/toPowerOfTwo");
module.exports.toValidBitDepth = require("./utils/toValidBitDepth");
module.exports.toValidBlockSize = require("./utils/toValidBlockSize");
module.exports.toValidNumberOfChannels = require("./utils/toValidNumberOfChannels");
module.exports.toValidSampleRate = require("./utils/toValidSampleRate");

},{"./utils/clamp":137,"./utils/defaults":138,"./utils/defineProp":139,"./utils/fill":140,"./utils/fillRange":141,"./utils/normalize":142,"./utils/toArrayIfNeeded":143,"./utils/toAudioTime":144,"./utils/toDecibel":145,"./utils/toGain":146,"./utils/toImpl":147,"./utils/toNumber":148,"./utils/toPowerOfTwo":149,"./utils/toValidBitDepth":150,"./utils/toValidBlockSize":151,"./utils/toValidNumberOfChannels":152,"./utils/toValidSampleRate":153}],136:[function(require,module,exports){
(function (global){
"use strict";

module.exports = global.setImmediate /* istanbul ignore next */ || function (fn) {
  return setTimeout(fn, 0);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],137:[function(require,module,exports){
"use strict";

/**
 * @param {number} value
 * @param {number} minValue
 * @param {number} maxValue
 */

function clamp(value, minValue, maxValue) {
  return Math.max(minValue, Math.min(value, maxValue));
}

module.exports = clamp;

},{}],138:[function(require,module,exports){
"use strict";

/**
 * @param {*} value
 * @param {*) defaultValue
 */

function defaults(value, defaultValue) {
  return typeof value !== "undefined" ? value : defaultValue;
}

module.exports = defaults;

},{}],139:[function(require,module,exports){
"use strict";

/**
 * @param {object} target
 * @param {string} name
 * @param {*}      value
 */

function defineProp(target, name, value) {
  Object.defineProperty(target, name, { value: value, enumerable: false, writable: true, configurable: true });
}

module.exports = defineProp;

},{}],140:[function(require,module,exports){
"use strict";

/**
 * @param {number[]} list
 * @param {number}   value
 * @return {number[]}
 */

function fill(list, value) {
  if (list.fill) {
    return list.fill(value);
  }

  for (var i = 0, imax = list.length; i < imax; i++) {
    list[i] = value;
  }

  return list;
}

module.exports = fill;

},{}],141:[function(require,module,exports){
"use strict";

/**
 * @param {number[]} list
 * @param {number}   value
 * @param {number}   start
 * @param {number}   end
 * @return {number[]}
 */

function fillRange(list, value, start, end) {
  if (list.fill) {
    return list.fill(value, start, end);
  }

  for (var i = start; i < end; i++) {
    list[i] = value;
  }

  return list;
}

module.exports = fillRange;

},{}],142:[function(require,module,exports){
"use strict";

var clamp = require("./clamp");

/**
 * normalize - returns a number between 0 - 1
 * @param {number} value
 * @param {number} minValue
 * @param {number} maxValue
 */
function normalize(value, minValue, maxValue) {
  var val = (value - minValue) / (maxValue - minValue);
  return clamp(val, 0, 1);
}

module.exports = normalize;

},{"./clamp":137}],143:[function(require,module,exports){
"use strict";

/**
 * @param {*} value
 * @return {Array}
 */

function toArrayIfNeeded(value) {
  return Array.isArray(value) ? value : [value];
}

module.exports = toArrayIfNeeded;

},{}],144:[function(require,module,exports){
"use strict";

/**
 * @param {number|string} str
 * @return {number}
 */

function toAudioTime(str) {
  if (Number.isFinite(+str)) {
    return Math.max(0, +str);
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

},{}],145:[function(require,module,exports){
"use strict";

/**
 * @param {*} value
 * @return {number}
 */

function toDecibel(value) {
  return 20 * Math.log10(value);
}

module.exports = toDecibel;

},{}],146:[function(require,module,exports){
"use strict";

/**
 * @param {*} value
 * @return {number}
 */

function toGain(value) {
  return Math.sqrt(Math.pow(10, value / 10));
}

module.exports = toGain;

},{}],147:[function(require,module,exports){
"use strict";

/**
 * @param {object} value
 * @return {object}
 */

function toImpl(value) {
  return value._impl || value;
}

module.exports = toImpl;

},{}],148:[function(require,module,exports){
"use strict";

/**
 * @param {*} value
 * @return {number}
 */

function toNumber(value) {
  return +value || 0;
}

module.exports = toNumber;

},{}],149:[function(require,module,exports){
"use strict";

/**
 * @param {number}   value
 * @param {function} round
 * @return {number}
 */

function toPowerOfTwo(value, round) {
  round = round || Math.round;
  return 1 << round(Math.log(value) / Math.log(2));
}

module.exports = toPowerOfTwo;

},{}],150:[function(require,module,exports){
"use strict";
"use stirct";

/**
 * @param {number} value
 * @return {number}
 */

function toValidBitDepth(value) {
  value = value | 0;
  if (value === 8 || value === 16 || value === 32) {
    return value;
  }
  return 16;
}

module.exports = toValidBitDepth;

},{}],151:[function(require,module,exports){
"use strict";

var clamp = require("./clamp");
var toPowerOfTwo = require("./toPowerOfTwo");

var _require = require("../../constants"),
    MIN_BLOCK_SIZE = _require.MIN_BLOCK_SIZE,
    MAX_BLOCK_SIZE = _require.MAX_BLOCK_SIZE;

/**
 * @param {number} value
 * @return {number}
 */


function toValidBlockSize(value) {
  return clamp(toPowerOfTwo(value), MIN_BLOCK_SIZE, MAX_BLOCK_SIZE);
}

module.exports = toValidBlockSize;

},{"../../constants":66,"./clamp":137,"./toPowerOfTwo":149}],152:[function(require,module,exports){
"use strict";

var toNumber = require("./toNumber");
var clamp = require("./clamp");

var _require = require("../../constants"),
    MAX_NUMBER_OF_CHANNELS = _require.MAX_NUMBER_OF_CHANNELS;

/**
 * @param {number} value
 * @return {number}
 */


function toValidNumberOfChannels(value) {
  return clamp(toNumber(value), 1, MAX_NUMBER_OF_CHANNELS) | 0;
}

module.exports = toValidNumberOfChannels;

},{"../../constants":66,"./clamp":137,"./toNumber":148}],153:[function(require,module,exports){
"use strict";

var toNumber = require("./toNumber");
var clamp = require("./clamp");

var _require = require("../../constants"),
    MIN_SAMPLERATE = _require.MIN_SAMPLERATE,
    MAX_SAMPLERATE = _require.MAX_SAMPLERATE;

/**
 * @param {number} value
 * @return {number}
 */


function toValidSampleRate(value) {
  return clamp(toNumber(value), MIN_SAMPLERATE, MAX_SAMPLERATE) | 0;
}

module.exports = toValidSampleRate;

},{"../../constants":66,"./clamp":137,"./toNumber":148}],154:[function(require,module,exports){
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

},{"./api":56,"./context/OfflineAudioContext":67,"./context/RenderingAudioContext":68,"./context/StreamAudioContext":69,"./context/WebAudioContext":70,"./decoder":71,"./encoder":72,"./impl":126}]},{},[154])(154)
});