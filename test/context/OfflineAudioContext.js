"use strict";

const assert = require("power-assert");
const OfflineAudioContext = require("../../src/context/OfflineAudioContext");
const AudioBuffer = require("../../src/api/AudioBuffer");

describe("OfflineAudioContext", () => {
  it("should return an OfflineAudioContext instance", () => {
    const context = new OfflineAudioContext(2, 128, 44100);

    assert(context instanceof OfflineAudioContext);
  });

  it("should emit a 'complete' event with AudioBuffer after rendering", (done) => {
    const context = new OfflineAudioContext(2, 1000, 44100);

    context.oncomplete = (e) => {
      const audioBuffer = e.renderedBuffer;

      assert(audioBuffer instanceof AudioBuffer);
      assert(audioBuffer.numberOfChannels === 2);
      assert(audioBuffer.length === 1000);
      assert(audioBuffer.sampleRate === 44100);
      done();
    };

    context.startRendering();
  });

  it("should return Promise<AudioBuffer>", () => {
    const context = new OfflineAudioContext(2, 1000, 44100);

    return context.startRendering().then((audioBuffer) => {
      assert(audioBuffer instanceof AudioBuffer);
      assert(audioBuffer.numberOfChannels === 2);
      assert(audioBuffer.length === 1000);
      assert(audioBuffer.sampleRate === 44100);
    });
  });

  it("should change context's state in each rendering phase", (done) => {
    const context = new OfflineAudioContext(2, 1000, 44100);

    assert(context.state === "suspended");

    context.startRendering();

    assert(context.state === "running");

    context.oncomplete = () => {
      assert(context.state === "closed");
      done();
    };
  });

  it("should suspend rendering", (done) => {
    const context = new OfflineAudioContext(2, 1000, 44100);

    context.suspend(300/44100).then(() => {
      assert(context.state === "suspended");
      context.oncomplete = () => { done() };
      context.resume();
    });
    context.startRendering();

    context.oncomplete = () => {
      throw new TypeError("SHOULD NOT REACHED");
    };
  });
});
