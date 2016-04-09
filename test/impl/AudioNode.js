"use strict";

const assert = require("power-assert");
const sinon = require("sinon");
const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const AudioNode = require("../../src/impl/AudioNode");
const EventTarget = require("../../src/impl/EventTarget");
const AudioNodeInput = require("../../src/impl/core/AudioNodeInput");
const AudioNodeOutput = require("../../src/impl/core/AudioNodeOutput");
const GainNode = require("../../src/impl/GainNode");

const context = new AudioContext({ sampleRate: 8000, processingSizeInFrames: 16 });
const testSpec = {};

testSpec.context = {
  testCase: [ { expected: context } ]
};

testSpec.numberOfInputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.numberOfOutputs = {
  testCase: [ { expected: 1 } ]
};

testSpec.channelCount = {
  defaultValue: 1,
  testCase: [
    { value: 0, expected: 1 },
    { value: 1, expected: 1 },
    { value: Math.E, expected: 2 },
    { value: 32, expected: 32 },
    { value: 64, expected: 32 }
  ]
};

testSpec.channelCountMode = {
  defaultValue: "max",
  testCase: [
    { value: "max", expected: "max" },
    { value: "clamped-max", expected: "clamped-max" },
    { value: "explicit", expected: "explicit" },
    { value: "unknown", expected: "explicit" }
  ]
};

testSpec.channelInterpretation = {
  defaultValue: "speakers",
  testCase: [
    { value: "speakers", expected: "speakers" },
    { value: "discrete", expected: "discrete" },
    { value: "unknown", expected: "discrete" }
  ]
};

describe("AudioNode", () => {
  describe("inherits", () => {
    it("AudioNode < EventTarget", () => {
      const node = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });

      assert(node instanceof AudioNode);
      assert(node instanceof EventTarget);
    });
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: AudioNode,
      create: context => new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] }),
      testSpec
    });

    it(".context", () => {
      const node = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });

      assert(node.context === context);
    });
    it(".sampleRate", () => {
      const node = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });

      assert(node.sampleRate === context.sampleRate);
    });
    it(".processingSizeInFrames", () => {
      const node = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });

      assert(node.processingSizeInFrames === context.processingSizeInFrames);
    });
  });

  describe("basic operations", () => {
    it("inputs/outputs", () => {
      const node = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ] });

      assert(node.getInput(0) instanceof AudioNodeInput);
      assert(node.getInput(1) instanceof AudioNodeInput);
      assert(node.getInput(0) !== node.getInput(1));
      assert(node.getOutput(0) instanceof AudioNodeOutput);
      assert(node.getOutput(1) instanceof AudioNodeOutput);
      assert(node.getOutput(0) !== node.getOutput(1));
    });
  });

  describe("connection", () => {
    it("basic operation", () => {
      const node1 = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ] });
      const node2 = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ] });

      node1.connect(node2);

      assert(node2.isConnectedFrom(node1) === true);

      node1.disconnect();

      assert(node2.isConnectedFrom(node1) === false);
    });

    it("with the channel", () => {
      const node1 = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ]});
      const node2 = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ]});

      node1.connect(node2, 1);

      assert(node2.isConnectedFrom(node1, 0) === false);
      assert(node2.isConnectedFrom(node1, 1) === true);

      node1.disconnect(0);

      assert(node2.isConnectedFrom(node1, 0) === false);
      assert(node2.isConnectedFrom(node1, 1) === true);

      node1.disconnect(1);

      assert(node2.isConnectedFrom(node1, 1) === false);
    });

    it("disconnect with the node", () => {
      const node1 = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ] });
      const node2 = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ] });

      node1.connect(node2);

      assert(node2.isConnectedFrom(node1) === true);

      node1.disconnect(node1);

      assert(node2.isConnectedFrom(node1) === true);

      node1.disconnect(node2);

      assert(node2.isConnectedFrom(node1) === false);
    });

    it("complex case", () => {
      const node1 = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ] });
      const node2 = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ] });

      node1.connect(node2, 0);

      assert(node2.isConnectedFrom(node1, 0) === true);
      assert(node2.isConnectedFrom(node1, 1) === false);

      node1.disconnect(node1, 1);

      assert(node2.isConnectedFrom(node1, 0) === true);
      assert(node2.isConnectedFrom(node1, 1) === false);

      node1.disconnect(node2, 0);

      assert(node2.isConnectedFrom(node1, 0) === false);
      assert(node2.isConnectedFrom(node1, 1) === false);
    });

    it("misc", () => {
      const node1 = new AudioNode(context, { inputs: [], outputs: [] });
      const node2 = new AudioNode(context, { inputs: [], outputs: [] });

      assert(node1.isConnectedTo() === false);
      assert(node2.isConnectedFrom() === false);
    });
  });

  describe("enable/disable", () => {
    let node, output;

    before(() => {
      node = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });
      output = node.getOutput(0);

      output.enable = sinon.spy();
      output.disable = sinon.spy();
    });

    beforeEach(() => {
      output.enable.reset();
      output.disable.reset();
    });

    it("init state", () => {
      assert(node.isEnabled() === false);
    });
    it("to be enabled", () => {
      node.enableOutputsIfNecessary();
      assert(node.isEnabled() === true);
      assert(output.enable.callCount === 1);
      assert(output.disable.callCount === 0);
    });
    it("to be enabled - again", () => {
      node.enableOutputsIfNecessary();
      assert(node.isEnabled() === true);
      assert(output.enable.callCount === 0);
      assert(output.disable.callCount === 0);
    });
    it("to be disabled", () => {
      node.disableOutputsIfNecessary();
      assert(node.isEnabled() === false);
      assert(output.enable.callCount === 0);
      assert(output.disable.callCount === 1);
    });
    it("to be disabled - again", () => {
      node.disableOutputsIfNecessary();
      assert(node.isEnabled() === false);
      assert(output.enable.callCount === 0);
      assert(output.disable.callCount === 0);
    });
  });

  describe("processing", () => {
    it("propagation", () => {
      const node1 = new GainNode(context);
      const node2 = new GainNode(context);
      const node3 = new GainNode(context);
      const param = node1.getGain();
      const procItem = { currentTime: 0, nextCurrentTime: 16 / 8000 };

      node1.getOutput(0).enable();
      node2.getOutput(0).enable();
      node1.connect(node2);
      node2.connect(node3);

      node1.dspProcess = sinon.spy();
      param.dspProcess = sinon.spy();

      node3.processIfNecessary(procItem);

      assert(node1.dspProcess.calledWith(procItem));
      assert(param.dspProcess.calledWith(procItem));
    });

    it("feedback loop", () => {
      const node1 = new GainNode(context);
      const node2 = new GainNode(context);
      const node3 = new GainNode(context);
      const procItem = { currentTime: 0, nextCurrentTime: 16 / 8000 };

      node1.getOutput(0).enable();
      node2.getOutput(0).enable();
      node1.connect(node2);
      node2.connect(node3);
      node3.connect(node1);

      node1.dspProcess = sinon.spy();

      node3.processIfNecessary(procItem);

      assert(node1.dspProcess.callCount === 1);
      assert(node1.dspProcess.calledWith(procItem));
    });
  });
});
