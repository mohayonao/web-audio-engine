"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../src/impl/AudioContext");
const ConstantSourceNode = require("../../src/impl/ConstantSourceNode");
const AudioParam = require("../../src/impl/AudioParam");
const AudioNode = require("../../src/impl/AudioNode");

describe("impl/ConstantSourceNode", () => {
  let context;

  beforeEach(() => {
    context = new AudioContext({ sampleRate: 8000, blockSize: 32 });
  });

  it("constructor", () => {
    const node = new ConstantSourceNode(context);

    assert(node instanceof ConstantSourceNode);
    assert(node instanceof AudioNode);
  });

  describe("attributes", () => {
    it(".numberOfInputs", () => {
      const node = new ConstantSourceNode(context);

      assert(node.getNumberOfInputs() === 0);
    });

    it(".numberOfOutputs", () => {
      const node = new ConstantSourceNode(context);

      assert(node.getNumberOfOutputs() === 1);
    });

    it(".offset", () => {
      const node = new ConstantSourceNode(context);

      assert(node.getOffset() instanceof AudioParam);
      assert(node.getOffset().getValue() === 1);
    });
  });
});
