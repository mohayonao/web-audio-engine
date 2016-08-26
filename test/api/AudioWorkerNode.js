"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const AudioContext = require("../../src/api/AudioContext");
const AudioWorkerNode = require("../../src/api/AudioWorkerNode");

describe("api/AudioWorkerNode", () => {
  it.skip("context.createAudioWorker(scriptURL)", () => {
  });

  describe("attributes", () => {
    it(".onmessage=", () => {
      const context = new AudioContext();
      const worker = {};
      const numberOfInputs = 1;
      const numberOfOutputs = 1;
      const target = new AudioWorkerNode(context, { worker, numberOfInputs, numberOfOutputs });
      const callback1 = sinon.spy();
      const callback2 = sinon.spy();
      const callback3 = sinon.spy();
      const event = { type: "message" };

      target.onmessage = callback1;
      target.onmessage = callback2;
      target.addEventListener("message", callback3);
      target._impl.dispatchEvent(event);

      assert(target.onmessage === callback2);
      assert(callback1.callCount === 0);
      assert(callback2.callCount === 1);
      assert(callback3.callCount === 1);
      assert(callback2.args[0][0] === event);
      assert(callback3.args[0][0] === event);
    });
  });

  describe("methods", () => {
    it(".postMessage(message)", () => {
      const context = new AudioContext();
      const worker = {};
      const numberOfInputs = 1;
      const numberOfOutputs = 1;
      const target = new AudioWorkerNode(context, { worker, numberOfInputs, numberOfOutputs });
      const message = {};

      target._impl.postMessage = sinon.spy();

      target.postMessage(message);
      assert(target._impl.postMessage.callCount === 1);
      assert(target._impl.postMessage.args[0][0] === message);
    });
  });
});
