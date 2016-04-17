"use strict";

const wae = require("../..");
const WebAudioScheduler = require("web-audio-scheduler");
const timerAPI = require("../util/timerAPI");
const consoleAPI = require("../util/consoleAPI");
const createContextOptions = require("../util/createContextOptions");
const fetchAudioBuffer = require("../util/fetchAudioBuffer");

function runInStreamAudioContext(func, opts) {
  const AudioContext = wae.StreamAudioContext;
  const context = new AudioContext(createContextOptions(opts));
  const util = {};

  util.WebAudioScheduler = WebAudioScheduler;
  util.fetchAudioBuffer = fetchAudioBuffer.bind(null, context);
  util.end = () => { process.exit(0) };

  if (opts.verbose === false) {
    consoleAPI.replaceConsoleAPI({ "*": () => {} });
  } else {
    consoleAPI.replaceConsoleAPI({ "*": console.error });
  }

  context.pipe(process.stdout);

  const promise = func(context, util) || Promise.resolve();

  return promise.then(() => {
    return context.resume();
  });
}

module.exports = runInStreamAudioContext;
