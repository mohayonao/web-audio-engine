"use strict";

const assert = require("power-assert");
const sinon = require("sinon");
const apiTester = require("./helpers/apiTester");
const api = require("../src/api");
const AudioContext = require("../src/api/AudioContext");
const AudioDestinationNode = require("../src/api/AudioDestinationNode");
const AudioListener = require("../src/api/AudioListener");
const AudioBuffer = require("../src/api/AudioBuffer");
const AudioWorkerNode = require("../src/api/AudioWorkerNode");

const context = new AudioContext();

describe("api test", () => {
  describe("AnalyserNode", () => {
    apiTester.makeTests(context, {
      class: api.AnalyserNode,
      create: context => context.createAnalyser()
    });
  });

  describe("AudioBuffer", () => {
    apiTester.makeTests(context, {
      class: api.AudioBuffer,
      create: context => context.createBuffer(1, 16, context.sampleRate)
    });
  });

  describe("AudioBufferSourceNode", () => {
    apiTester.makeTests(context, {
      class: api.AudioBufferSourceNode,
      create: context => context.createBufferSource(),
      ignored: [ "buffer" ]
    })

    it(".buffer=", () => {
      const target = context.createBufferSource();
      const buffer = context.createBuffer(1, 16, context.sampleRate);
      const setBuffer = target._impl.setBuffer = sinon.spy();

      target.buffer = buffer;

      assert(setBuffer.calledWith(buffer));
      assert(target.buffer === buffer);
    });
  });

  describe("AudioContext", () => {
    apiTester.makeTests(null, {
      class: api.AudioContext,
      create: () => new AudioContext(),
      ignored: [ "decodeAudioData", "destination", "listener", /^create\w+$/ ]
    });

    it(".destination", () => {
      const target = new AudioContext();

      assert(target.destination instanceof AudioDestinationNode);
    });

    it(".listener", () => {
      const target = new AudioContext();

      assert(target.listener instanceof AudioListener);
    });

    const wavData = new Uint32Array([
     0x46464952, 0x0000002c, 0x45564157, 0x20746d66,
     0x00000010, 0x00020001, 0x0000ac44, 0x0002b110,
     0x00100004, 0x61746164, 0x00000008, 0x8000c000, 0x3fff7fff
   ]).buffer;

    it(".decodeAudioData()", () => {
      const target = new AudioContext({ sampleRate: 44100 });

      return target.decodeAudioData(wavData).then((audioBuffer) => {
        assert(audioBuffer instanceof AudioBuffer);
      });
    });

    it(".decodeAudioData() - callback style", (done) => {
      const target = new AudioContext({ sampleRate: 44100 });

      target.decodeAudioData(wavData, (audioBuffer) => {
        assert(audioBuffer instanceof AudioBuffer);
        done();
      });
    });
  });

  describe("AudioDestinationNode", () => {
    apiTester.makeTests(context, {
      class: api.AudioDestinationNode,
      create: context => context.destination
    });
  });

  describe("AudioListener", () => {
    apiTester.makeTests(context, {
      class: api.AudioListener,
      create: context => context.listener
    })
  });

  describe("AudioNode", () => {
    apiTester.makeTests(context, {
      class: api.AudioNode,
      create: context => context.createGain(),
      ignored: [ "context" ]
    });

    it(".context", () => {
      const target = context.createGain();

      assert(target.context === context);
    });

    it(".connect() - return the provided destination", () => {
      const node1 = context.createGain();
      const node2 = context.createGain();
      const retVal = node1.connect(node2);

      assert(retVal === node2);
    });
  });

  describe("AudioParam", () => {
    apiTester.makeTests(context, {
      class: api.AudioParam,
      create: context => context.createGain().gain
    })
  });

  describe("AudioWorkerNode", () => {
    const worker = {};
    const numberOfInputs = 4;
    const numberOfOutputs = [ 1, 2 ];

    apiTester.makeTests(context, {
      class: api.AudioWorkerNode,
      create: context => new AudioWorkerNode(context, { worker, numberOfInputs, numberOfOutputs })
    });
  });

  describe("BiquadFilterNode", () => {
    apiTester.makeTests(context, {
      class: api.BiquadFilterNode,
      create: context => context.createBiquadFilter()
    });
  });

  describe("ChannelMergerNode", () => {
    apiTester.makeTests(context, {
      class: api.ChannelMergerNode,
      create: context => context.createChannelMerger()
    });
  });

  describe("ChannelSplitterNode", () => {
    apiTester.makeTests(context, {
      class: api.ChannelSplitterNode,
      create: context => context.createChannelSplitter()
    });
  });

  describe("ConvolverNode", () => {
    apiTester.makeTests(context, {
      class: api.ConvolverNode,
      create: context => context.createConvolver(),
      ignored: [ "buffer" ]
    });

    it(".buffer=", () => {
      const target = context.createConvolver();
      const buffer = context.createBuffer(1, 16, context.sampleRate);
      const setBuffer = target._impl.setBuffer = sinon.spy();

      target.buffer = buffer;

      assert(setBuffer.calledWith(buffer));
      assert(target.buffer === buffer);
    });
  });

  describe("DelayNode", () => {
    apiTester.makeTests(context, {
      class: api.DelayNode,
      create: context => context.createDelay()
    });
  });

  describe("DynamicsCompressorNode", () => {
    apiTester.makeTests(context, {
      class: api.DynamicsCompressorNode,
      create: context => context.createDynamicsCompressor()
    });
  });

  describe("EventTarget", () => {
    it(".addEventListener()", () => {
      const target = context.createOscillator();
      const addEventListener = target._impl.addEventListener = sinon.spy();
      const listener = sinon.spy();

      target.addEventListener("ended", listener);
      assert(addEventListener.calledWith("ended", listener));
    });

    it(".removeEventListener()", () => {
      const target = context.createOscillator();
      const removeEventListener = target._impl.removeEventListener = sinon.spy();
      const listener = sinon.spy();

      target.removeEventListener("ended", listener);
      assert(removeEventListener.calledWith("ended", listener));
    });
  });

  describe("GainNode", () => {
    apiTester.makeTests(context, {
      class: api.GainNode,
      create: context => context.createGain()
    });
  });

  describe("IIRFilterNode", () => {
    apiTester.makeTests(context, {
      class: api.IIRFilterNode,
      create: context => context.createIIRFilter()
    });
  });

  describe("OscillatorNode", () => {
    apiTester.makeTests(context, {
      class: api.OscillatorNode,
      create: context => context.createOscillator()
    });
  });

  describe("PannerNode", () => {
    apiTester.makeTests(context, {
      class: api.PannerNode,
      create: context => context.createPanner()
    });
  });

  describe("PeriodicWave", () => {
    const real = new Float32Array([ 0, 1 ]);
    const imag = new Float32Array([ 0, 0 ]);

    apiTester.makeTests(context, {
      class: api.PeriodicWave,
      create: context => context.createPeriodicWave(real, imag)
    });
  });

  describe("ScriptProcessorNode", () => {
    apiTester.makeTests(context, {
      class: api.ScriptProcessorNode,
      create: context => context.createScriptProcessor(256, 1, 1)
    });
  });

  describe("SpatialPannerNode", () => {
    apiTester.makeTests(context, {
      class: api.SpatialPannerNode,
      create: context => context.createSpatialPanner()
    });
  });

  describe("StereoPannerNode", () => {
    apiTester.makeTests(context, {
      class: api.StereoPannerNode,
      create: context => context.createStereoPanner()
    });
  });

  describe("WaveShaperNode", () => {
    apiTester.makeTests(context, {
      class: api.WaveShaperNode,
      create: context => context.createWaveShaper()
    });
  });
});
