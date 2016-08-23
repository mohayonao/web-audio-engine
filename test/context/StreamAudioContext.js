"use strict";

require("run-with-mocha");

const assert = require("power-assert");
const sinon = require("sinon");
const events = require("events");
const deepEqual = require("deep-equal");
const StreamAudioContext = require("../../src/context/StreamAudioContext");

describe("StreamAudioContext", () => {
  describe("constructor", () => {
    it("works", () => {
      const context = new StreamAudioContext();

      assert(context instanceof StreamAudioContext);
      assert.doesNotThrow(() => { context._stream.write(); });
    });

    it("with options", () => {
      const context = new StreamAudioContext({ sampleRate: 8000, numberOfChannels: 1, blockSize: 16, bitDepth: 8 });

      assert(context.numberOfChannels === 1);
      assert(context.blockSize === 16);
      assert(deepEqual(context.format, { sampleRate: 8000, channels: 1, bitDepth: 8, float: false }));
    });
  });

  describe("rendering", () => {
    it("basic", (done) => {
      const context = new StreamAudioContext();
      const streamOut = new events.EventEmitter();
      const write1 = sinon.spy((buffer) => {
        assert(buffer instanceof Buffer);
        if (write1.callCount >= 75) {
          done();
          return false;
        }
        return true;
      });

      streamOut.write = write1;

      context.pipe(streamOut);
      context.resume();
    });

    it("suspend", (done) => {
      const context = new StreamAudioContext();
      const streamOut = new events.EventEmitter();
      const write1 = sinon.spy((buffer) => {
        assert(buffer instanceof Buffer);
        if (write1.callCount === 10) {
          context.suspend().then(() => {
            streamOut.write = write2;
            context.resume();
          });
        }
        return true;
      });
      const write2 = sinon.spy((buffer) => {
        assert(buffer instanceof Buffer);
        assert(write1.callCount === 10);
        if (write2.callCount >= 10) {
          context.close().then(done);
        }
        return true;
      });

      streamOut.write = write1;

      context.pipe(streamOut);
      context.resume();
    });
  });
});
