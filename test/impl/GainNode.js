"use strict";

require("run-with-mocha");

const assert = require("power-assert");
const deepEqual = require("deep-equal");
const np = require("../helpers/np");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const GainNode = require("../../src/impl/GainNode");
const AudioParam = require("../../src/impl/AudioParam");
const AudioNode = require("../../src/impl/AudioNode");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
const testSpec = {};

testSpec.numberOfInputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.numberOfOutputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.gain = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

describe("GainNode", () => {
  describe("inherits", () => {
    it("GainNode < AudioNode", () => {
      const node = new GainNode(context);

      assert(node instanceof GainNode);
      assert(node instanceof AudioNode);
    });
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: GainNode,
      testSpec
    });
  });

  describe("channel configuration", () => {
    it("should synchronize with the input", () => {
      const node1 = new AudioNode(context, { outputs: [ 4 ] });
      const node2 = new GainNode(context);
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
    const channelData = [ new Float32Array(16), new Float32Array(16) ];

    describe("channel: mono", () => {
      let node1, node2;

      beforeEach(() => {
        context.reset();
        context.resume();

        node1 = new AudioNode(context, { outputs: [ 1 ] });
        node2 = new GainNode(context);
        node1.enableOutputsIfNecessary();
        node1.connect(node2);
        node2.connect(context.getDestination());
      });

      describe("hasSampleAccurateValues: false", () => {
        it("input: silent", () => {
          node1.outputs[0].bus.zeros();
          node2.getGain().setValue(1);
          context.process(channelData, 0);

          const actual = node2.outputs[0].bus.getChannelData()[0];
          const expected = np.zeros(16);

          assert(deepEqual(actual, expected));
          assert(node2.outputs[0].bus.isSilent === true);
        });

        it("value: 0", () => {
          const noise = np.random_sample(16);

          node1.outputs[0].bus.getMutableData()[0].set(noise);
          node2.getGain().setValue(0);
          context.process(channelData, 0);

          const actual = node2.outputs[0].bus.getChannelData()[0];
          const expected = np.zeros(16);

          assert(deepEqual(actual, expected));
          assert(node2.outputs[0].bus.isSilent === true);
        });

        it("value: 1", () => {
          const noise = np.random_sample(16);

          node1.outputs[0].bus.getMutableData()[0].set(noise);
          node2.getGain().setValue(1);
          context.process(channelData, 0);

          const actual = node2.outputs[0].bus.getChannelData()[0];
          const expected = noise;

          assert(deepEqual(actual, expected));
          assert(node2.outputs[0].bus.isSilent === false);
        });

        it("value: 2", () => {
          const noise = np.random_sample(16);

          node1.outputs[0].bus.getMutableData()[0].set(noise);
          node2.getGain().setValue(2);
          context.process(channelData, 0);

          const actual = node2.outputs[0].bus.getChannelData()[0];
          const expected = noise.map(x => x * 2);

          assert(deepEqual(actual, expected));
          assert(node2.outputs[0].bus.isSilent === false);
        });
      });
      describe("hasSampleAccurateValues: true", () => {
        it("works", () => {
          const noise = np.random_sample(16);

          node1.outputs[0].bus.getMutableData()[0].set(noise);
          node2.getGain().setValueAtTime(0, 0);
          node2.getGain().linearRampToValueAtTime(1, 16/8000);
          context.process(channelData, 0);

          const actual = node2.outputs[0].bus.getChannelData()[0];
          const expected = noise.map((x, i) => x * (i / 16));

          assert(deepEqual(actual, expected));
          assert(node2.outputs[0].bus.isSilent === false);
        });
      });

      describe("channel: stereo", () => {
        let node1, node2;

        beforeEach(() => {
          context.reset();
          context.resume();

          node1 = new AudioNode(context, { outputs: [ 2 ] });
          node2 = new GainNode(context);
          node1.enableOutputsIfNecessary();
          node1.connect(node2);
          node2.connect(context.getDestination());
        });

        describe("hasSampleAccurateValues: false", () => {
          it("input: silent", () => {
            node1.outputs[0].bus.zeros();
            node2.getGain().setValue(1);
            context.process(channelData, 0);

            const actualL = node2.outputs[0].bus.getChannelData()[0];
            const actualR = node2.outputs[0].bus.getChannelData()[1];
            const expectedL = np.zeros(16);
            const expectedR = np.zeros(16);

            assert(deepEqual(actualL, expectedL));
            assert(deepEqual(actualR, expectedR));
            assert(node2.outputs[0].bus.isSilent === true);
          });

          it("value: 0", () => {
            const noiseL = np.random_sample(16);
            const noiseR = np.random_sample(16);

            node1.outputs[0].bus.getMutableData()[0].set(noiseL);
            node1.outputs[0].bus.getMutableData()[1].set(noiseR);
            node2.getGain().setValue(0);
            context.process(channelData, 0);

            const actualL = node2.outputs[0].bus.getChannelData()[0];
            const actualR = node2.outputs[0].bus.getChannelData()[1];
            const expectedL = np.zeros(16);
            const expectedR = np.zeros(16);

            assert(deepEqual(actualL, expectedL));
            assert(deepEqual(actualR, expectedR));
            assert(node2.outputs[0].bus.isSilent === true);
          });

          it("value: 1", () => {
            const noiseL = np.random_sample(16);
            const noiseR = np.random_sample(16);

            node1.outputs[0].bus.getMutableData()[0].set(noiseL);
            node1.outputs[0].bus.getMutableData()[1].set(noiseR);
            node2.getGain().setValue(1);
            context.process(channelData, 0);

            const actualL = node2.outputs[0].bus.getChannelData()[0];
            const actualR = node2.outputs[0].bus.getChannelData()[1];
            const expectedL = noiseL;
            const expectedR = noiseR;

            assert(deepEqual(actualL, expectedL));
            assert(deepEqual(actualR, expectedR));
            assert(node2.outputs[0].bus.isSilent === false);
          });

          it("value: 2", () => {
            const noiseL = np.random_sample(16);
            const noiseR = np.random_sample(16);

            node1.outputs[0].bus.getMutableData()[0].set(noiseL);
            node1.outputs[0].bus.getMutableData()[1].set(noiseR);
            node2.getGain().setValue(2);
            context.process(channelData, 0);

            const actualL = node2.outputs[0].bus.getChannelData()[0];
            const actualR = node2.outputs[0].bus.getChannelData()[1];
            const expectedL = noiseL.map(x => x * 2);
            const expectedR = noiseR.map(x => x * 2);

            assert(deepEqual(actualL, expectedL));
            assert(deepEqual(actualR, expectedR));
            assert(node2.outputs[0].bus.isSilent === false);
          });
        });
        describe("hasSampleAccurateValues: true", () => {
          it("works", () => {
            const noiseL = np.random_sample(16);
            const noiseR = np.random_sample(16);

            node1.outputs[0].bus.getMutableData()[0].set(noiseL);
            node1.outputs[0].bus.getMutableData()[1].set(noiseR);
            node2.getGain().setValueAtTime(0, 0);
            node2.getGain().linearRampToValueAtTime(1, 16/8000);
            context.process(channelData, 0);

            const actualL = node2.outputs[0].bus.getChannelData()[0];
            const actualR = node2.outputs[0].bus.getChannelData()[1];
            const expectedL = noiseL.map((x, i) => x * (i / 16));
            const expectedR = noiseR.map((x, i) => x * (i / 16));

            assert(deepEqual(actualL, expectedL));
            assert(deepEqual(actualR, expectedR));
            assert(node2.outputs[0].bus.isSilent === false);
          });
        });
      });

      describe("channel: else", () => {
        let node1, node2;

        beforeEach(() => {
          context.reset();
          context.resume();

          node1 = new AudioNode(context, { outputs: [ 4 ] });
          node2 = new GainNode(context);
          node1.enableOutputsIfNecessary();
          node1.connect(node2);
          node2.connect(context.getDestination());
        });

        describe("hasSampleAccurateValues: false", () => {
          it("works", () => {
            const noiseL = np.random_sample(16);
            const noiseR = np.random_sample(16);
            const noiseSL = np.random_sample(16);
            const noiseSR = np.random_sample(16);

            node1.outputs[0].bus.getMutableData()[0].set(noiseL);
            node1.outputs[0].bus.getMutableData()[1].set(noiseR);
            node1.outputs[0].bus.getMutableData()[2].set(noiseSL);
            node1.outputs[0].bus.getMutableData()[3].set(noiseSR);
            node2.getGain().setValue(2);
            context.process(channelData, 0);

            const actualL = node2.outputs[0].bus.getChannelData()[0];
            const actualR = node2.outputs[0].bus.getChannelData()[1];
            const actualSL = node2.outputs[0].bus.getChannelData()[2];
            const actualSR = node2.outputs[0].bus.getChannelData()[3];
            const expectedL = noiseL.map(x => x * 2);
            const expectedR = noiseR.map(x => x * 2);
            const expectedSL = noiseSL.map(x => x * 2);
            const expectedSR = noiseSR.map(x => x * 2);

            assert(deepEqual(actualL, expectedL));
            assert(deepEqual(actualR, expectedR));
            assert(deepEqual(actualSL, expectedSL));
            assert(deepEqual(actualSR, expectedSR));
            assert(node2.outputs[0].bus.isSilent === false);
          });
        });
        describe("hasSampleAccurateValues: true", () => {
          it("works", () => {
            const noiseL = np.random_sample(16);
            const noiseR = np.random_sample(16);
            const noiseSL = np.random_sample(16);
            const noiseSR = np.random_sample(16);

            node1.outputs[0].bus.getMutableData()[0].set(noiseL);
            node1.outputs[0].bus.getMutableData()[1].set(noiseR);
            node1.outputs[0].bus.getMutableData()[2].set(noiseSL);
            node1.outputs[0].bus.getMutableData()[3].set(noiseSR);
            node2.getGain().setValueAtTime(0, 0);
            node2.getGain().linearRampToValueAtTime(1, 16/8000);
            context.process(channelData, 0);

            const actualL = node2.outputs[0].bus.getChannelData()[0];
            const actualR = node2.outputs[0].bus.getChannelData()[1];
            const actualSL = node2.outputs[0].bus.getChannelData()[2];
            const actualSR = node2.outputs[0].bus.getChannelData()[3];
            const expectedL = noiseL.map((x, i) => x * (i / 16));
            const expectedR = noiseR.map((x, i) => x * (i / 16));
            const expectedSL = noiseSL.map((x, i) => x * (i / 16));
            const expectedSR = noiseSR.map((x, i) => x * (i / 16));

            assert(deepEqual(actualL, expectedL));
            assert(deepEqual(actualR, expectedR));
            assert(deepEqual(actualSL, expectedSL));
            assert(deepEqual(actualSR, expectedSR));
            assert(node2.outputs[0].bus.isSilent === false);
          });
        });
      });
    });
  });
});
