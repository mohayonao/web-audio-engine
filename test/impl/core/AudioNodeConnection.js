"use strict";

require("run-with-mocha");

const assert = require("assert");
const AudioContext = require("../../../src/impl/AudioContext");
const AudioNode = require("../../../src/impl/AudioNode");

describe("impl/core/AudioNode - Connection", () => {
  let context;

  beforeEach(() => {
    context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
  });

  it("connect()", () => {
    const node1 = new AudioNode(context, {}, { outputs: [ 1 ] });
    const node2 = new AudioNode(context, {}, { inputs: [ 1 ] });

    // +-------+
    // | node1 |
    // +-------+
    //     |
    // +-------+
    // | node2 |
    // +-------+
    node1.outputs[0].enable();
    node1.connect(node2);

    assert(node1.outputs[0].isConnectedTo(node2) === true);
    assert(node2.inputs[0].isConnectedFrom(node1) === true);
  });

  it("disconnect()", () => {
    const node1 = new AudioNode(context, {}, { outputs: [ 1 ] });
    const node2 = new AudioNode(context, {}, { inputs: [ 1 ] });
    const node3 = new AudioNode(context, {}, { inputs: [ 1 ] });

    //       +-------+
    //       | node1 |
    //       +-------+
    //           |
    //     +-----+-----+
    //     |           |
    // +-------+   +-------+
    // | node2 |   | node3 |
    // +-------+   +-------+
    node1.outputs[0].enable();
    node1.connect(node2);
    node1.connect(node3);

    //       +-------+
    //       | node1 |
    //       +-------+
    //
    // +-------+   +-------+
    // | node2 |   | node3 |
    // +-------+   +-------+
    node1.disconnect();
    assert(node1.outputs[0].isConnectedTo(node2) === false);
    assert(node2.inputs[0].isConnectedFrom(node1) === false);
  });


  it("disconnect(output)", () => {
    const node1 = new AudioNode(context, {}, { outputs: [ 1, 1 ] });
    const node2 = new AudioNode(context, {}, { inputs: [ 1 ] });
    const node3 = new AudioNode(context, {}, { inputs: [ 1 ] });

    //       +-------+
    //       | node1 |
    //       +-------+
    //         |   |
    //     +---+   +---+
    //     |           |
    // +-------+   +-------+
    // | node2 |   | node3 |
    // +-------+   +-------+
    node1.outputs[0].enable();
    node1.outputs[1].enable();
    node1.connect(node2, 0);
    node1.connect(node3, 1);

    //       +-------+
    //       | node1 |
    //       +-------+
    //         |
    //     +---+
    //     |
    // +-------+   +-------+
    // | node2 |   | node3 |
    // +-------+   +-------+
    node1.disconnect(1);
    assert(node1.outputs[0].isConnectedTo(node2) === true);
    assert(node1.outputs[0].isConnectedTo(node3) === false);
    assert(node1.outputs[1].isConnectedTo(node2) === false);
    assert(node1.outputs[1].isConnectedTo(node3) === false);
    assert(node2.inputs[0].isConnectedFrom(node1) === true);
    assert(node3.inputs[0].isConnectedFrom(node1) === false);

    //       +-------+
    //       | node1 |
    //       +-------+
    //
    // +-------+   +-------+
    // | node2 |   | node3 |
    // +-------+   +-------+
    node1.disconnect(0);
    assert(node1.outputs[0].isConnectedTo(node2) === false);
    assert(node1.outputs[0].isConnectedTo(node3) === false);
    assert(node1.outputs[1].isConnectedTo(node2) === false);
    assert(node1.outputs[1].isConnectedTo(node3) === false);
    assert(node2.inputs[0].isConnectedFrom(node1) === false);
    assert(node3.inputs[0].isConnectedFrom(node1) === false);
  });

  it("disconnect(destination)", () => {
    const node1 = new AudioNode(context, {}, { outputs: [ 1 ] });
    const node2 = new AudioNode(context, {}, { inputs: [ 1 ] });
    const node3 = new AudioNode(context, {}, { inputs: [ 1 ] });

    //       +-------+
    //       | node1 |
    //       +-------+
    //           |
    //     +-----+-----+
    //     |           |
    // +-------+   +-------+
    // | node2 |   | node3 |
    // +-------+   +-------+
    node1.outputs[0].enable();
    node1.connect(node2);
    node1.connect(node3);

    //       +-------+
    //       | node1 |
    //       +-------+
    //           |
    //     +-----+
    //     |
    // +-------+   +-------+
    // | node2 |   | node3 |
    // +-------+   +-------+
    node1.disconnect(node3);
    assert(node1.outputs[0].isConnectedTo(node2) === true);
    assert(node1.outputs[0].isConnectedTo(node3) === false);
    assert(node2.inputs[0].isConnectedFrom(node1) === true);
    assert(node3.inputs[0].isConnectedFrom(node1) === false);

    //       +-------+
    //       | node1 |
    //       +-------+
    //
    // +-------+   +-------+
    // | node2 |   | node3 |
    // +-------+   +-------+
    node1.disconnect(node2);
    assert(node1.outputs[0].isConnectedTo(node2) === false);
    assert(node1.outputs[0].isConnectedTo(node3) === false);
    assert(node2.inputs[0].isConnectedFrom(node1) === false);
    assert(node3.inputs[0].isConnectedFrom(node1) === false);
  });

  it("disconnect(destination, output)", () => {
    //       +-------+
    //       | node1 |
    //       +-------+
    //         |   |
    //     +---+   +---+
    //     |           |
    // +-------+   +-------+
    // | node2 |   | node3 |
    // +-------+   +-------+
    const node1 = new AudioNode(context, {}, { outputs: [ 1, 1 ] });
    const node2 = new AudioNode(context, {}, { inputs: [ 1 ] });
    const node3 = new AudioNode(context, {}, { inputs: [ 1 ] });

    node1.outputs[0].enable();
    node1.outputs[1].enable();
    node1.connect(node2, 0);
    node1.connect(node3, 1);

    node1.disconnect(node2, 1);
    node1.disconnect(node3, 0);
    assert(node1.outputs[0].isConnectedTo(node2) === true);
    assert(node1.outputs[0].isConnectedTo(node3) === false);
    assert(node1.outputs[1].isConnectedTo(node2) === false);
    assert(node1.outputs[1].isConnectedTo(node3) === true);
    assert(node2.inputs[0].isConnectedFrom(node1) === true);
    assert(node3.inputs[0].isConnectedFrom(node1) === true);

    node1.disconnect(node2, 0);
    node1.disconnect(node3, 1);
    assert(node1.outputs[0].isConnectedTo(node2) === false);
    assert(node1.outputs[0].isConnectedTo(node3) === false);
    assert(node1.outputs[1].isConnectedTo(node2) === false);
    assert(node1.outputs[1].isConnectedTo(node3) === false);
    assert(node2.inputs[0].isConnectedFrom(node1) === false);
    assert(node3.inputs[0].isConnectedFrom(node1) === false);
  });

  it("enabled/disabled propagation", () => {
    const node1 = new AudioNode(context, {}, { outputs: [ 1 ] });
    const node2 = new AudioNode(context, {}, { inputs: [ 1 ], outputs: [ 1 ] });
    const node3 = new AudioNode(context, {}, { outputs: [ 1 ] });
    const node4 = new AudioNode(context, {}, { inputs: [ 1 ] });

    // +-------+
    // | node1 |
    // +---x---+
    //     |
    // +---x---+   +-------+
    // | node2 |   | node3 |
    // +---x---+   +---x---+
    //     |           |
    //     +-----+-----+
    //           |
    //       +---x---+
    //       | node4 |
    //       +-------+
    node1.connect(node2);
    node2.connect(node4);
    node3.connect(node4);
    assert(node1.outputs[0].isEnabled() === false);
    assert(node2.inputs[0].isEnabled() === false);
    assert(node2.outputs[0].isEnabled() === false);
    assert(node3.outputs[0].isEnabled() === false);
    assert(node4.inputs[0].isEnabled() === false);

    // +-------+
    // | node1 |
    // +---o---+
    //     |
    // +---o---+   +-------+
    // | node2 |   | node3 |
    // +---o---+   +---x---+
    //     |           |
    //     +-----+-----+
    //           |
    //       +---o---+
    //       | node4 |
    //       +-------+
    node1.outputs[0].enable();
    assert(node1.outputs[0].isEnabled() === true);
    assert(node2.inputs[0].isEnabled() === true);
    assert(node2.outputs[0].isEnabled() === true);
    assert(node3.outputs[0].isEnabled() === false);
    assert(node4.inputs[0].isEnabled() === true);

    // +-------+
    // | node1 |
    // +---o---+
    //     |
    // +---o---+   +-------+
    // | node2 |   | node3 |
    // +---o---+   +---o---+
    //     |           |
    //     +-----+-----+
    //           |
    //       +---o---+
    //       | node4 |
    //       +-------+
    node3.outputs[0].enable();
    assert(node1.outputs[0].isEnabled() === true);
    assert(node2.inputs[0].isEnabled() === true);
    assert(node2.outputs[0].isEnabled() === true);
    assert(node3.outputs[0].isEnabled() === true);
    assert(node4.inputs[0].isEnabled() === true);

    // +-------+
    // | node1 |
    // +---o---+
    //
    // +---x---+   +-------+
    // | node2 |   | node3 |
    // +---x---+   +---o---+
    //     |           |
    //     +-----+-----+
    //           |
    //       +---o---+
    //       | node4 |
    //       +-------+
    node1.disconnect();
    assert(node1.outputs[0].isEnabled() === true);
    assert(node2.inputs[0].isEnabled() === false);
    assert(node2.outputs[0].isEnabled() === false);
    assert(node3.outputs[0].isEnabled() === true);
    assert(node4.inputs[0].isEnabled() === true);

    // +-------+
    // | node1 |
    // +---o---+
    //
    // +---x---+   +-------+
    // | node2 |   | node3 |
    // +---x---+   +---x---+
    //     |           |
    //     +-----+-----+
    //           |
    //       +---x---+
    //       | node4 |
    //       +-------+
    node3.outputs[0].disable();
    assert(node1.outputs[0].isEnabled() === true);
    assert(node2.inputs[0].isEnabled() === false);
    assert(node2.outputs[0].isEnabled() === false);
    assert(node3.outputs[0].isEnabled() === false);
    assert(node4.inputs[0].isEnabled() === false);
  });

  it("misc", () => {
    const node = new AudioNode(context, {}, { inputs: [ 1 ], outputs: [ 1 ] });

    assert(node.inputs[0].isConnectedFrom() === false);
    assert(node.outputs[0].isConnectedTo() === false);
  });
});
