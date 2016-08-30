"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const AudioContext = require("../../src/impl/AudioContext");
const AudioBufferSourceNode = require("../../src/impl/AudioBufferSourceNode");
const AudioNode = require("../../src/impl/AudioNode");
const AudioSourceNode = require("../../src/impl/AudioSourceNode");
const AudioBuffer = require("../../src/impl/AudioBuffer");
const AudioParam = require("../../src/impl/AudioParam");

describe("impl/AudioBufferSourceNode", () => {
  let context;

  beforeEach(() => {
    context = new AudioContext({ sampleRate: 8000, blockSize: 32 });
  });

  it("constructor", () => {
    const node = new AudioBufferSourceNode(context);

    assert(node instanceof AudioBufferSourceNode);
    assert(node instanceof AudioSourceNode);
  });

  describe("attributes", () => {
    it(".numberOfInputs", () => {
      const node = new AudioBufferSourceNode(context);

      assert(node.getNumberOfInputs() === 0);
    });

    it(".numberOfOutputs", () => {
      const node = new AudioBufferSourceNode(context);

      assert(node.getNumberOfOutputs() === 1);
    });

    it(".startTime", () => {
      const node = new AudioBufferSourceNode(context);

      assert(node.getStartTime() === undefined);
    });

    it(".stopTime", () => {
      const node = new AudioBufferSourceNode(context);

      assert(node.getStopTime() === undefined);
    });

    it(".playbackState", () => {
      const node = new AudioBufferSourceNode(context);

      assert(node.getPlaybackState() === "unscheduled");
    });

    it(".buffer=", () => {
      const node = new AudioBufferSourceNode(context);
      const buffer = new AudioBuffer(context, { numberOfChannels: 2, length: 32, sampleRate: 8000 });

      assert(node.getBuffer() === null);

      node.setBuffer(buffer);
      assert(node.getBuffer() === buffer);
    });

    it(".playbackRate", () => {
      const node = new AudioBufferSourceNode(context);

      assert(node.getPlaybackRate() instanceof AudioParam);
      assert(node.getPlaybackRate().getValue() === 1);
    });

    it(".detune", () => {
      const node = new AudioBufferSourceNode(context);

      assert(node.getDetune() instanceof AudioParam);
      assert(node.getDetune().getValue() === 0);
    });

    it("loop=", () => {
      const node = new AudioBufferSourceNode(context);

      assert(node.getLoop() === false);

      node.setLoop(true);
      assert(node.getLoop() === true);
    });

    it("loopStart=", () => {
      const node = new AudioBufferSourceNode(context);

      assert(node.getLoopStart() === 0);

      node.setLoopStart(1);
      assert(node.getLoopStart() === 1);
    });

    it("loopEnd=", () => {
      const node = new AudioBufferSourceNode(context);

      assert(node.getLoopEnd() === 0);

      node.setLoopEnd(1);
      assert(node.getLoopEnd() === 1);
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
      const node = new AudioBufferSourceNode(context);
      const buffer = new AudioBuffer(context, { numberOfChannels: 2, length: 8000, sampleRate: 8000 });

      node.setBuffer(buffer);
      node.setLoop(true);
      node.connect(context.getDestination());

      // 0....1....2....3....4....5....
      // |
      // currentTime
      assert(node.getStartTime() === undefined);
      assert(node.getPlaybackState() === "unscheduled");

      //      start
      //      |
      // 0....1....2....3....4....5....
      // |    =======================.. buffer
      // |
      // currentTime
      node.start(1);
      assert(node.getStartTime() === 1);
      assert(node.getStartOffset() === 0);
      assert(node.getStartDuration() === undefined);
      assert(node.getPlaybackState() === "scheduled");

      //      start
      //      |
      // 0....1....2....3....4....5....
      //      |======================.. buffer
      //      |
      //      currentTime
      node.start(2);
      processTo(context, 1);
      assert(node.getStartTime() === 1);
      assert(node.getPlaybackState() === "playing");

      //      start
      //      |
      // 0....1....2....3....4....5....
      //      =====|=================.. buffer
      //           |
      //           currentTime
      processTo(context, 2);
      assert(node.getPlaybackState() === "playing");
    });

    it(".start(when, offset, duration)", () => {
      const node = new AudioBufferSourceNode(context);
      const buffer = new AudioBuffer(context, { numberOfChannels: 2, length: 8000, sampleRate: 8000 });
      const onended = sinon.spy();

      node.setBuffer(buffer);
      node.setLoop(true);
      node.connect(context.getDestination());
      node.addEventListener("ended", onended);

      // 0....1....2....3....4....5....
      // |
      // currentTime
      assert(node.getStopTime() === undefined);
      assert(node.getPlaybackState() === "unscheduled");

      //           start     stop
      //           |--->|    |
      // 0....1....2....3....4....5....
      //      |    ==================..  buffer
      //      |
      //      currentTime
      node.start(2, 0.5, 1);
      node.stop(4);
      processTo(context, 1);
      assert(node.getStartTime() === 2);
      assert(node.getStartOffset() === 0.5);
      assert(node.getStartDuration() === 1);
      assert(node.getStopTime() === 4);
      assert(node.getPlaybackState() === "scheduled");

      //           start     stop
      //           |--->|    |
      // 0....1....2....3....4....5....
      //           |=================..  buffer
      //           |
      //           currentTime
      node.stop(5);
      processTo(context, 2);
      assert(node.getStopTime() === 4);
      assert(node.getPlaybackState() === "playing");

      //           start     stop
      //           |--->|    |
      // 0....1....2....3....4....5....
      //           =====|============..  buffer
      //                |
      //                currentTime
      processTo(context, 3);
      assert(node.getPlaybackState() === "playing");
      assert(onended.callCount === 0);

      //           start     stop
      //           |--->|    |
      // 0....1....2....3....4....5....
      //           ==========|=======..  buffer
      //                     |
      //                     currentTime
      processTo(context, 4);
      assert(node.getPlaybackState() === "finished");
      assert(onended.callCount === 1);
    });

    it(".start(when) without buffer", () => {
      const node = new AudioBufferSourceNode(context);
      const onended = sinon.spy();

      node.connect(context.getDestination());
      node.addEventListener("ended", onended);

      // 0....1....2....3....4....5....
      // |
      // currentTime
      assert(node.getStartTime() === undefined);
      assert(node.getPlaybackState() === "unscheduled");

      //      start     stop
      //      |         |
      // 0....1....2....3....4....5....
      // |
      // currentTime
      node.start(1);
      node.stop(3);
      assert(node.getStartTime() === 1);
      assert(node.getStopTime() === 3);
      assert(node.getPlaybackState() === "scheduled");
      assert(onended.callCount === 0);

      //      start     stop
      //      |         |
      // 0....1....2....3....4....5....
      //      |
      //      currentTime
      processTo(context, 1);
      assert(node.getPlaybackState() === "playing");
      assert(onended.callCount === 0);

      //      start     stop
      //      |         |
      // 0....1....2....3....4....5....
      //           |
      //           currentTime
      processTo(context, 2);
      assert(node.getPlaybackState() === "finished");
      assert(onended.callCount === 1);

      //      start     stop
      //      |         |
      // 0....1....2....3....4....5....
      //                |
      //                currentTime
      processTo(context, 3);
      assert(node.getPlaybackState() === "finished");
      assert(onended.callCount === 1);
    });

    it(".start(when) auto stop by buffer duration", () => {
      const node = new AudioBufferSourceNode(context);
      const buffer = new AudioBuffer(context, { numberOfChannels: 2, length: 8000, sampleRate: 8000 });
      const onended = sinon.spy();

      node.setBuffer(buffer);
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
      //      |    =====                 buffer
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
      //           |====                 buffer
      //           |
      //           currentTime
      node.stop(5);
      processTo(context, 2);
      assert(node.getStopTime() === 4);
      assert(node.getPlaybackState() === "playing");

      //           start     stop
      //           |         |
      // 0....1....2....3....4....5....
      //           =====|                buffer
      //                |
      //                currentTime
      processTo(context, 3);
      assert(node.getPlaybackState() === "finished");
      assert(onended.callCount === 1);

      //           start     stop
      //           |         |
      // 0....1....2....3....4....5....
      //           =====     |           buffer
      //                     |
      //                     currentTime
      processTo(context, 4);
      assert(node.getPlaybackState() === "finished");
      assert(onended.callCount === 1);
    });

    it(".start(when, offset, duration) auto stop by buffer duration", () => {
      const node = new AudioBufferSourceNode(context);
      const buffer = new AudioBuffer(context, { numberOfChannels: 2, length: 8000, sampleRate: 8000 });
      const onended = sinon.spy();

      node.setBuffer(buffer);
      node.connect(context.getDestination());
      node.addEventListener("ended", onended);

      // 0....1....2....3....4....5....
      // |
      // currentTime
      assert(node.getStopTime() === undefined);
      assert(node.getPlaybackState() === "unscheduled");

      //           start     stop
      //           |--->|    |
      // 0....1....2....3....4....5....
      //      |    ==================..  buffer
      //      |
      //      currentTime
      node.start(2, 0.5, 1);
      node.stop(4);
      processTo(context, 1);
      assert(node.getStartTime() === 2);
      assert(node.getStartOffset() === 0.5);
      assert(node.getStartDuration() === 1);
      assert(node.getStopTime() === 4);
      assert(node.getPlaybackState() === "scheduled");

      //           start     stop
      //           |--->|    |
      // 0....1....2....3....4....5....
      //           |=================..  buffer
      //           |
      //           currentTime
      node.stop(5);
      processTo(context, 2);
      assert(node.getStopTime() === 4);
      assert(node.getPlaybackState() === "playing");

      //           start     stop
      //           |--->|    |
      // 0....1....2....3....4....5....
      //           =====|============..  buffer
      //                |
      //                currentTime
      processTo(context, 3);
      assert(node.getPlaybackState() === "finished");
      assert(onended.callCount === 1);

      //           start     stop
      //           |--->|    |
      // 0....1....2....3....4....5....
      //           ==========|=======..  buffer
      //                     |
      //                     currentTime
      processTo(context, 4);
      assert(node.getPlaybackState() === "finished");
      assert(onended.callCount === 1);
    });

    it(".stop(when)", () => {
      const node = new AudioBufferSourceNode(context);
      const buffer = new AudioBuffer(context, { numberOfChannels: 2, length: 8000, sampleRate: 8000 });
      const onended = sinon.spy();

      node.setBuffer(buffer);
      node.setLoop(true);
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
      //      |    ==================.. buffer
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
      //           |=================.. buffer
      //           |
      //           currentTime
      node.stop(5);
      processTo(context, 2);
      assert(node.getStopTime() === 4);
      assert(node.getPlaybackState() === "playing");

      //           start     stop
      //           |         |
      // 0....1....2....3....4....5....
      //      ==========|============.. buffer
      //                |
      //                currentTime
      processTo(context, 3);
      assert(node.getPlaybackState() === "playing");
      assert(onended.callCount === 0);

      //           start     stop
      //           |         |
      // 0....1....2....3....4....5....
      //      ===============|=======.. buffer
      //                     |
      //                     currentTime
      processTo(context, 4);
      assert(node.getPlaybackState() === "finished");
      assert(onended.callCount === 1);
    });
  });

  describe("channel configuration", () => {
    it("should synchronize with the buffer if set", () => {
      const node1 = new AudioBufferSourceNode(context);
      const node2 = new AudioNode(context, { inputs: [ 1 ] });
      const buffer = new AudioBuffer(context, { numberOfChannels: 2, length: 32, sampleRate: 8000 });

      node1.outputs[0].enable();

      // +-------+
      // | node1 | AudioBufferSourceNode (buffer=null)
      // +--(1)--+
      //     |
      // +--(1)--+
      // | node2 |
      // +-------+
      node1.connect(node2);
      assert(node2.inputs[0].getNumberOfChannels() === 1);

      // +-------+
      // | node1 | AudioBufferSourceNode (buffer=ch[2])
      // +--(2)--+
      //     |
      // +--(2)--+
      // | node2 |
      // +-------+
      node1.setBuffer(buffer);
      assert(node2.inputs[0].getNumberOfChannels() === buffer.getNumberOfChannels());
    });
  });
});
