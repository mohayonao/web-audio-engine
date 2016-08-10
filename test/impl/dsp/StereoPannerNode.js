"use strict";

const assert = require("power-assert");
const np = require("../../helpers/np");
const AudioContext = require("../../../src/api/AudioContext");

describe("StereoPannerNode", () => {
  it("mono", () => {
    const audioContext = new AudioContext({ sampleRate: 8000, blockSize: 16 });
    const noise0 = np.random_sample(16);
    const buffer = audioContext.createBuffer(1, 16, 8000);
    const bufSrc = audioContext.createBufferSource();
    const panner = audioContext.createStereoPanner();
    const channelData = [ new Float32Array(16), new Float32Array(16) ];

    audioContext.resume();

    buffer.getChannelData(0).set(noise0)

    bufSrc.buffer = buffer;
    bufSrc.loop = true;
    bufSrc.start();
    bufSrc.connect(panner);

    panner.pan.value = 0.5;
    panner.connect(audioContext.destination);

    audioContext._impl.process(channelData, 0);

    // console.log(channelData)

    const actualL = channelData[0];
    const actualR = channelData[1];
    const expectedL = Number.isFinite;
    const expectedR = Number.isFinite;

    assert(actualL.every(expectedL));
    assert(actualR.every(expectedR));
  });

  it("mono with scheduled param", () => {
    const audioContext = new AudioContext({ sampleRate: 8000, blockSize: 16 });
    const noise0 = np.random_sample(16);
    const buffer = audioContext.createBuffer(1, 16, 8000);
    const bufSrc = audioContext.createBufferSource();
    const panner = audioContext.createStereoPanner();
    const channelData = [ new Float32Array(16), new Float32Array(16) ];

    audioContext.resume();

    buffer.getChannelData(0).set(noise0)

    bufSrc.buffer = buffer;
    bufSrc.loop = true;
    bufSrc.start();
    bufSrc.connect(panner);

    panner.pan.setValueAtTime(-0.5, 0);
    panner.pan.linearRampToValueAtTime(+0.5, 16 / 8000);
    panner.connect(audioContext.destination);

    audioContext._impl.process(channelData, 0);

    // console.log(channelData)

    const actualL = channelData[0];
    const actualR = channelData[1];
    const expectedL = Number.isFinite;
    const expectedR = Number.isFinite;

    assert(actualL.every(expectedL));
    assert(actualR.every(expectedR));
  });

  it("stereo", () => {
    const audioContext = new AudioContext({ sampleRate: 8000, blockSize: 16 });
    const noise0 = np.random_sample(16).fill(-0.25);
    const noise1 = np.random_sample(16).fill(0.25);
    const buffer = audioContext.createBuffer(2, 16, 8000);
    const bufSrc = audioContext.createBufferSource();
    const panner = audioContext.createStereoPanner();
    const channelData = [ new Float32Array(16), new Float32Array(16) ];

    audioContext.resume();

    buffer.getChannelData(0).set(noise0)
    buffer.getChannelData(1).set(noise1)

    bufSrc.buffer = buffer;
    bufSrc.loop = true;
    bufSrc.start();
    bufSrc.connect(panner);

    panner.pan.value = 0.5;
    panner.connect(audioContext.destination);

    audioContext._impl.process(channelData, 0);

    // console.log(channelData)

    const actualL = channelData[0];
    const actualR = channelData[1];
    const expectedL = Number.isFinite;
    const expectedR = Number.isFinite;

    assert(actualL.every(expectedL));
    assert(actualR.every(expectedR));
  });

  it("stereo with scheduled param", () => {
    const audioContext = new AudioContext({ sampleRate: 8000, blockSize: 16 });
    const noise0 = np.random_sample(16);
    const noise1 = np.random_sample(16);
    const buffer = audioContext.createBuffer(2, 16, 8000);
    const bufSrc = audioContext.createBufferSource();
    const panner = audioContext.createStereoPanner();
    const channelData = [ new Float32Array(16), new Float32Array(16) ];

    audioContext.resume();

    buffer.getChannelData(0).set(noise0);
    buffer.getChannelData(1).set(noise1);

    bufSrc.buffer = buffer;
    bufSrc.loop = true;
    bufSrc.start();
    bufSrc.connect(panner);

    panner.pan.setValueAtTime(-0.5, 0);
    panner.pan.linearRampToValueAtTime(+0.5, 16 / 8000);
    panner.connect(audioContext.destination);

    audioContext._impl.process(channelData, 0);

    // console.log(channelData)

    const actualL = channelData[0];
    const actualR = channelData[1];
    const expectedL = Number.isFinite;
    const expectedR = Number.isFinite;

    assert(actualL.every(expectedL));
    assert(actualR.every(expectedR));
  });
});
