"use strict";

const assert = require("power-assert");
const deepEqual = require("deep-equal");
const np = require("../helpers/np");
const attrTester = require("../helpers/attrTester");
const paramTester = require("../helpers/paramTester");
const AudioContext = require("../../src/impl/AudioContext");
const AudioParam = require("../../src/impl/AudioParam");
const AudioParamDSP = require("../../src/impl/dsp/AudioParam");
const AudioNode = require("../../src/impl/AudioNode");
const GainNode = require("../../src/impl/GainNode")

const context = new AudioContext({ sampleRate: 8000, blockSize: 16 });
const testSpec = {};

testSpec.context = {
  testCase: [ { expected: context } ]
};

testSpec.value = {
  testCase: [
    { value: 1, expected: 1 }
  ]
};

testSpec.defaultValue = {
  testCase: [ { expected: 0} ]
};

describe("AudioParam", () => {
  describe("inherits", () => {
    const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

    assert(param instanceof AudioParam);
  });

  describe("basic attributes", () => {
    attrTester.makeTests(context, {
      class: AudioParam,
      create: context => new AudioParam(context, { rate: "control", defaultValue: 0 }),
      testSpec
    });

    it(".rate - audio rate", () => {
      const param = new AudioParam(context, { rate: "audio", defaultValue: 0 });

      assert(param.getRate() === "audio");
    });

    it(".rate - control rate", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

      assert(param.getRate() === "control");
    });
  });

  describe("scheduling", () => {
    it("works", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });
      const curve = new Float32Array(44100);

      param.setValueAtTime(0.2, 0);
      param.setValueAtTime(0.3, 0.1);
      param.setValueAtTime(0.4, 0.2);
      param.linearRampToValueAtTime(1, 0.3);
      param.linearRampToValueAtTime(0.8, 0.325);
      param.setTargetAtTime(0.5, 0.325, 0.1);
      param.setValueAtTime(0.55, 0.5);
      param.exponentialRampToValueAtTime(0.75, 0.6);
      param.exponentialRampToValueAtTime(0.05, 0.7);
      param.setValueCurveAtTime(curve, 0.7, 0.3);

      assert(deepEqual(param.getEvents(), [
        { type: "setValueAtTime", time: 0, args: [ 0.2, 0 ] },
        { type: "setValueAtTime", time: 0.1, args: [ 0.3, 0.1 ] },
        { type: "setValueAtTime", time: 0.2, args: [ 0.4, 0.2 ] },
        { type: "linearRampToValueAtTime", time: 0.3, args: [ 1, 0.3 ] },
        { type: "linearRampToValueAtTime", time: 0.325, args: [ 0.8, 0.325 ] },
        { type: "setTargetAtTime", time: 0.325, args: [ 0.5, 0.325, 0.1 ] },
        { type: "setValueAtTime", time: 0.5, args: [ 0.55, 0.5 ] },
        { type: "exponentialRampToValueAtTime", time: 0.6, args: [ 0.75, 0.6 ] },
        { type: "exponentialRampToValueAtTime", time: 0.7, args: [ 0.05, 0.7 ] },
        { type: "setValueCurveAtTime", time: 0.7, args: [ curve, 0.7, 0.3 ] }
      ]));
    });

    it("replace", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

      param.setValueAtTime(0.2, 0);
      param.linearRampToValueAtTime(1, 0.5);
      param.linearRampToValueAtTime(0.8, 0.5);
      param.setValueAtTime(1.0, 0.5);

      assert(deepEqual(param.getEvents(), [
        { type: "setValueAtTime", time: 0, args: [ 0.2, 0 ] },
        { type: "linearRampToValueAtTime", time: 0.5, args: [ 0.8, 0.5 ] },
        { type: "setValueAtTime", time: 0.5, args: [ 1.0, 0.5 ] }
      ]));
    });

    it("sort", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

      param.setValueAtTime(1.0, 1.0);
      param.setValueAtTime(0.5, 0.5);
      param.setValueAtTime(0.0, 0.0);

      assert(deepEqual(param.getEvents(), [
        { type: "setValueAtTime", time: 0.0, args: [ 0.0, 0.0 ] },
        { type: "setValueAtTime", time: 0.5, args: [ 0.5, 0.5 ] },
        { type: "setValueAtTime", time: 1.0, args: [ 1.0, 1.0 ] }
      ]));
    });

    it("cancel", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });
      const curve = new Float32Array(44100);

      param.setValueAtTime(0.2, 0);
      param.setValueAtTime(0.3, 0.1);
      param.setValueAtTime(0.4, 0.2);
      param.linearRampToValueAtTime(1, 0.3);
      param.linearRampToValueAtTime(0.8, 0.325);
      param.setTargetAtTime(0.5, 0.325, 0.1);
      param.setValueAtTime(0.55, 0.5);
      param.exponentialRampToValueAtTime(0.75, 0.6);
      param.exponentialRampToValueAtTime(0.05, 0.7);
      param.setValueCurveAtTime(curve, 0.7, 0.3);

      param.cancelScheduledValues(0.4);

      assert(deepEqual(param.getEvents(), [
        { type: "setValueAtTime", time: 0, args: [ 0.2, 0 ] },
        { type: "setValueAtTime", time: 0.1, args: [ 0.3, 0.1 ] },
        { type: "setValueAtTime", time: 0.2, args: [ 0.4, 0.2 ] },
        { type: "linearRampToValueAtTime", time: 0.3, args: [ 1, 0.3 ] },
        { type: "linearRampToValueAtTime", time: 0.325, args: [ 0.8, 0.325 ] },
        { type: "setTargetAtTime", time: 0.325, args: [ 0.5, 0.325, 0.1 ] }
      ]));
    });
  });

  describe("timeline", () => {
    const inf = Infinity;

    function pluck(items) {
      const list = [];

      [ "type", "startSample", "endSample", "startValue", "endValue" ].forEach((key) => {
        list.push(items[key]);
      });

      return list;
    }

    function fr(value) {
      return Math.round(value * context.sampleRate);
    }

    it("setValueAtTime", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

      param.setValueAtTime(0.0, 0);
      param.setValueAtTime(0.1, 1);
      param.setValueAtTime(0.2, 2);
      param.linearRampToValueAtTime(0.3, 3);
      param.setValueAtTime(0.4, 4);

      assert.deepEqual(param.getTimeline().map(pluck), [
        //                                                 startTime, endTime, startValue, endValue
        [ AudioParamDSP.SET_VALUE_AT_TIME                ,     fr(0),   fr(1),        0.0,      0.0 ],
        [ AudioParamDSP.SET_VALUE_AT_TIME                ,     fr(1),   fr(2),        0.1,      0.1 ],
        [ AudioParamDSP.SET_VALUE_AT_TIME                ,     fr(2),   fr(2),        0.2,      0.2 ],
        [ AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME     ,     fr(2),   fr(3),        0.2,      0.3 ],
        [ AudioParamDSP.SET_VALUE_AT_TIME                ,     fr(4),     inf,        0.4,      0.4 ]
      ]);
    });

    it("linearRampToValueAtTime", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

      param.linearRampToValueAtTime(0.1, 1);
      param.linearRampToValueAtTime(0.2, 2);
      param.setValueAtTime(0.3, 3);
      param.linearRampToValueAtTime(0.4, 4);

      assert.deepEqual(param.getTimeline().map(pluck), [
        //                                                 startTime, endTime, startValue, endValue
        [ AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME     ,     fr(0),   fr(1),        0.0,      0.1 ],
        [ AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME     ,     fr(1),   fr(2),        0.1,      0.2 ],
        [ AudioParamDSP.SET_VALUE_AT_TIME                ,     fr(3),   fr(3),        0.3,      0.3 ],
        [ AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME     ,     fr(3),   fr(4),        0.3,      0.4 ]
      ]);
    });

    it("exponentialRampToValueAtTime", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

      param.exponentialRampToValueAtTime(0.1, 1);
      param.exponentialRampToValueAtTime(0.2, 2);
      param.setValueAtTime(0.3, 3);
      param.exponentialRampToValueAtTime(0.4, 4);

      assert.deepEqual(param.getTimeline().map(pluck), [
        //                                                 startTime, endTime, startValue, endValue
        [ AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME,     fr(0),   fr(1),       1e-6,      0.1 ],
        [ AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME,     fr(1),   fr(2),        0.1,      0.2 ],
        [ AudioParamDSP.SET_VALUE_AT_TIME                ,     fr(3),   fr(3),        0.3,      0.3 ],
        [ AudioParamDSP.EXPONENTIAL_RAMP_TO_VALUE_AT_TIME,     fr(3),   fr(4),        0.3,      0.4 ]
      ]);
    });

    it("setTargetAtTime", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

      param.setTargetAtTime(0.1, 1, 0.5);
      param.setTargetAtTime(0.2, 2, 0.4);
      param.setTargetAtTime(0.3, 3, 0.3);
      param.setValueAtTime(0.4, 4);
      param.setTargetAtTime(0.5, 5, 0.2);
      param.linearRampToValueAtTime(0.6, 6);
      param.setTargetAtTime(0.7, 7, 0.1);

      assert.deepEqual(param.getTimeline().map(pluck), [
        //                                                 startTime, endTime, startValue, endValue
        [ AudioParamDSP.SET_TARGET_AT_TIME               ,     fr(1),   fr(2),        0.0,      0.1 ],
        [ AudioParamDSP.SET_TARGET_AT_TIME               ,     fr(2),   fr(3),        0.0,      0.2 ],
        [ AudioParamDSP.SET_TARGET_AT_TIME               ,     fr(3),   fr(4),        0.0,      0.3 ],
        [ AudioParamDSP.SET_VALUE_AT_TIME                ,     fr(4),   fr(5),        0.4,      0.4 ],
        [ AudioParamDSP.SET_TARGET_AT_TIME               ,     fr(5),   fr(5),        0.4,      0.5 ],
        [ AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME     ,     fr(5),   fr(6),        0.4,      0.6 ],
        [ AudioParamDSP.SET_TARGET_AT_TIME               ,     fr(7),     inf,        0.6,      0.7 ]
      ]);
    });

    it("setValueCurveAtTime", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });
      const curve1 = new Float32Array([ 0.1, 0.2, 0.3 ]);
      const curve2 = new Float32Array([ 0.4, 0.5, 0.6 ]);
      const f32 = Math.fround;

      param.setValueCurveAtTime(curve1, 0, 1);
      param.setValueAtTime(0.2, 2);
      param.setValueCurveAtTime(curve2, 3, 1);
      param.linearRampToValueAtTime(1.0, 5);

      assert.deepEqual(param.getTimeline().map(pluck), [
        //                                                 startTime, endTime, startValue, endValue
        [ AudioParamDSP.SET_VALUE_CURVE_AT_TIME          ,     fr(0),   fr(1),   f32(0.1), f32(0.3) ],
        [ AudioParamDSP.SET_VALUE_AT_TIME                ,     fr(2),   fr(3),       0.2 ,     0.2  ],
        [ AudioParamDSP.SET_VALUE_CURVE_AT_TIME          ,     fr(3),   fr(4),   f32(0.4), f32(0.6) ],
        [ AudioParamDSP.LINEAR_RAMP_TO_VALUE_AT_TIME     ,     fr(4),   fr(5),   f32(0.6),     1.0  ]
      ]);
    });

    it("cancel", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

      param.setValueAtTime(0.0, 0);
      param.setValueAtTime(0.1, 1);
      param.setValueAtTime(0.2, 2);
      param.cancelScheduledValues(2);

      assert.deepEqual(param.getTimeline().map(pluck), [
        //                                                 startTime, endTime, startValue, endValue
        [ AudioParamDSP.SET_VALUE_AT_TIME                ,     fr(0),   fr(1),        0.0,      0.0 ],
        [ AudioParamDSP.SET_VALUE_AT_TIME                ,     fr(1),     inf,        0.1,      0.1 ]
      ]);
    });
  });

  describe("connection", () => {
    it("basic operation", () => {
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });
      const node = new AudioNode(context, { inputs: [ 1, 1 ], outputs: [ 1, 1 ]});

      node.connect(param);

      assert(node.isConnectedTo(param) === true);
      assert(param.isConnectedFrom(node) === true);

      node.disconnect();

      assert(node.isConnectedTo(param) === false);
      assert(param.isConnectedFrom(node) === false);
    });

    it("misc", () => {
      const node = new AudioNode(context, { inputs: [], outputs: [ 1 ] });
      const param = new AudioParam(context, { rate: "control", defaultValue: 0 });

      assert(param.isConnectedFrom() === false);

      node.connect(param);
      assert(param.isConnectedFrom(node) === true);
    });
  });

  describe("processing", () => {
    //               +-------------------+
    //               | AudioNode (node1) |
    //               +-------------------+
    //                         |
    // +------------------+    |
    // | GainNode (node2) |    |
    // | gain (param)    <-----+
    // +------------------+
    let node1, node2, param;

    beforeEach(() => {
      node1 = new AudioNode(context, { inputs: [], outputs: [ 1 ] });
      node2 = new GainNode(context);
      param = node2.getGain();
      node1.connect(param);
    });

    it("static value", () => {
      [ 0, 0.25, 0.5, 0.5 ].forEach((value, i) => {
        param.setValue(value);
        param.dspProcess(i * 16);

        const expected = new Float32Array(16).fill(value);
        const actual = param.getSampleAccurateValues();

        assert(param.hasSampleAccurateValues() === false);
        assert(deepEqual(actual, expected));
      });
    });

    it("input and offset", () => {
      node1.enableOutputsIfNecessary();

      [ 0, 0.25, 0.5, 0.5 ].forEach((value, i) => {
        const noise = np.random_sample(16);

        node1.getOutput(0).getAudioBus().getMutableData()[0].set(noise);

        param.setValue(value);
        param.dspProcess(i * 16);

        const expected = new Float32Array(16).map((_, i) => value + noise[i]);
        const actual = param.getSampleAccurateValues();

        assert(param.hasSampleAccurateValues() === true);
        assert(deepEqual(actual, expected));
      });
    });

    it("events", () => {
      param.setValueAtTime(0, 0);
      param.linearRampToValueAtTime(1, 16/8000);

      param.setValue(1);
      param.dspProcess(0);

      const expected = new Float32Array(16).map((_, i) => i / 16);
      const actual = param.getSampleAccurateValues();

      assert(param.hasSampleAccurateValues() === true);
      assert(deepEqual(actual, expected));
    });

    it("events and input", () => {
      const noise = np.random_sample(16);

      node1.enableOutputsIfNecessary();
      node1.getOutput(0).getAudioBus().getMutableData()[0].set(noise);

      param.setValueAtTime(0, 0);
      param.linearRampToValueAtTime(1, 16/8000);

      param.setValue(1);
      param.dspProcess(0);

      const expected = new Float32Array(16).map((_, i) => (i / 16) + noise[i]);
      const actual = param.getSampleAccurateValues();

      assert(param.hasSampleAccurateValues() === true);
      assert(deepEqual(actual, expected));
    });
  });

  describe("event processing", () => {
    describe("setValueAtTime", () => {
      //0                16              32              48              64              80              96
      //|0123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|
      //|................|...............|...............|...............|...............|...............|
      const expectedValues = paramTester.toValues(`
        |                |               |               |       ************************|               |
        |                |               |               |               |               |               |
        |                |               |               |               |               |               |
        |                |               |               |               |               |               |
        |                |       ********************************        |               ****************|
        |                |               |               |               |               |               |
        |                |               |               |               |               |               |
        |                |               |               |               |               |               |
        |************************        |               |               |               |               |
      `); //                     ^                               ^                 ^
      //                         |                               |                 |
      //                         |                               |                 +-----+
      //                         |                               |                       |
      //                         |                               |                       setValueAtTime(0.5, 74/8000)
      //                         |                               setValueAtTime(1.0, 56/8000)
      //                         setValueAtTime(0.5, 24/8000)
      paramTester.makeTests(context, expectedValues, (param) => {
        param.setValue(0);
        param.setValueAtTime(0.5, 24/8000);
        param.setValueAtTime(1.0, 56/8000);
      }, (param) => {
        param.setValueAtTime(0.5, 74/8000);
      });
    });

    describe("linearRampToValueAtTime", () => {
      //0                16              32              48              64              80              96
      //|0123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|
      //|................|...............|...............|...............|...............|...............|
      const expectedValues = paramTester.toValues(`
        |                |               |               |     ****      |               |               |
        |                |               |               | ****    **    |               |               |
        |                |               |             ****          **  |               |               |
        |                |               |         ****  |             **|               |               |
        |                |               |      ***      |               ***             |  *************|
        |                |               | *****         |               |  **           |**             |
        |                |              ***              |               |    **         *               |
        |                |          **** |               |               |      **       |               |
        |***************************     |               |               |        *******|               |
      `); //                     ^                               ^                 ^        ^
      //                         |                               |                 |        |
      //                         |                               |                 |     +--+
      //                         |                               |                 |     |
      //                         |                               |                 |     linearRampToValueAtTime(0.5, 84/8000)
      //                         |                               |                 linearRampToValueAtTime(0, 74/8000)
      //                         |                               linearRampToValueAtTime(1, 56/8000)
      //                         param.setValueAtTime(0, 24/8000)
      paramTester.makeTests(context, expectedValues, (param) => {
        param.setValue(0);
        param.setValueAtTime(0, 24/8000);
        param.linearRampToValueAtTime(1, 56/8000);
        param.linearRampToValueAtTime(0, 74/8000);
      }, (param) => {
        param.linearRampToValueAtTime(0.5, 84/8000);
      });
    });

    describe("exponentialRampToValueAtTime", () => {
      //0                16              32              48              64              80              96
      //|0123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|
      //|................|...............|...............|...............|...............|...............|
      const expectedValues = paramTester.toValues(`
        |                |               |               |       *       |               |               |
        |                |               |               |      *        |               |               |
        |                |               |               |     *  *      |               |               |
        |                |               |               |   **    *     |               |               |
        |                |               |               | **       *    |               |   ************|
        |                |               |              ***          *   |               |  *            |
        |                |               |          **** |            ** |               | *             |
        |                |               |  ********     |              ****             **              |
        |***********************************             |               |  *************|               |
      `); //                 ^                                   ^                  ^         ^
      //                     |                                   |                  |         |
      //                     |                                   |                  |    +----+
      //                     |                                   |                  |    |
      //                     |                                   |                  |    exponentialRampToValueAtTime(0.5, 84/8000)
      //                     |                                   |                  exponentialRampToValueAtTime(0.01, 74/8000)
      //                     setValueAtTime(0.01, 20/8000)       exponentialRampToValueAtTime(1, 56/8000)
      paramTester.makeTests(context, expectedValues, (param) => {
        param.setValue(1e-6);
        param.setValueAtTime(0.01, 20/8000);
        param.exponentialRampToValueAtTime(1, 56/8000);
        param.exponentialRampToValueAtTime(0.01, 74/8000);
      }, (param) => {
        param.exponentialRampToValueAtTime(0.5, 84/8000);
      });
    });

    describe("setTargetAtTime", () => {
      //0                16              32              48              64              80              96
      //|0123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|
      //|................|...............|...............|...............|...............|...............|
      const expectedValues = paramTester.toValues(`
        |                |               |              **********       |               |               |
        |                |               |     ********* |        **     |               |               |
        |                |               | ****          |          **   |               |        *******|
        |                |              ***              |            ** |               |   *****       |
        |                |            ** |               |              ***              ****            |
        |                |          **   |               |               | ****          |               |
        |                |         *     |               |               |     ******    |               |
        |                |        *      |               |               |           ****|               |
        |*************************       |               |               |               |               |
      `); //                     ^                               ^                 ^
      //                         |                               |                 |
      //                         |                               |                 +-----+
      //                         |                               |                       |
      //                         |                               |                       setTargetAtTime(1, 74/8000, 16/8000)
      //                         |                               setTargetAtTime(0, 56/8000, 12/8000)
      //                         setTargetAtTime(1, 24/8000, 8/8000)
      paramTester.makeTests(context, expectedValues, (param) => {
        param.setValue(0);
        param.setTargetAtTime(1, 24/8000, 8/8000);
        param.setTargetAtTime(0, 56/8000, 12/8000);
      }, (param) => {
        param.setTargetAtTime(1, 74/8000, 16/8000);
      });
    });

    describe("setValueCurveAtTime", () => {
      //0                16              32              48              64              80              96
      //|0123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|
      //|................|...............|...............|...............|...............|...............|
      const expectedValues = paramTester.toValues(`
        |                |               |               |      *************************|             **|
        |                |               |               |    **         |               |            *  |
        |                |               |   ****        | ***           |               |     **    *   |
        |                |               | **    *****   **              |               |    *  ** *    |
        |                |****          ***           ***|               |               |   *     *     |
        |              ***    ****    ** |               |               |               *  *            |
        |            **  |        ****   |               |               |               |**             |
        |          **    |               |               |               |               |               |
        |**********      |               |               |               |               |               |
      `); //     ^==============================================^                  ^==================^
      //         |                                                                 |
      //         |                                                                 +-----+
      //         |                                                                       |
      //         setValueCurveAtTime(curve, 8/8000, 48/8000)                             setValueCurveAtTime(curve, 74/8000, 20/8000)
      const curve = new Float32Array([ 0, 0.5, 0.25, 0.75, 0.5, 1 ]);

      paramTester.makeTests(context, expectedValues, (param) => {
        param.setValue(0);
        param.setValueCurveAtTime(curve, 8/8000, 48/8000);
      }, (param) => {
        param.setValueCurveAtTime(curve, 74/8000, 20/8000);
      });
    });
  });
});
