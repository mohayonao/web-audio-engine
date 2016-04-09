module.exports = function(context, util) {
  function sample(list) {
    return list[(Math.random() * list.length)|0];
  }

  function mtof(value) {
    return 440 * Math.pow(2, (value - 69) / 12);
  }

  function synth(midi, duration) {
    var osc1 = context.createOscillator();
    var osc2 = context.createOscillator();
    var gain = context.createGain();
    var t0 = context.currentTime;
    var t1 = t0 + duration * 0.25;
    var t2 = t1 + duration * 0.75;

    osc1.frequency.value = mtof(midi);
    osc1.detune.setValueAtTime(+4, t0);
    osc1.detune.linearRampToValueAtTime(+12, t2);
    osc1.start(t0);
    osc1.stop(t2);
    osc1.connect(gain);

    osc2.frequency.value = mtof(midi);
    osc2.detune.setValueAtTime(-4, t0);
    osc2.detune.linearRampToValueAtTime(-12, t2);
    osc2.start(t0);
    osc2.stop(t2);
    osc2.connect(gain);

    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(0.125, t1);
    gain.gain.linearRampToValueAtTime(0, t2);
    gain.connect(context.destination);
  }

  var counter = 0;

  function compose() {
    var midi = sample([ 72, 72, 74, 76, 76, 79, 81 ]);
    var duration = sample([ 2, 2, 4, 4, 4, 4, 8 ]);
    var nextTime = (duration * 1000) * Math.random();

    synth(midi, duration);

    util.print("counter: " + (counter++) + "; fanOut: " + context.destination._impl.getInput(0).getNumberOfFanOuts());

    util.timerAPI.setTimeout(compose, nextTime);
  }

  compose();
};
