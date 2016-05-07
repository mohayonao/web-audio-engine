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
        const biquad = new wae.impl.BiquadFilterNode(context);

        biquad.inputs[0].bus.setNumberOfChannels(this.numberOfChannels);
        biquad.inputs[0].bus.getMutableData();
        biquad.outputs[0].bus.setNumberOfChannels(this.numberOfChannels);

        biquad.getFrequency().setValueAtTime(350.0, 0);
        biquad.getFrequency().linearRampToValueAtTime(700.0, 1);
        biquad.getFrequency().dspProcess();
      },
      fn() {
        biquad.dspProcess();
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
