module.exports = function(context, util) {
  var sched = new util.WebAudioScheduler({ context: context, timerAPI: global });

  function sample(list) {
    return list[(Math.random() * list.length)|0];
  }

  function mtof(value) {
    return 440 * Math.pow(2, (value - 69) / 12);
  }

  function synth(t0, midi, dur) {
    var filter = context.createBiquadFilter();
    var gain = context.createGain();
    var t1 = t0 + dur;
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

  function compose(e) {
    var t0 = e.playbackTime;
    var midi = sample([ 60, 60, 62, 64, 64, 67, 69 ]);
    var dur = sample([ 2, 4, 8, 16 ]);
    var nextTime = dur * sample([ 0.25, 0.25, 0.5, 0.5, 0.5, 0.5, 1, 1.25 ]);

    synth(t0, midi, dur);

    sched.insert(t0 + nextTime, compose);
  }

  sched.start(compose);
};
