"use strict";

require("run-with-mocha");

const assert = require("assert");
const np = require("../../helpers/np");
const AudioContext = require("../../../src/impl/AudioContext");
const AnalyserNode = require("../../../src/impl/AnalyserNode");
const OscillatorNode = require("../../../src/impl/OscillatorNode");

const context = new AudioContext({ sampleRate: 8000, blockSize: 32 });

// test nodes
let oscillator;
let analyser;
let channel;
let channels;

describe("impl/AnalyserNode", () => {
  beforeEach(() => {
    channel = new Float32Array(context.blockSize);
    channels = [channel];

    // create nodes
    oscillator = new OscillatorNode(context);
    analyser = new AnalyserNode(context);
    analyser.setFftSize(context.blockSize);

    // connect nodes
    oscillator.connect(analyser);
    analyser.connect(context.getDestination());

    // resume
    oscillator.start();
    context.resume();
  });

  afterEach(() => {
    analyser.disconnect(context.getDestination());
    oscillator.disconnect(analyser);
  });

  it("should get time domain data (float)", () => {
    const waveform = new Float32Array(channel.length);

    analyser.getFloatTimeDomainData(waveform);
    assert.deepEqual(waveform, np.zeros(waveform.length));

    context.process(channels, 0);
    analyser.getFloatTimeDomainData(waveform);

    assert.deepEqual(waveform, channel);
  });

  it("should get time domain data (byte)", () => {
    const waveform = new Uint8Array(channel.length);

    analyser.getByteTimeDomainData(waveform);
    assert.deepEqual(waveform, np.full(waveform.length, 128));

    context.process(channels, 0);
    analyser.getByteTimeDomainData(waveform);

    assert.deepEqual(waveform, [
      128, 171, 209, 237, 253, 253, 239, 212,
      174, 132,  88,  49,  20,   3,   1,  14,
      40,   77, 119, 163, 202, 233, 251, 254,
      243, 218, 182, 139,  96,  56,  24,   5,
    ]);
  });

  it("should get frequency data (float)", () => {
    const spectrum = new Float32Array(channel.length);

    analyser.getFloatFrequencyData(spectrum);
    assert.deepEqual(spectrum, np.zeros(spectrum.length));

    context.process(channels, 0);
    analyser.getFloatFrequencyData(spectrum);

    assert(spectrum[0] === -31.810009002685547);
    assert(spectrum[4] === -52.464996337890625);
    assert(spectrum[8] === -99.65359497070312);
    assert(spectrum[15] === -114.25790405273438);
  });

  it("should get frequency data (byte)", () => {
    const spectrum = new Uint8Array(channel.length);

    analyser.getByteFrequencyData(spectrum);
    // assert.deepEqual(spectrum, np.full(spectrum.length, 255));

    context.process(channels, 0);
    analyser.getByteFrequencyData(spectrum);

    assert(spectrum[0] === 248);
    assert(spectrum[4] === 173);
    assert(spectrum[8] === 1);
    assert(spectrum[15] === 0);
  });
});
