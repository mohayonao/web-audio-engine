"use strict";

const benchmark = require("benchmark");
const waeSrc = require("../../src");
const waeLib = require("../../lib");
const waeBld = require("../../build/web-audio-engine");

function run(numberOfChannels) {
  const suite = new benchmark.Suite();

  function setup(wae) {
    return {
      wae, numberOfChannels,
      setup() {
        const wae = this.wae;
        const context = new wae.impl.AudioContext();
        const buffer = new wae.impl.AudioBuffer(context, {
          numberOfChannels: this.numberOfChannels, length: 1024, sampleRate: context.sampleRate
        });
        const bufSrc = new wae.impl.AudioBufferSourceNode(context);

        bufSrc.setBuffer(buffer);
        bufSrc.start(0);
        bufSrc.getPlaybackRate().value = 1;
      },
      fn() {
        bufSrc.dspProcess();
      }
    };
  }

  suite.add(`src ${ numberOfChannels }ch`, setup(waeSrc));
  suite.add(`lib ${ numberOfChannels }ch`, setup(waeLib));
  suite.add(`bld ${ numberOfChannels }ch`, setup(waeBld));

  suite.on("cycle", (e) => {
    console.log(e.target.toString());
  });

  suite.on("complete", () => {
    console.log("* Fastest is " + suite.filter("fastest").map("name"));
    console.log();
  });

  suite.on("error", (e) => {
    console.error(e);
  });

  suite.run();
}

module.exports = (done) => {
  run(1);
  done();
};

if (module.parent === null) {
  module.exports(process.exit);
}
