"use strict";

require("run-with-mocha");

const assert = require("assert");
const sinon = require("sinon");
const AudioContext = require("../../src/impl/AudioContext");
const AudioNode = require("../../src/impl/AudioNode");
const EventTarget = require("../../src/impl/EventTarget");
const AudioNodeInput = require("../../src/impl/core/AudioNodeInput");
const AudioNodeOutput = require("../../src/impl/core/AudioNodeOutput");

describe("impl/AudioNode", () => {
  let context;

  beforeEach(() => {
    context = new AudioContext({ sampleRate: 8000, blockSize: 32 });
  });

  it("constructor", () => {
    const node = new AudioNode(context);

    assert(node instanceof AudioNode);
    assert(node instanceof EventTarget);
  });

  describe("attributes", () => {
    it(".context", () => {
      const node = new AudioNode(context);

      assert(node.context === context);
    });

    it(".blockSize", () => {
      const node = new AudioNode(context);

      assert(node.blockSize === context.blockSize);
    });

    it(".sampleRate", () => {
      const node = new AudioNode(context);

      assert(node.sampleRate === context.sampleRate);
    });

    it(".inputs", () => {
      const node = new AudioNode(context, {}, { inputs: [ 1, 1 ], outputs: [ 1, 1 ] });

      assert(node.inputs[0] instanceof AudioNodeInput);
      assert(node.inputs[1] instanceof AudioNodeInput);
      assert(node.inputs[0] !== node.inputs[1]);
    });

    it(".outputs", () => {
      const node = new AudioNode(context, {}, { inputs: [ 1, 1 ], outputs: [ 1, 1 ] });

      assert(node.outputs[0] instanceof AudioNodeOutput);
      assert(node.outputs[1] instanceof AudioNodeOutput);
      assert(node.outputs[0] !== node.outputs[1]);
    });

    it(".numberOfInputs", () => {
      const node = new AudioNode(context, {}, { inputs: [ 1 ], outputs: [ 1 ] });

      assert(node.getNumberOfInputs() === 1);
    });

    it(".numberOfOutputs", () => {
      const node = new AudioNode(context, {}, { inputs: [ 1 ], outputs: [ 1 ] });

      assert(node.getNumberOfOutputs() === 1);
    });

    it(".channelCount=", () => {
      const node = new AudioNode(context, {}, { inputs: [ 1 ], outputs: [ 1 ] });

      assert(node.getChannelCount() === 1);

      node.setChannelCount(2);
      assert(node.getChannelCount() === 2);
    });

    it(".channelCountMode=", () => {
      const node = new AudioNode(context, {}, { inputs: [ 1 ], outputs: [ 1 ] });

      assert(node.getChannelCountMode() === "max");

      node.setChannelCountMode("clamped-max");
      assert(node.getChannelCountMode() === "clamped-max");

      node.setChannelCountMode("explicit");
      assert(node.getChannelCountMode() === "explicit");

      node.setChannelCountMode("max");
      assert(node.getChannelCountMode() === "max");
    });

    it(".channelInterpretation=", () => {
      const node = new AudioNode(context, {}, { inputs: [ 1 ], outputs: [ 1 ] });

      assert(node.getChannelInterpretation() === "speakers");

      node.setChannelInterpretation("discrete");
      assert(node.getChannelInterpretation() === "discrete");

      node.setChannelInterpretation("speakers");
      assert(node.getChannelInterpretation() === "speakers");
    });
  });

  describe("methods", () => {
    it(".enableOutputsIfNecessary()", () => {
      const node = new AudioNode(context, {}, { outputs: [ 1 ] });
      const output = node.outputs[0];

      output.enable = sinon.spy();
      output.disable = sinon.spy();

      assert(node.isEnabled() === false);

      node.enableOutputsIfNecessary();
      assert(node.isEnabled() === true);
      assert(output.enable.callCount === 1);
      assert(output.disable.callCount === 0);
      output.enable.reset();
      output.disable.reset();

      node.enableOutputsIfNecessary();
      assert(node.isEnabled() === true);
      assert(output.enable.callCount === 0);
      assert(output.disable.callCount === 0);
    });

    it(".disableOutputsIfNecessary()", () => {
      const node = new AudioNode(context, {}, { outputs: [ 1 ] });
      const output = node.outputs[0];

      node.enableOutputsIfNecessary();
      output.enable = sinon.spy();
      output.disable = sinon.spy();

      assert(node.isEnabled() === true);

      node.disableOutputsIfNecessary();
      assert(node.isEnabled() === false);
      assert(output.enable.callCount === 0);
      assert(output.disable.callCount === 1);
      output.enable.reset();
      output.disable.reset();

      node.disableOutputsIfNecessary();
      assert(node.isEnabled() === false);
      assert(output.enable.callCount === 0);
      assert(output.disable.callCount === 0);
      output.enable.reset();
      output.disable.reset();
    });
  });
});
