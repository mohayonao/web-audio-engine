"use strict";

const benchmark = require("benchmark");
const dev = require("../../");
const build = require("../../build/web-audio-engine");

function requireAPIIfExists(name) {
  try {
    return require("../" + name);
  } catch (e) {
    return null;
  }
}

module.exports = (func, target) => {
  const suite = new benchmark.Suite();

  function runInOfflineAudioContext(api) {
    return (deferred) => {
      const context = new api.OfflineAudioContext(2, 44100, 44100);

      context._renderingIterations = 65536;

      func(context);

      context.startRendering().then(() => {
        deferred.resolve();
      });
    };
  }

  if (target) {
    target.forEach((name) => {
      const api = requireAPIIfExists(name);

      if (!api || typeof api.OfflineAudioContext !== "function") {
        return console.log(`api: ${ name } is not found`);
      }

      suite.add(name, runInOfflineAudioContext(api), { defer: true });
    });
  }

  suite.add("build", runInOfflineAudioContext(build), { defer: true });
  suite.add("dev", runInOfflineAudioContext(dev), { defer: true });

  suite.on("cycle", (e) => {
    console.log(e.target.toString());
  });

  suite.on("complete", () => {
    console.log("Fastest is " + suite.filter("fastest").map("name"));
  });

  suite.run({ async: true });
};
