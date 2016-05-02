"use strict";

const benchmark = require("benchmark");
const waeSrc = require("../../src");
const waeLib = require("../../lib");
const waeBld = require("../../build/web-audio-engine");

const suite = new benchmark.Suite();

function run(wae, done) {
  const context = new wae.OfflineAudioContext(2, 44100, 44100);

  context.startRendering().then(done);
}

suite.add("src", (deffered) => {
  run(waeSrc, deffered.resolve.bind(deffered));
}, { defer: true });

suite.add("lib", (deffered) => {
  run(waeLib, deffered.resolve.bind(deffered));
}, { defer: true });

suite.add("bld", (deffered) => {
  run(waeBld, deffered.resolve.bind(deffered));
}, { defer: true });

suite.on("cycle", (e) => {
  console.log(e.target.toString());
});

suite.on("complete", () => {
  console.log("Fastest is " + suite.filter("fastest").map("name"));
});

suite.run({ async: true });
