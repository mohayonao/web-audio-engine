"use strict";

require("run-with-mocha");

const assert = require("power-assert");
const deepEqual = require("deep-equal");
const attrTester = require("../helpers/attrTester");
const np = require("../helpers/np");
const AudioContext = require("../../src/impl/AudioContext");
const AnalyserNode = require("../../src/impl/AnalyserNode");
const AudioNode = require("../../src/impl/AudioNode");
const OscillatorNode = require("../../src/impl/OscillatorNode");

const context = new AudioContext({ sampleRate: 8000, blockSize: 32 });
const testSpec = {};

// test nodes
let oscillator;
let analyser;
let channel;
let channels;

testSpec.numberOfInputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.numberOfOutputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.fftSize = {
  defaultValue: 2048,
  testCase: [
    { value: 16, expected: 32 },
    { value: 1024, expected: 1024 },
    { value: 2000, expected: 2048 },
    { value: 65536, expected: 32768 }
  ]
};

testSpec.frequencyBinCount = {
  testCase: [
    { expected: 1024 }
  ]
};

testSpec.minDecibels = {
  defaultValue: -100,
  testCase: [
    { value:  -40, expected:  -40 },
    { value: -120, expected: -120 },
    { value:  -20, expected: -120, message: "should be ignored if less 'maxDecibels'" },
    { value: -Infinity, expected: -120, message: "should be a finite number" }
  ]
};

testSpec.maxDecibels = {
  defaultValue: -30,
  testCase: [
    { value: -10, expected: -10 },
    { value: -90, expected: -90 },
    { value: -120, expected: -90, message: "should be ignored if greater 'minDecibels'" },
    { value: Infinity, expected: -90, message: "should be a finite number" }
  ]
};

testSpec.smoothingTimeConstant = {
  defaultValue: 0.8,
  testCase: [
    { value: 0.4, expected: 0.4 },
    { value: -0.1, expected: 0.0 },
    { value: +1.2, expected: 1.0 }
  ]
};

describe("AnalyserNode", () => {
  describe("inherits", () => {
    it("AnalyserNode < AudioNode", () => {
      const node = new AnalyserNode(context);

      assert(node instanceof AudioNode);
      assert(node instanceof AnalyserNode);
    });
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: AnalyserNode,
      testSpec
    });
  });

  describe("channel configuration", () => {
    it("should synchronize with the input", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new AnalyserNode(context);
      const node3 = new AudioNode(context, { inputs: [ 1 ] });

      node1.outputs[0].enable();
      node2.outputs[0].enable();
      node2.connect(node3);

      assert(node2.inputs[0].getNumberOfChannels() === 1);
      assert(node3.inputs[0].getNumberOfChannels() === 1);

      node1.connect(node2);

      assert(node2.inputs[0].getNumberOfChannels() === 4);
      assert(node3.inputs[0].getNumberOfChannels() === 4);
    });
  });

  describe("processing", () => {

    beforeEach(() => {
      channel = new Float32Array(context.blockSize);
      channels = [channel];

      // create nodes
      oscillator = new OscillatorNode(context);
      analyser = new AnalyserNode(context);
      analyser.setFftSize(context.blockSize);

      // connect nodes
      oscillator.connect(analyser);
      analyser.connect(context.getDestination());

      // resume
      oscillator.start();
      context.resume();
    });

    afterEach(() => {
      analyser.disconnect(context.getDestination());
      oscillator.disconnect(analyser);
    });

    it("should be setup correctly", () => {
      const fftSize = analyser.getFftSize();
      // before processing
      assert(analyser._timeDomainBuffer.length === 0);
      assert(analyser._previousSmooth.length === fftSize / 2);
      assert(analyser._blackmanTable.length === fftSize);
      // after processing
      context.process(channels, 0);
      assert(analyser._timeDomainBuffer.length === context.blockSize);
      assert(analyser._timeDomainBuffer.length === fftSize);
      assert(deepEqual(channel, analyser._timeDomainBuffer));
    });

    it("should throw when called without an array", () => {
      [
        'getByteTimeDomainData',
        'getFloatTimeDomainData',
        'getByteFrequencyData',
        'getFloatFrequencyData'
      ].forEach((fnName) => {
        // argument is an array
        assert.doesNotThrow(() => analyser[fnName]([]), Error);
        // argument is not an array
        assert.throws(() => analyser[fnName](), Error);
      });
    });

    it("should get time domain data (float)", () => {
      const waveform = new Float32Array(channel.length);
      assert(deepEqual(waveform, np.zeros(channel.length)));

      analyser.getFloatTimeDomainData(waveform);
      assert(deepEqual(waveform, np.zeros(channel.length)));

      context.process(channels, 0);
      analyser.getFloatTimeDomainData(waveform);
      assert(deepEqual(waveform, channel));
    });

    it("should get time domain data (byte)", () => {
      const waveform = new Uint8Array(channel.length);
      assert(deepEqual(waveform, np.zeros(channel.length)));

      analyser.getByteTimeDomainData(waveform);
      assert(deepEqual(waveform, np.full(channel.length, 128)));

      context.process(channels, 0);
      analyser.getByteTimeDomainData(waveform);
      assert(deepEqual(waveform, [
        128, 171, 209, 237, 253, 253, 239, 212,
        174, 132,  88,  49,  20,   3,   1,  14,
        40,   77, 119, 163, 202, 233, 251, 254,
        243, 218, 182, 139,  96,  56,  24,   5
      ]));
    });

    it("should get frequency data (float)", () => {
      const spectrum = new Float32Array(channel.length);
      assert(deepEqual(spectrum, np.zeros(channel.length)));

      analyser.getFloatFrequencyData(spectrum);
      assert(deepEqual(spectrum, np.zeros(channel.length)));

      context.process(channels, 0);
      analyser.getFloatFrequencyData(spectrum);
      assert(deepEqual(spectrum.slice(16), np.zeros(channel.length / 2)));
      assert(spectrum[0] === -31.810009002685547);
      assert(spectrum[4] === -52.464996337890625);
      assert(spectrum[8] === -99.65359497070312);
      assert(spectrum[15] === -114.25790405273438);
    });

    it("should get frequency data (byte)", () => {
      const spectrum = new Uint8Array(channel.length);
      assert(deepEqual(spectrum, np.zeros(channel.length)));

      analyser.getByteFrequencyData(spectrum);
      assert(deepEqual(spectrum, np.full(channel.length, 255)));

      context.process(channels, 0);
      analyser.getByteFrequencyData(spectrum);
      assert(deepEqual(spectrum.slice(16), np.full(channel.length / 2, 255)));
      assert(spectrum[0] === 248);
      assert(spectrum[4] === 173);
      assert(spectrum[8] === 1);
      assert(spectrum[15] === 0);
    });

  });

});
