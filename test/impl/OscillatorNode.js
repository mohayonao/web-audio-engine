"use strict";

const assert = require("power-assert");
const sinon = require("sinon");
const deepEqual = require("deep-equal");
const np = require("../helpers/np");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const OscillatorNode = require("../../src/impl/OscillatorNode");
const AudioNode = require("../../src/impl/AudioNode");
const AudioSourceNode = require("../../src/impl/AudioSourceNode");
const PeriodicWave = require("../../src/impl/PeriodicWave");
const AudioParam = require("../../src/impl/AudioParam");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
const wave = new PeriodicWave(context, { real: [ 0, 0 ], imag: [ 0, 1 ] });
const testSpec = {};

testSpec.numberOfInputs = {
  testCase: [ { expected: 0 } ]
};

testSpec.numberOfOutputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.type = {
  testCase: [
    { value: "sine", expected: "sine" },
    { value: "sawtooth", expected: "sawtooth" },
    { value: "triangle", expected: "triangle" },
    { value: "square", expected: "square" },
    { value: "custom", expected: "square" }
  ]
};

testSpec.frequency = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.detune = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.periodicWave = {
  testCase: [
    { value: wave, expected: wave }
  ]
};

describe("OscillatorNode", () => {
  describe("inherits", () => {
    it("OscillatorNode < AudioSourceNode", () => {
      const node = new OscillatorNode(context);

      assert(node instanceof OscillatorNode);
      assert(node instanceof AudioSourceNode);
    });
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: OscillatorNode,
      testSpec
    });
  });

  describe("channel configuration", () => {
    it("should be mono output", () => {
      const node1 = new OscillatorNode(context);
      const node2 = new AudioNode(context, { inputs: [ 1 ] });

      node1.connect(node2);

      assert(node2.inputs[0].getNumberOfChannels() === 1);
    });
  });

  describe("processing", () => {
    const channelData = [ new Float32Array(16), new Float32Array(16) ];

    before(() => {
      context.resume();
    });

    it("start - stop", () => {
      const node = new OscillatorNode(context);
      const onended = sinon.spy();

      node.start((16+4)/8000);
      node.stop((48+2)/8000);
      node.connect(context.getDestination());
      node.addEventListener("ended", onended);

      context.process(channelData, 0);
      assert(deepEqual(channelData[0], np.zeros(16)));
      assert(deepEqual(channelData[1], np.zeros(16)));

      context.process(channelData, 0);
      assert(deepEqual(channelData[0].subarray(0, 5), np.zeros(5)));
      assert(deepEqual(channelData[1].subarray(0, 5), np.zeros(5)));
      assert(channelData[0].subarray(5).every(x => x !== 0));
      assert(channelData[1].subarray(5).every(x => x !== 0));

      context.process(channelData, 0);
      assert(channelData[0].every(x => x !== 0));
      assert(channelData[1].every(x => x !== 0));
      assert(onended.callCount === 0);

      context.process(channelData, 0);
      assert(channelData[0].subarray(0, 2).every(x => x !== 0));
      assert(channelData[1].subarray(0, 2).every(x => x !== 0));
      assert(deepEqual(channelData[0].subarray(2), np.zeros(14)));
      assert(deepEqual(channelData[1].subarray(2), np.zeros(14)));
      assert(onended.callCount === 1);

      context.process(channelData, 0);
      assert(deepEqual(channelData[0], np.zeros(16)));
      assert(deepEqual(channelData[1], np.zeros(16)));
      assert(onended.callCount === 1);
    });
  });
});
