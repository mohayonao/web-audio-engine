"use strict";

require("run-with-mocha");

const assert = require("power-assert");
const sinon = require("sinon");
const np = require("../../helpers/np");
const attrTester = require("../../helpers/attrTester");
const AudioNodeOutput = require("../../../src/impl/core/AudioNodeOutput");
const AudioBus = require("../../../src/impl/core/AudioBus");
const AudioContext = require("../../../src/impl/AudioContext");
const AudioNode = require("../../../src/impl/AudioNode");
const GainNode = require("../../../src/impl/GainNode");

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
const testSpec = {};

describe("AudioNodeOutput", () => {
  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: AudioNodeOutput,
      create: context => new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] }).outputs[0],
      testSpec
    });
  });

  describe("basic operation", () => {
    it("works", () => {
      const node1 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });
      const node2 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });
      const output = node1.outputs[0];

      output.bus.getMutableData()[0].set(np.random_sample());

      assert(output.bus.getLength() === 16);
      assert(output.inputs.length === 0);

      node1.connect(node2);

      assert(output.inputs.length === 1);

      assert(output.bus.isSilent === false);
      output.zeros();
      assert(output.bus.isSilent === true);
    });

    it("channel number propagation", () => {
      const node1 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });
      const node2 = new GainNode(context);
      const node3 = new GainNode(context);

      node1.outputs[0].enable();
      node1.connect(node2);
      node2.connect(node3);

      assert(node1.outputs[0].getNumberOfChannels() === 1);
      assert(node2.inputs[0].getNumberOfChannels() === 1);

      node1.outputs[0].setNumberOfChannels(4);

      assert(node1.outputs[0].getNumberOfChannels() === 4);
      assert(node2.inputs[0].getNumberOfChannels() === 4);
    });
  });

  describe("enable/disable", () => {
    let node1, node2, node3;

    before(() => {
      node1 = new AudioNode(context, { inputs: [ 1 ], outputs: [ 1 ] });
      node2 = new GainNode(context);
      node3 = new GainNode(context);
    });

    it("should be disabled at first", () => {
      node1.connect(node2);
      node2.connect(node3);

      assert(node1.outputs[0].inputs.length === 1);
      assert(node2.inputs[0].outputs.length === 0);
      assert(node2.inputs[0].isEnabled() === false);
      assert(node2.outputs[0].isEnabled() === false);
      assert(node3.inputs[0].isEnabled() === false);
    });
    it("should be enabled to synchronize with the input", () => {
      node1.outputs[0].enable();

      assert(node1.outputs[0].inputs.length === 1);
      assert(node2.inputs[0].outputs.length === 1);
      assert(node2.inputs[0].isEnabled() === true);
      assert(node2.outputs[0].isEnabled() === true);
      assert(node3.inputs[0].isEnabled() === true);
    });
    it("should be disabled to synchronize with the input", () => {
      node1.outputs[0].disable();

      assert(node1.outputs[0].inputs.length === 1);
      assert(node2.inputs[0].outputs.length === 0);
      assert(node2.inputs[0].isEnabled() === false);
      assert(node2.outputs[0].isEnabled() === false);
      assert(node3.inputs[0].isEnabled() === false);
    });
    it("should be disabled when disconnected", () => {
      node1.outputs[0].enable();

      assert(node1.outputs[0].inputs.length === 1);
      assert(node2.inputs[0].outputs.length === 1);
      assert(node2.inputs[0].isEnabled() === true);
      assert(node2.outputs[0].isEnabled() === true);
      assert(node3.inputs[0].isEnabled() === true);

      node1.disconnect();

      assert(node1.outputs[0].inputs.length === 0);
      assert(node2.inputs[0].outputs.length === 0);
      assert(node2.inputs[0].isEnabled() === false);
      assert(node2.outputs[0].isEnabled() === false);
      assert(node3.inputs[0].isEnabled() === false);
    });
  });

  describe("connection", () => {
    it("connect", () => {
      const node1 = new AudioNode(context, { outputs: [ 1 ] });
      const node2 = new AudioNode(context, { inputs: [ 1 ] });

      node1.connect(node2);

      assert(node1.outputs[0].isConnectedTo(node2) === true);
      assert(node1.outputs[0].inputs.length === 1);

      node1.connect(node2);

      assert(node1.outputs[0].isConnectedTo(node2) === true);
      assert(node1.outputs[0].inputs.length === 1);
    });

    it("disconnect", () => {
      const node1 = new AudioNode(context, { outputs: [ 1 ] });
      const node2 = new AudioNode(context, { inputs: [ 1 ] });

      node1.connect(node2);

      assert(node1.outputs[0].isConnectedTo(node2) === true);
      assert(node1.outputs[0].inputs.length === 1);

      node1.disconnect();

      assert(node1.outputs[0].isConnectedTo(node2) === false);
      assert(node1.outputs[0].inputs.length === 0);
    });

    it("disconnect - destination", () => {
      const node1 = new AudioNode(context, { outputs: [ 1 ] });
      const node2 = new AudioNode(context, { inputs: [ 1 ] });
      const node3 = new AudioNode(context, { inputs: [ 1 ] });

      node1.connect(node2);

      assert(node1.outputs[0].isConnectedTo(node2) === true);
      assert(node1.outputs[0].isConnectedTo(node3) === false);
      assert(node1.outputs[0].inputs.length === 1);

      node1.disconnect(node3);

      assert(node1.outputs[0].isConnectedTo(node2) === true);
      assert(node1.outputs[0].isConnectedTo(node3) === false);
      assert(node1.outputs[0].inputs.length === 1);

      node1.disconnect(node2);

      assert(node1.outputs[0].isConnectedTo(node2) === false);
      assert(node1.outputs[0].isConnectedTo(node3) === false);
      assert(node1.outputs[0].inputs.length === 0);
    });

    it("disconnect - destination / input", () => {
      const node1 = new AudioNode(context, { outputs: [ 1, 1 ] });
      const node2 = new AudioNode(context, { inputs: [ 1 ] });
      const node3 = new AudioNode(context, { inputs: [ 1 ] });

      node1.connect(node2);

      assert(node1.outputs[0].isConnectedTo(node2) === true);
      assert(node1.outputs[0].inputs.length === 1);

      node1.disconnect(node3, 0);

      assert(node1.outputs[0].isConnectedTo(node2) === true);
      assert(node1.outputs[0].inputs.length === 1);

      node1.disconnect(node2, 1);

      assert(node1.outputs[0].isConnectedTo(node2) === true);
      assert(node1.outputs[0].inputs.length === 1);

      node1.disconnect(node2, 0);

      assert(node1.outputs[0].isConnectedTo(node2) === false);
      assert(node1.outputs[0].inputs.length === 0);
    });

    it("misc", () => {
      const node = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ] });
      const output = node.outputs[0];

      assert(output.isConnectedTo() === false);
    });
  });

  describe("processing", () => {
    it("pull", () => {
      const node = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ] });
      const output = node.outputs[0];

      node.dspProcess = sinon.spy();

      const retVal = output.pull();

      assert(node.dspProcess.callCount === 1);
      assert(retVal instanceof AudioBus);
    });
  });
});
