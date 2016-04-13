"use strict";

const assert = require("power-assert");
const deepEqual = require("deep-equal");
const np = require("../helpers/np");
const attrTester = require("../helpers/attrTester");
const paramTester = require("../helpers/paramTester");
const AudioContext = require("../../src/impl/AudioContext");
const AudioParam = require("../../src/impl/AudioParam");
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

    function procEvent(times) {
      const inNumSamples = context.blockSize;
      const currentTime = (inNumSamples * times) / 8000;
      const nextCurrentTime = (inNumSamples * (times + 1)) / 8000;
      const sampleRate = context.sampleRate;

      return { currentTime, nextCurrentTime, inNumSamples, sampleRate };
    }

    it("static value", () => {
      [ 0, 0.25, 0.5, 0.5 ].forEach((value, procIndex) => {
        param.setValue(value);
        param.dspProcess(procEvent(procIndex));

        const expected = new Float32Array(16).fill(value);
        const actual = param.getSampleAccurateValues();

        assert(param.hasSampleAccurateValues() === false);
        assert(deepEqual(actual, expected));
      });
    });

    it("input and offset", () => {
      node1.enableOutputsIfNecessary();

      [ 0, 0.25, 0.5, 0.5 ].forEach((value, procIndex) => {
        const noise = np.random_sample(16);

        node1.getOutput(0).getAudioBus().getMutableData()[0].set(noise);

        param.setValue(value);
        param.dspProcess(procEvent(procIndex));

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
      param.dspProcess(procEvent(0));

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
      param.dspProcess(procEvent(0));

      const expected = new Float32Array(16).map((_, i) => (i / 16) + noise[i]);
      const actual = param.getSampleAccurateValues();

      assert(param.hasSampleAccurateValues() === true);
      assert(deepEqual(actual, expected));
    });
  });

  describe("event processing", () => {
    let param;

    beforeEach(() => {
      param = new GainNode(context).getGain();
    });

    function procEvent(times) {
      const inNumSamples = context.blockSize;
      const currentTime = (inNumSamples * times) / 8000;
      const nextCurrentTime = (inNumSamples * (times + 1)) / 8000;
      const sampleRate = context.sampleRate;

      return { currentTime, nextCurrentTime, inNumSamples, sampleRate };
    }

    function deepCloseTo(a, b, delta) {
      assert(a.length === b.length);

      for (let i = 0, imax = a.length; i < imax; i++) {
        assert(Math.abs(a[i] - b[i]) <= delta, `a[${i}]=${a[i]}, b[${i}]=${b[i]}`);
      }

      return true;
    }

    describe("setValueAtTime", () => {
      //|0123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|
      //|................|...............|...............|...............|...............|
      const expectedValues = paramTester.toValues(`
        |                |               |            **********************             |
        |                |               |               |               |               |
        |                |               |               |               |               |
        |                |               |               |               |               |
        |                |      **********************   |               |  *************|
        |                |               |               |               |               |
        |                |               |               |               |               |
        |                |               |               |               |               |
        |***********************         |               |               |               |
      `);

      beforeEach(() => {
        param.setValue(0);
        param.setValueAtTime(0.5, 23/8000);
        param.setValueAtTime(1.0, 45/8000);
      });

      it("works", () => {
        for (let i = 0; i < 4; i++) {
          param.dspProcess(procEvent(i));

          const expected = expectedValues.subarray(i * 16, (i + 1) * 16);
          const actual = param.getSampleAccurateValues();

          assert(param.hasSampleAccurateValues() === true);
          assert(deepCloseTo(actual, expected, 0.0625));
        }
      });

      it("works partially", () => {
        param.dspProcess(procEvent(2));

        const expected = expectedValues.subarray(2 * 16, 3 * 16);
        const actual = param.getSampleAccurateValues();

        assert(param.hasSampleAccurateValues() === true);
        assert(deepCloseTo(actual, expected, 0.0625));
      });

      it("works with dynamic insertion", () => {
        for (let i = 0; i < 4; i++) {
          param.dspProcess(procEvent(i));
        }
        param.setValueAtTime(0.5, 67/8000);
        param.dspProcess(procEvent(4));

        const expected = expectedValues.subarray(4 * 16, (4 + 1) * 16);
        const actual = param.getSampleAccurateValues();

        assert(param.hasSampleAccurateValues() === true);
        assert(deepCloseTo(actual, expected, 0.0625));
      });
    });

    describe("linearRampToValueAtTime", () => {
      //|0123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|
      //|................|...............|...............|...............|...............|
      const expectedValues = paramTester.toValues(`
        |                |               |            ** |               |               |
        |                |               |         ***  *|               |               |
        |                |               |     ****      *               |               |
        |                |               |  ***          |*              |               |
        |                |               ***             | *             |     **********|
        |                |            ***|               |  *            | ****          |
        |                |        ****   |               |   *           **              |
        |                |     ***       |               |    *          |               |
        |**********************          |               |     **********|               |
      `);

      beforeEach(() => {
        param.setValue(0);
        param.setValueAtTime(0, 20/8000);
        param.linearRampToValueAtTime(1, 46/8000);
        param.linearRampToValueAtTime(0, 54/8000);
      });

      it("works", () => {
        for (let i = 0; i < 4; i++) {
          param.dspProcess(procEvent(i));

          const expected = expectedValues.subarray(i * 16, (i + 1) * 16);
          const actual = param.getSampleAccurateValues();

          assert(param.hasSampleAccurateValues() === true);
          assert(deepCloseTo(actual, expected, 0.0625));
        }
      });

      it("works partially", () => {
        param.dspProcess(procEvent(3));

        const expected = expectedValues.subarray(3 * 16, 4 * 16);
        const actual = param.getSampleAccurateValues();

        assert(param.hasSampleAccurateValues() === true);
        assert(deepCloseTo(actual, expected, 0.0625));
      });

      it("works with dynamic insertion", () => {
        for (let i = 0; i < 4; i++) {
          param.dspProcess(procEvent(i));
        }
        param.linearRampToValueAtTime(0.5, 72/8000);
        param.dspProcess(procEvent(4));

        const expected = expectedValues.subarray(4 * 16, (4 + 1) * 16);
        const actual = param.getSampleAccurateValues();

        assert(param.hasSampleAccurateValues() === true);
        assert(deepCloseTo(actual, expected, 0.0625));
      });
    });

    describe("exponentialRampToValueAtTime", () => {
      //|0123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|
      //|................|...............|...............|...............|...............|
      const expectedValues = paramTester.toValues(`
        |                |               |             * |               |               |
        |                |               |            *  |               |               |
        |                |               |           *   |               |               |
        |                |               |          *    |               |               |
        |                |               |         *    *|               |       ********|
        |                |               |       **      *               |     **        |
        |                |               |    ***        |               |   **          |
        |                |              ******           |**             ****            |
        |******************************* |               |  *************|               |
      `);

      beforeEach(() => {
        param.setValue(0);
        param.setValueAtTime(0.01, 20/8000);
        param.exponentialRampToValueAtTime(1, 46/8000);
        param.exponentialRampToValueAtTime(0.01, 54/8000);
      });

      it("works", () => {
        for (let i = 0; i < 4; i++) {
          param.dspProcess(procEvent(i));

          const expected = expectedValues.subarray(i * 16, (i + 1) * 16);
          const actual = param.getSampleAccurateValues();

          assert(param.hasSampleAccurateValues() === true);
          assert(deepCloseTo(actual, expected, 0.0625));
        }
      });

      it("works partially", () => {
        param.dspProcess(procEvent(3));

        const expected = expectedValues.subarray(3 * 16, 4 * 16);
        const actual = param.getSampleAccurateValues();

        assert(param.hasSampleAccurateValues() === true);
        assert(deepCloseTo(actual, expected, 0.0625));
      });

      it("works with dynamic insertion", () => {
        for (let i = 0; i < 4; i++) {
          param.dspProcess(procEvent(i));
        }
        param.exponentialRampToValueAtTime(0.5, 72/8000);
        param.dspProcess(procEvent(4));

        const expected = expectedValues.subarray(4 * 16, (4 + 1) * 16);
        const actual = param.getSampleAccurateValues();

        assert(param.hasSampleAccurateValues() === true);
        assert(deepCloseTo(actual, expected, 0.0625));
      });
    });

    describe("setTargetAtTime", () => {
      //|0123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|
      //|................|...............|...............|...............|...............|
      const expectedValues = paramTester.toValues(`
        |                |               |               |               |               |
        |                |               |               |               |               |
        |                |             ****              |               |               |
        |                |          ***  | **            |               |               |
        |                |        **     |   ***         |               |               |
        |                |      **       |      ****     |               |             **|
        |                |     *         |          *******              |          ***  |
        |                |    *          |               | ************* |        **     |
        |*********************           |               |              **********       |
      `);

      beforeEach(() => {
        param.setValue(0);
        param.setTargetAtTime(1, 20/8000, 8/8000);
        param.setTargetAtTime(0, 32/8000, 12/8000);
      });

      it("works", () => {
        for (let i = 0; i < 4; i++) {
          param.dspProcess(procEvent(i));

          const expected = expectedValues.subarray(i * 16, (i + 1) * 16);
          const actual = param.getSampleAccurateValues();

          assert(param.hasSampleAccurateValues() === true);
          assert(deepCloseTo(actual, expected, 0.0625));
        }
      });

      it.skip("works partially", () => {
        param.dspProcess(procEvent(3));

        const expected = expectedValues.subarray(3 * 16, 4 * 16);
        const actual = param.getSampleAccurateValues();

        assert(param.hasSampleAccurateValues() === true);
        assert(deepCloseTo(actual, expected, 0.0625));
      });

      it("works with dynamic insertion", () => {
        for (let i = 0; i < 4; i++) {
          param.dspProcess(procEvent(i));
        }
        param.setTargetAtTime(1, 72/8000, 16/8000);
        param.dspProcess(procEvent(4));

        const expected = expectedValues.subarray(4 * 16, (4 + 1) * 16);
        const actual = param.getSampleAccurateValues();

        assert(param.hasSampleAccurateValues() === true);
        assert(deepCloseTo(actual, expected, 0.0625));
      });
    });

    describe("setValueCurveAtTime", () => {
      //|0123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|123456789abcdef|
      //|................|...............|...............|...............|...............|
      const expectedValues = paramTester.toValues(`
        |                |               |               |      *****************        |
        |                |               |               |    **         |               |
        |                |               |   ****        | ***           |            * *|
        |                |               | **    *****   **              |               |
        |                |****          ***           ***|               |           * * |
        |              ***    ****    ** |               |               |        **     |
        |            **  |        ****   |               |               |          *    |
        |          **    |               |               |               |               |
        |**********      |               |               |               |       *       |
      `);
      const curve = new Float32Array([ 0, 0.5, 0.25, 0.75, 0.5, 1 ]);

      beforeEach(() => {
        param.setValue(0);
        param.setValueCurveAtTime(curve, 8/8000, 48/8000);
      });

      it("works", () => {
        for (let i = 0; i < 4; i++) {
          param.dspProcess(procEvent(i));

          const expected = expectedValues.subarray(i * 16, (i + 1) * 16);
          const actual = param.getSampleAccurateValues();

          assert(param.hasSampleAccurateValues() === true);
          assert(deepCloseTo(actual, expected, 0.0625));
        }
      });

      it("works partially", () => {
        param.dspProcess(procEvent(3));

        const expected = expectedValues.subarray(3 * 16, 4 * 16);
        const actual = param.getSampleAccurateValues();

        assert(param.hasSampleAccurateValues() === true);
        assert(deepCloseTo(actual, expected, 0.0625));
      });

      it("works with dynamic insertion", () => {
        for (let i = 0; i < 4; i++) {
          param.dspProcess(procEvent(i));
        }
        param.setValueCurveAtTime(curve, 72/8000, 8/8000);
        param.dspProcess(procEvent(4));

        const expected = expectedValues.subarray(4 * 16, (4 + 1) * 16);
        const actual = param.getSampleAccurateValues();

        assert(param.hasSampleAccurateValues() === true);
        assert(deepCloseTo(actual, expected, 0.0625));
      });
    });
  });
});
