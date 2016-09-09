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
  // | delay         |           |
  // | * delayTime <-------------+
  // +---------------+
  //         |
  // +---------------+
  // | gain1         |
  // +---------------+
  var oscillator1 = context.createOscillator();
  var delay = context.createDelay();
  var gain1 = context.createGain();
  var oscillator2 = context.createOscillator();
  var gain2 = context.createGain();

  oscillator1.type = "sine";
  oscillator1.frequency.value = 880;
  oscillator1.start();
  oscillator1.connect(delay);

  delay.delayTime.value = 0.5;
  delay.connect(gain1);

  gain1.gain.value = 0.25;
  gain1.connect(context.destination);

  oscillator2.type = "sine";
  oscillator2.frequency.value = 20;
  oscillator2.start();
  oscillator2.connect(gain2);

  gain2.gain.value = 0.005;
  gain2.connect(delay.delayTime);
};
