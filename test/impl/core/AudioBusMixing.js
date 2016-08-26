"use strict";

require("run-with-mocha");

const assert = require("assert");
const np = require("../../helpers/np");
const AudioBus = require("../../../src/impl/core/AudioBus");

describe("impl/core/AudioBus - mixing", () => {
  function mixBy() {
    const args = Array.from(arguments);
    const func = args.pop();
    const numberOfChannels = func().length;
    const length = args[0][0].length;
    const result = new Array(numberOfChannels).fill().map(() => new Float32Array(length));

    for (let i = 0; i < args.length; i++) {
      const channelData = args[i];

      for (let j = 0; j < length; j++) {
        const values = new Array(channelData.length).fill().map((_, ch) => channelData[ch][j]);

        func.apply(null, values).forEach((value, ch) => {
          result[ch][j] += value;
        });
      }
    }

    return result;
  }

  it("sum from the silent input", () => {
    const bus1 = new AudioBus(1, 128, 44100);
    const bus2 = new AudioBus(1, 128, 44100);
    const bus3 = new AudioBus(1, 128, 44100);

    bus3.setChannelInterpretation("speakers");
    bus3.sumFrom(bus1);

    bus3.zeros();

    assert.deepEqual(bus3.getChannelData()[0], np.zeros(128));
    assert(bus3.isSilent === true);

    bus3.sumFrom(bus2);

    assert.deepEqual(bus3.getChannelData()[0], np.zeros(128));
    assert(bus3.isSilent === true);
  });

  it("1->2 - discrete", () => {
    const mixer = (M) => [ M, 0 ];
    const bus1 = new AudioBus(1, 128, 44100);
    const bus2 = new AudioBus(1, 128, 44100);
    const bus3 = new AudioBus(2, 128, 44100);

    bus1.getMutableData()[0].set(np.random_sample(128));
    bus2.getMutableData()[0].set(np.random_sample(128));
    bus3.setChannelInterpretation("discrete");
    bus3.zeros();

    bus3.sumFrom(bus1);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);

    bus3.sumFrom(bus2);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), bus2.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);
  });

  it("2->1 - discrete", () => {
    const mixer = (L) => [ L ];
    const bus1 = new AudioBus(2, 128, 44100);
    const bus2 = new AudioBus(2, 128, 44100);
    const bus3 = new AudioBus(1, 128, 44100);

    bus1.getMutableData()[0].set(np.random_sample(128));
    bus1.getMutableData()[1].set(np.random_sample(128));
    bus2.getMutableData()[0].set(np.random_sample(128));
    bus2.getMutableData()[1].set(np.random_sample(128));
    bus3.setChannelInterpretation("discrete");
    bus3.zeros();

    bus3.sumFrom(bus1);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);

    bus3.sumFrom(bus2);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), bus2.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);
  });

  it("1->1 - speaker", () => {
    const mixer = (M) => [ M ];
    const bus1 = new AudioBus(1, 128, 44100);
    const bus2 = new AudioBus(1, 128, 44100);
    const bus3 = new AudioBus(1, 128, 44100);

    bus1.getMutableData()[0].set(np.random_sample(128));
    bus2.getMutableData()[0].set(np.random_sample(128));
    bus3.setChannelInterpretation("speakers");
    bus3.zeros();

    bus3.sumFrom(bus1);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);

    bus3.sumFrom(bus2);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), bus2.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);
  });

  it("1->2 - up-mix from mono to stereo", () => {
    const mixer = (M) => [ M, M ];
    const bus1 = new AudioBus(1, 128, 44100);
    const bus2 = new AudioBus(1, 128, 44100);
    const bus3 = new AudioBus(2, 128, 44100);

    bus1.getMutableData()[0].set(np.random_sample(128));
    bus2.getMutableData()[0].set(np.random_sample(128));
    bus3.setChannelInterpretation("speakers");
    bus3.zeros();

    bus3.sumFrom(bus1);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);

    bus3.sumFrom(bus2);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), bus2.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);
  });

  it("1->4 - up-mix from mono to quad", () => {
    const mixer = (M) => [ M, M, 0, 0 ];
    const bus1 = new AudioBus(1, 128, 44100);
    const bus2 = new AudioBus(1, 128, 44100);
    const bus3 = new AudioBus(4, 128, 44100);

    bus1.getMutableData()[0].set(np.random_sample(128));
    bus2.getMutableData()[0].set(np.random_sample(128));
    bus3.setChannelInterpretation("speakers");
    bus3.zeros();

    bus3.sumFrom(bus1);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);

    bus3.sumFrom(bus2);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), bus2.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);
  });

  it("1->5.1 - up-mix from mono to 5.1", () => {
    const mixer = (M) => [ 0, 0, M, 0, 0, 0 ];
    const bus1 = new AudioBus(1, 128, 44100);
    const bus2 = new AudioBus(1, 128, 44100);
    const bus3 = new AudioBus(6, 128, 44100);

    bus1.getMutableData()[0].set(np.random_sample(128));
    bus2.getMutableData()[0].set(np.random_sample(128));
    bus3.setChannelInterpretation("speakers");
    bus3.zeros();

    bus3.sumFrom(bus1);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);

    bus3.sumFrom(bus2);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), bus2.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);
  });

  it("2->2", () => {
    const mixer = (L, R) => [ L, R ];
    const bus1 = new AudioBus(2, 128, 44100);
    const bus2 = new AudioBus(2, 128, 44100);
    const bus3 = new AudioBus(2, 128, 44100);

    bus1.getMutableData()[0].set(np.random_sample(128));
    bus1.getMutableData()[1].set(np.random_sample(128));
    bus2.getMutableData()[0].set(np.random_sample(128));
    bus2.getMutableData()[1].set(np.random_sample(128));
    bus3.setChannelInterpretation("speakers");
    bus3.zeros();

    bus3.sumFrom(bus1);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);

    bus3.sumFrom(bus2);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), bus2.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);
  });

  it("2->4 - up-mix from stereo to quad", () => {
    const mixer = (L, R) => [ L, R, 0, 0 ];
    const bus1 = new AudioBus(2, 128, 44100);
    const bus2 = new AudioBus(2, 128, 44100);
    const bus3 = new AudioBus(4, 128, 44100);

    bus1.getMutableData()[0].set(np.random_sample(128));
    bus1.getMutableData()[1].set(np.random_sample(128));
    bus2.getMutableData()[0].set(np.random_sample(128));
    bus2.getMutableData()[1].set(np.random_sample(128));
    bus3.setChannelInterpretation("speakers");
    bus3.zeros();

    bus3.sumFrom(bus1);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);

    bus3.sumFrom(bus2);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), bus2.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);
  });

  it("2->5.1 - up-mix from stereo to 5.1", () => {
    const mixer = (L, R) => [ L, R, 0, 0, 0, 0 ];
    const bus1 = new AudioBus(2, 128, 44100);
    const bus2 = new AudioBus(2, 128, 44100);
    const bus3 = new AudioBus(6, 128, 44100);

    bus1.getMutableData()[0].set(np.random_sample(128));
    bus1.getMutableData()[1].set(np.random_sample(128));
    bus2.getMutableData()[0].set(np.random_sample(128));
    bus2.getMutableData()[1].set(np.random_sample(128));
    bus3.setChannelInterpretation("speakers");
    bus3.zeros();

    bus3.sumFrom(bus1);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);

    bus3.sumFrom(bus2);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), bus2.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);
  });

  it("sum from : 4 -> 4", () => {
    const mixer = (L, R, LR, SR) => [ L, R, LR, SR ];
    const bus1 = new AudioBus(4, 128, 44100);
    const bus2 = new AudioBus(4, 128, 44100);
    const bus3 = new AudioBus(4, 128, 44100);

    bus1.getMutableData()[0].set(np.random_sample(128));
    bus1.getMutableData()[1].set(np.random_sample(128));
    bus1.getMutableData()[2].set(np.random_sample(128));
    bus1.getMutableData()[3].set(np.random_sample(128));
    bus2.getMutableData()[0].set(np.random_sample(128));
    bus2.getMutableData()[1].set(np.random_sample(128));
    bus2.getMutableData()[2].set(np.random_sample(128));
    bus2.getMutableData()[3].set(np.random_sample(128));
    bus3.setChannelInterpretation("speakers");
    bus3.zeros();

    bus3.sumFrom(bus1);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);

    bus3.sumFrom(bus2);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), bus2.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);
  });

  it("4->5.1 - up-mix from quad to 5.1", () => {
    const mixer = (L, R, SL, SR) => [ L, R, 0, 0, SL, SR ];
    const bus1 = new AudioBus(4, 128, 44100);
    const bus2 = new AudioBus(4, 128, 44100);
    const bus3 = new AudioBus(6, 128, 44100);

    bus1.getMutableData()[0].set(np.random_sample(128));
    bus1.getMutableData()[1].set(np.random_sample(128));
    bus1.getMutableData()[2].set(np.random_sample(128));
    bus1.getMutableData()[3].set(np.random_sample(128));
    bus2.getMutableData()[0].set(np.random_sample(128));
    bus2.getMutableData()[1].set(np.random_sample(128));
    bus2.getMutableData()[2].set(np.random_sample(128));
    bus2.getMutableData()[3].set(np.random_sample(128));
    bus3.setChannelInterpretation("speakers");
    bus3.zeros();

    bus3.sumFrom(bus1);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);

    bus3.sumFrom(bus2);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), bus2.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);
  });

  it("2->1 - stereo to mono", () => {
    const mixer = (L, R) => [ 0.5 * (L + R) ];
    const bus1 = new AudioBus(2, 128, 44100);
    const bus2 = new AudioBus(2, 128, 44100);
    const bus3 = new AudioBus(1, 128, 44100);

    bus1.getMutableData()[0].set(np.random_sample(128));
    bus1.getMutableData()[1].set(np.random_sample(128));
    bus2.getMutableData()[0].set(np.random_sample(128));
    bus2.getMutableData()[1].set(np.random_sample(128));
    bus3.setChannelInterpretation("speakers");
    bus3.zeros();

    bus3.sumFrom(bus1);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);

    bus3.sumFrom(bus2);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), bus2.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);
  });

  it("4->1 - quad to mono", () => {
    const mixer = (L, R, SL, SR) => [ 0.25 * (L + R + SL + SR) ];
    const bus1 = new AudioBus(4, 128, 44100);
    const bus2 = new AudioBus(4, 128, 44100);
    const bus3 = new AudioBus(1, 128, 44100);

    bus1.getMutableData()[0].set(np.random_sample(128));
    bus1.getMutableData()[1].set(np.random_sample(128));
    bus1.getMutableData()[2].set(np.random_sample(128));
    bus1.getMutableData()[3].set(np.random_sample(128));
    bus2.getMutableData()[0].set(np.random_sample(128));
    bus2.getMutableData()[1].set(np.random_sample(128));
    bus2.getMutableData()[2].set(np.random_sample(128));
    bus2.getMutableData()[3].set(np.random_sample(128));
    bus3.setChannelInterpretation("speakers");
    bus3.zeros();

    bus3.sumFrom(bus1);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);

    bus3.sumFrom(bus2);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), bus2.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);
  });

  it("5.1->1 - 5.1 to mono", () => {
    const mixer = (L, R, C, LFE, SL, SR) => [ 0.7071 * (L + R) + C + 0.5 * (SL + SR) ];
    const bus1 = new AudioBus(6, 128, 44100);
    const bus2 = new AudioBus(6, 128, 44100);
    const bus3 = new AudioBus(1, 128, 44100);

    bus1.getMutableData()[0].set(np.random_sample(128));
    bus1.getMutableData()[1].set(np.random_sample(128));
    bus1.getMutableData()[2].set(np.random_sample(128));
    bus1.getMutableData()[3].set(np.random_sample(128));
    bus1.getMutableData()[4].set(np.random_sample(128));
    bus1.getMutableData()[5].set(np.random_sample(128));
    bus2.getMutableData()[0].set(np.random_sample(128));
    bus2.getMutableData()[1].set(np.random_sample(128));
    bus2.getMutableData()[2].set(np.random_sample(128));
    bus2.getMutableData()[3].set(np.random_sample(128));
    bus2.getMutableData()[4].set(np.random_sample(128));
    bus2.getMutableData()[5].set(np.random_sample(128));
    bus3.setChannelInterpretation("speakers");
    bus3.zeros();

    bus3.sumFrom(bus1);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);

    bus3.sumFrom(bus2);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), bus2.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);
  });

  it("4->2 - quad to stereo", () => {
    const mixer = (L, R, SL, SR) => [ 0.5 * (L + SL), 0.5 * (R + SR) ];
    const bus1 = new AudioBus(4, 128, 44100);
    const bus2 = new AudioBus(4, 128, 44100);
    const bus3 = new AudioBus(2, 128, 44100);

    bus1.getMutableData()[0].set(np.random_sample(128));
    bus1.getMutableData()[1].set(np.random_sample(128));
    bus1.getMutableData()[2].set(np.random_sample(128));
    bus1.getMutableData()[3].set(np.random_sample(128));
    bus2.getMutableData()[0].set(np.random_sample(128));
    bus2.getMutableData()[1].set(np.random_sample(128));
    bus2.getMutableData()[2].set(np.random_sample(128));
    bus2.getMutableData()[3].set(np.random_sample(128));
    bus3.setChannelInterpretation("speakers");
    bus3.zeros();

    bus3.sumFrom(bus1);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);

    bus3.sumFrom(bus2);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), bus2.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);
  });

  it("5.1->2 - 5.1 to stereo", () => {
    const mixer = (L, R, C, LFE, SL, SR) => [ L + 0.7071 * (C + SL), R + 0.7071 * (C + SR) ];
    const bus1 = new AudioBus(6, 128, 44100);
    const bus2 = new AudioBus(6, 128, 44100);
    const bus3 = new AudioBus(2, 128, 44100);

    bus1.getMutableData()[0].set(np.random_sample(128));
    bus1.getMutableData()[1].set(np.random_sample(128));
    bus1.getMutableData()[2].set(np.random_sample(128));
    bus1.getMutableData()[3].set(np.random_sample(128));
    bus1.getMutableData()[4].set(np.random_sample(128));
    bus1.getMutableData()[5].set(np.random_sample(128));
    bus2.getMutableData()[0].set(np.random_sample(128));
    bus2.getMutableData()[1].set(np.random_sample(128));
    bus2.getMutableData()[2].set(np.random_sample(128));
    bus2.getMutableData()[3].set(np.random_sample(128));
    bus2.getMutableData()[4].set(np.random_sample(128));
    bus2.getMutableData()[5].set(np.random_sample(128));
    bus3.setChannelInterpretation("speakers");
    bus3.zeros();

    bus3.sumFrom(bus1);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);

    bus3.sumFrom(bus2);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), bus2.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);
  });

  it("5.1->4 - 5.1 to quad", () => {
    const mixer = (L, R, C, LFE, SL, SR) => [ L + 0.7071 * C, R + 0.7071 * C, SL, SR ];
    const bus1 = new AudioBus(6, 128, 44100);
    const bus2 = new AudioBus(6, 128, 44100);
    const bus3 = new AudioBus(4, 128, 44100);

    bus1.getMutableData()[0].set(np.random_sample(128));
    bus1.getMutableData()[1].set(np.random_sample(128));
    bus1.getMutableData()[2].set(np.random_sample(128));
    bus1.getMutableData()[3].set(np.random_sample(128));
    bus1.getMutableData()[4].set(np.random_sample(128));
    bus1.getMutableData()[5].set(np.random_sample(128));
    bus2.getMutableData()[0].set(np.random_sample(128));
    bus2.getMutableData()[1].set(np.random_sample(128));
    bus2.getMutableData()[2].set(np.random_sample(128));
    bus2.getMutableData()[3].set(np.random_sample(128));
    bus2.getMutableData()[4].set(np.random_sample(128));
    bus2.getMutableData()[5].set(np.random_sample(128));
    bus3.setChannelInterpretation("speakers");
    bus3.zeros();

    bus3.sumFrom(bus1);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);

    bus3.sumFrom(bus2);

    assert.deepEqual(
      bus3.getChannelData(),
      mixBy(bus1.getChannelData(), bus2.getChannelData(), mixer)
    );
    assert(bus3.isSilent === false);
  });

  it("with the offset", () => {
    const mixer = (L, R) => [ 0.5 * (L + R) ];
    const bus1 = new AudioBus(2, 128, 44100);
    const bus2 = new AudioBus(2, 128, 44100);
    const bus3 = new AudioBus(2, 128, 44100);
    const bus4 = new AudioBus(2, 128, 44100);
    const bus5 = new AudioBus(1, 256, 44100);

    bus1.getMutableData()[0].set(np.random_sample(128));
    bus1.getMutableData()[1].set(np.random_sample(128));
    bus2.getMutableData()[0].set(np.random_sample(128));
    bus2.getMutableData()[1].set(np.random_sample(128));
    bus3.getMutableData()[0].set(np.random_sample(128));
    bus3.getMutableData()[1].set(np.random_sample(128));
    bus4.getMutableData()[0].set(np.random_sample(128));
    bus4.getMutableData()[1].set(np.random_sample(128));
    bus5.setChannelInterpretation("speakers");
    bus5.zeros();

    bus5.sumFromWithOffset(bus1, 0);
    bus5.sumFromWithOffset(bus2, 128);

    assert.deepEqual(
      bus5.getChannelData().map(data => data.subarray(0, 128)),
      mixBy(bus1.getChannelData(), mixer)
    );
    assert(bus5.isSilent === false);

    assert.deepEqual(
      bus5.getChannelData().map(data => data.subarray(128, 256)),
      mixBy(bus2.getChannelData(), mixer)
    );
    assert(bus5.isSilent === false);

    bus5.sumFromWithOffset(bus3, 0);
    bus5.sumFromWithOffset(bus4, 128);

    assert.deepEqual(
      bus5.getChannelData().map(data => data.subarray(0, 128)),
      mixBy(bus1.getChannelData(), bus3.getChannelData(), mixer)
    );
    assert(bus5.isSilent === false);

    assert.deepEqual(
      bus5.getChannelData().map(data => data.subarray(128, 256)),
      mixBy(bus2.getChannelData(), bus4.getChannelData(), mixer)
    );
    assert(bus5.isSilent === false);
  });
});
