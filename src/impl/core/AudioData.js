"use strict";

class AudioData {
  constructor(numberOfChannels, length, sampleRate) {
    this.numberOfChannels = numberOfChannels|0;
    this.length = length|0;
    this.sampleRate = sampleRate|0;
    this.channelData = new Array(this.numberOfChannels).fill().map(() => {
      return new Float32Array(this.length).fill(0);
    });
  }
}

module.exports = AudioData;
