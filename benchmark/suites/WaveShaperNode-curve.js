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
        const shaper = new wae.impl.WaveShaperNode(context);
        const curve = new Float32Array(1024).map((_, i) => Math.sin(i / 1024 * Math.PI * 2));

        shaper.inputs[0].bus.setNumberOfChannels(this.numberOfChannels);
        shaper.inputs[0].bus.getMutableData();
        shaper.outputs[0].bus.setNumberOfChannels(this.numberOfChannels);

        shaper.setCurve(curve);
      },
      fn() {
        shaper.dspProcess();
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
  run(2);
  run(4);
  done();
};

if (module.parent === null) {
  module.exports(process.exit);
}
