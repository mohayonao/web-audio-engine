"use strict";

const wae = require("../..");
const fs = require("fs");
const tickable = require("tickable-timer");
const timerAPI = require("../util/timerAPI");
const consoleAPI = require("../util/consoleAPI");
const createContextOptions = require("../util/createContextOptions");
const fetchAudioBuffer = require("../util/fetchAudioBuffer");

function runInRenderingAudioContext(func, opts) {
  const AudioContext = wae.RenderingAudioContext;
  const context = new AudioContext(createContextOptions(opts));
  const util = {};

  util.fetchAudioBuffer = fetchAudioBuffer.bind(null, context);
  util.end = () => { opts.isEnded = true };

  timerAPI.replaceTimerAPI(tickable);

  if (opts.verbose === false) {
    consoleAPI.replaceConsoleAPI({ "*": () => {} });
  }

  const promise = func(context, util) || Promise.resolve();

  return promise.then(() => {
    return render(context, opts);
  });
}

function render(context, opts) {
  const beginTime = Date.now();
  const duration = Math.max(0, opts.duration) || 10;
  const iterations = Math.ceil((duration * context.sampleRate) / context.blockSize);
  const processingTimeInFrames = context.blockSize / context.sampleRate;

  for (let i = 0; i < iterations && !opts.isEnded; i++) {
    tickable.tick(processingTimeInFrames * 1000);
    context.processTo(processingTimeInFrames * i);
  }

  const endTime = Date.now();
  const outputFilename = opts.out || "out.wav";
  const audioData = context.exportAsAudioData();

  return context.encodeAudioData(audioData).then((arrayBuffer) => {
    fs.writeFile(outputFilename, new Buffer(arrayBuffer), () => {
      const renderingTime = (endTime - beginTime) / 1000;
      const duration = context.currentTime;

      console.log(`rendering time: ${ renderingTime }sec; duration: ${ duration }sec`);
    });
  });
}

module.exports = runInRenderingAudioContext;
