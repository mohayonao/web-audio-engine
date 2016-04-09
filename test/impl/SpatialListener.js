"use strict";

const attrTester = require("../helpers/attrTester");
const AudioContext = require("../../src/impl/AudioContext");
const SpatialListener = require("../../src/impl/SpatialListener");
const AudioParam = require("../../src/impl/AudioParam");

const context = new AudioContext({ sampleRate: 8000, processingSizeInFrames: 16 });
const testSpec = {};

testSpec.positionX = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.positionY = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.positionZ = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.forwardX = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.forwardY = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.forwardZ = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.upX = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.upY = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

testSpec.upZ = {
  testCase: [ { expected: value => value instanceof AudioParam } ]
};

describe("SpatialListener", () => {
  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: SpatialListener,
      testSpec
    });
  });
});
