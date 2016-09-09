module.exports = function(context) {
  // +---------------+   +---------------+
  // | oscillator1   |   | oscillator2   |
  // +---------------+   +---------------+
  //         |                   |
  //         |           +---------------+
  //         |           | gain2         |
  //         |           +---------------+
  //         |                   |
  // +---------------+           |
  // | biquadFilter  |           |
  // | * frequency <-------------+
  // +---------------+
  //         |
  // +---------------+
  // | gain1         |
  // +---------------+
  var oscillator1 = context.createOscillator();
  var biquadFilter = context.createBiquadFilter();
  var gain1 = context.createGain();
  var oscillator2 = context.createOscillator();
  var gain2 = context.createGain();

  oscillator1.type = "sawtooth";
  oscillator1.frequency.value = 880;
  oscillator1.start();
  oscillator1.connect(biquadFilter);

  biquadFilter.type = "lowpass";
  biquadFilter.frequency.value = 1000;
  biquadFilter.connect(gain1);

  gain1.gain.value = 0.25;
  gain1.connect(context.destination);

  oscillator2.type = "sine";
  oscillator2.frequency.value = 4;
  oscillator2.start();
  oscillator2.connect(gain2);

  gain2.gain.value = 400;
  gain2.connect(biquadFilter.frequency);
};
