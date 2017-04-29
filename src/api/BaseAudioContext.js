"use strict";

const impl = require("../impl");
const util = require("../util");
const EventTarget = require("./EventTarget");
const AudioDestinationNode = require("./AudioDestinationNode");
const AudioListener = require("./AudioListener");
const AudioBuffer = require("./AudioBuffer");
const AudioBufferSourceNode = require("./AudioBufferSourceNode");
const ScriptProcessorNode = require("./ScriptProcessorNode");
const AnalyserNode = require("./AnalyserNode");
const GainNode = require("./GainNode");
const DelayNode = require("./DelayNode");
const BiquadFilterNode = require("./BiquadFilterNode");
const IIRFilterNode = require("./IIRFilterNode");
const WaveShaperNode = require("./WaveShaperNode");
const PannerNode = require("./PannerNode");
const SpatialPannerNode = require("./SpatialPannerNode");
const StereoPannerNode = require("./StereoPannerNode");
const ConvolverNode = require("./ConvolverNode");
const ConstantSourceNode = require("./ConstantSourceNode");
const ChannelSplitterNode = require("./ChannelSplitterNode");
const ChannelMergerNode = require("./ChannelMergerNode");
const DynamicsCompressorNode = require("./DynamicsCompressorNode");
const OscillatorNode = require("./OscillatorNode");
const PeriodicWave = require("./PeriodicWave");
const decoder = require("../decoder");

class BaseAudioContext extends EventTarget {
  constructor(opts) {
    super();

    util.defineProp(this, "_impl", new impl.AudioContext(opts));

    this._impl.$destination = new AudioDestinationNode(this, this._impl.getDestination());
    this._impl.$listener = new AudioListener(this, this._impl.getListener());
    this._impl.$onstatechange = null;
  }

  get destination() {
    return this._impl.$destination;
  }

  get sampleRate() {
    return this._impl.getSampleRate();
  }

  get currentTime() {
    return this._impl.getCurrentTime();
  }

  get listener() {
    return this._impl.$listener;
  }

  get state() {
    return this._impl.getState();
  }

  suspend() {
    return this._impl.suspend();
  }

  resume() {
    return this._impl.resume();
  }

  close() {
    return this._impl.close();
  }

  get onstatechange() {
    return this._impl.$onstatechange;
  }

  set onstatechange(callback) {
    this._impl.replaceEventListener("statechange", this._impl.$onstatechange, callback);
    this._impl.$onstatechange = callback;
  }

  createBuffer(numberOfChannels, length, sampleRate) {
    return new AudioBuffer({ numberOfChannels, length, sampleRate });
  }

  decodeAudioData(audioData, successCallback, errorCallback) {
    const promise = decoder.decode(audioData, { sampleRate: this.sampleRate });

    promise.then(successCallback, errorCallback);

    return promise;
  }

  createBufferSource() {
    return new AudioBufferSourceNode(this);
  }

  createConstantSource() {
    return new ConstantSourceNode(this);
  }

  createScriptProcessor(bufferSize, numberOfInputChannels, numberOfOutputChannels) {
    return new ScriptProcessorNode(this, { bufferSize, numberOfInputChannels, numberOfOutputChannels });
  }

  createAnalyser() {
    return new AnalyserNode(this);
  }

  createGain() {
    return new GainNode(this);
  }

  createDelay(maxDelayTime) {
    return new DelayNode(this, { maxDelayTime });
  }

  createBiquadFilter() {
    return new BiquadFilterNode(this);
  }

  createIIRFilter(feedforward, feedback) {
    return new IIRFilterNode(this, { feedforward, feedback });
  }

  createWaveShaper() {
    return new WaveShaperNode(this);
  }

  createPanner() {
    return new PannerNode(this);
  }

  createSpatialPanner() {
    return new SpatialPannerNode(this);
  }

  createStereoPanner() {
    return new StereoPannerNode(this);
  }

  createConvolver() {
    return new ConvolverNode(this);
  }

  createChannelSplitter(numberOfOutputs) {
    return new ChannelSplitterNode(this, { numberOfOutputs });
  }

  createChannelMerger(numberOfInputs) {
    return new ChannelMergerNode(this, { numberOfInputs });
  }

  createDynamicsCompressor() {
    return new DynamicsCompressorNode(this);
  }

  createOscillator() {
    return new OscillatorNode(this);
  }

  createPeriodicWave(real, imag, constraints) {
    return new PeriodicWave(this, { real, imag, constraints });
  }
}

module.exports = BaseAudioContext;
