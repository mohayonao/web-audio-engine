"use strict";

 module.exports =  global.setImmediate /* istanbul ignore next */ || (fn => setTimeout(fn, 0));
