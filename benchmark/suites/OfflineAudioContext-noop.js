"use strict";

const benchmark = require("benchmark");
const waeSrc = require("../../src");
const waeLib = require("../../lib");
const waeBld = require("../../build/web-audio-engine");

function run(done) {
  const suite = new benchmark.Suite();

  function setup(wae) {
    return {
      wae,
      defer: true,
      setup() {
        const wae = this.wae;
      },
      fn(deffered) {
        const context = new wae.OfflineAudioContext(2, 44100, 44100);

        context.startRendering().then(() => {
          deffered.resolve();
        });
      }
    };
  }

  suite.add("src", setup(waeSrc));
  suite.add("lib", setup(waeLib));
  suite.add("bld", setup(waeBld));

  suite.on("cycle", (e) => {
    console.log(e.target.toString());
  });

  suite.on("complete", () => {
    console.log("* Fastest is " + suite.filter("fastest").map("name"));
    console.log();
    done();
  });

  suite.run({ async: true });
}

module.exports = (done) => {
  run(done);
};

if (module.parent === null) {
  module.exports(process.exit);
}
