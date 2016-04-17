module.exports = function(context, util) {
  function sample(list) {
    return list[(Math.random() * list.length)|0];
  }

  function mtof(value) {
    return 440 * Math.pow(2, (value - 69) / 12);
  }

  function synth(midi, duration) {
    var filter = context.createBiquadFilter();
    var gain = context.createGain();
    var t0 = context.currentTime;
    var t1 = t0 + duration;
    var freq = mtof(midi);

    [ 1, 3/2, 15/8 ].forEach(function(ratio, index) {
      [ -12, +12 ].forEach(function(detune) {
        var osc = context.createOscillator();

        osc.type = "sawtooth";
        osc.frequency.value = freq * ratio;
        osc.detune.value = detune;
        osc.start(t0);
        osc.stop(t1);
        osc.connect(filter);
      });
    });

    var cutoff1 = freq * sample([ 0.25, 0.5, 1, 2, 2, 4, 4, 4, 6, 6, 8 ]);
    var cutoff2 = freq * sample([ 0.25, 0.5, 1, 2, 2, 4, 4, 4, 6, 6, 8 ]);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(cutoff1, t0);
    filter.frequency.exponentialRampToValueAtTime(cutoff2, t1);
    filter.Q.value = 4;
    filter.connect(gain);

    gain.gain.setValueAtTime(0.1, t0);
    gain.gain.linearRampToValueAtTime(0, t1);
    gain.connect(context.destination);
  }

  function compose() {
    var midi = sample([ 60, 60, 62, 64, 64, 67, 69 ]);
    var duration = sample([ 2, 4, 8, 16 ]);
    var nextTime = (duration * 1000) * Math.random();

    synth(midi, duration);

    setTimeout(compose, nextTime);
  }

  compose();
};
