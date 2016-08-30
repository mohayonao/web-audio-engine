"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const AudioContext = require("../../src/impl/AudioContext");
const OscillatorNode = require("../../src/impl/OscillatorNode");
const AudioNode = require("../../src/impl/AudioNode");
const AudioSourceNode = require("../../src/impl/AudioSourceNode");
const PeriodicWave = require("../../src/impl/PeriodicWave");
const AudioParam = require("../../src/impl/AudioParam");

describe("impl/OscillatorNode", () => {
  let context;

  beforeEach(() => {
    context = new AudioContext({ sampleRate: 8000, blockSize: 32 });
  });

  it("constructor", () => {
    const node = new OscillatorNode(context);

    assert(node instanceof OscillatorNode);
    assert(node instanceof AudioSourceNode);
  });

  describe("attributes", () => {
    it(".numberOfInputs", () => {
      const node = new OscillatorNode(context);

      assert(node.getNumberOfInputs() === 0);
    });

    it(".numberOfOutputs", () => {
      const node = new OscillatorNode(context);

      assert(node.getNumberOfOutputs() === 1);
    });

    it(".startTime", () => {
      const node = new OscillatorNode(context);

      assert(node.getStartTime() === undefined);
    });

    it(".stopTime", () => {
      const node = new OscillatorNode(context);

      assert(node.getStopTime() === undefined);
    });

    it(".playbackState", () => {
      const node = new OscillatorNode(context);

      assert(node.getPlaybackState() === "unscheduled");
    });

    it(".type=", () => {
      const node = new OscillatorNode(context);

      assert(node.getType() === "sine");

      [
        "sine", "square", "sawtooth", "triangle"
      ].forEach((type) => {
        node.setType(type);
        assert(node.getType() === type);
      });
    });

    it(".frequency", () => {
      const node = new OscillatorNode(context);

      assert(node.getFrequency() instanceof AudioParam);
      assert(node.getFrequency().getValue() === 440);
    });

    it(".detune", () => {
      const node = new OscillatorNode(context);

      assert(node.getDetune() instanceof AudioParam);
      assert(node.getDetune().getValue() === 0);
    });

    it("periodicWave=", () => {
      const node = new OscillatorNode(context);
      const periodicWave = new PeriodicWave(context, { real: [ 0, 0 ], imag: [ 0, 1 ] });

      node.setPeriodicWave(periodicWave);
      assert(node.getPeriodicWave() === periodicWave);
      assert(node.getType() === "custom");
    });
  });

  describe("methods", () => {
    function processTo(context, when) {
      const channelData = [
        new Float32Array(context.blockSize), new Float32Array(context.blockSize)
      ];

      context.resume();

      while (context.currentTime < when) {
        context.process(channelData, 0);
      }
    }

    it(".start(when)", () => {
      const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
      const node = new OscillatorNode(context);

      node.connect(context.getDestination());

      // 0....1....2....3....4....5....
      // |
      // currentTime
      assert(node.getStartTime() === undefined);
      assert(node.getPlaybackState() === "unscheduled");

      //      start
      //      |
      // 0....1....2....3....4....5....
      // |
      // currentTime
      node.start(1);
      assert(node.getStartTime() === 1);
      assert(node.getPlaybackState() === "scheduled");

      //      start
      //      |
      // 0....1....2....3....4....5....
      //      |
      //      currentTime
      node.start(2);
      processTo(context, 1);
      assert(node.getStartTime() === 1);
      assert(node.getPlaybackState() === "playing");

      //      start
      //      |
      // 0....1....2....3....4....5....
      //           |
      //           currentTime
      processTo(context, 2);
      assert(node.getPlaybackState() === "playing");
    });

    it(".stop(when)", () => {
      const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
      const node = new OscillatorNode(context);
      const onended = sinon.spy();

      node.connect(context.getDestination());
      node.addEventListener("ended", onended);

      // 0....1....2....3....4....5....
      // |
      // currentTime
      assert(node.getStopTime() === undefined);
      assert(node.getPlaybackState() === "unscheduled");

      // 0....1....2....3....4....5....
      // |
      // currentTime
      node.stop(0);
      assert(node.getStopTime() === undefined);
      assert(node.getPlaybackState() === "unscheduled");

      //           start     stop
      //           |         |
      // 0....1....2....3....4....5....
      //      |
      //      currentTime
      node.start(2);
      node.stop(4);
      processTo(context, 1);
      assert(node.getStartTime() === 2);
      assert(node.getStopTime() === 4);
      assert(node.getPlaybackState() === "scheduled");

      //           start     stop
      //           |         |
      // 0....1....2....3....4....5....
      //           |
      //           currentTime
      node.stop(5);
      processTo(context, 2);
      assert(node.getStopTime() === 4);
      assert(node.getPlaybackState() === "playing");

      //           start     stop
      //           |         |
      // 0....1....2....3....4....5....
      //                |
      //                currentTime
      processTo(context, 3);
      assert(node.getPlaybackState() === "playing");
      assert(onended.callCount === 0);

      //           start     stop
      //           |         |
      // 0....1....2....3....4....5....
      //                     |
      //                     currentTime
      processTo(context, 4);
      assert(node.getPlaybackState() === "finished");
      assert(onended.callCount === 1);
    });
  });

  describe("channel configuration", () => {
    it("should be mono output", () => {
      const node1 = new OscillatorNode(context);
      const node2 = new AudioNode(context, { inputs: [ 1 ] });

      // +-------+
      // | node1 | OscillatorNode
      // +--(1)--+
      //     |
      // +--(1)--+
      // | node2 |
      // +-------+
      node1.connect(node2);
      assert(node2.inputs[0].getNumberOfChannels() === 1);
    });
  });
});
