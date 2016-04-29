module.exports = function(context, util) {
  var sched = new util.WebAudioScheduler({ context: context, timerAPI: global });

  function sample(list) {
    return list[(Math.random() * list.length)|0];
  }

  function mtof(value) {
    return 440 * Math.pow(2, (value - 69) / 12);
  }

  function synth(t0, midi, dur, amp, pos) {
    var t1 = t0 + dur;
    var osc = context.createOscillator();
    var pan = context.createStereoPanner();
    var gain = context.createGain();

    osc.frequency.value = mtof(midi);
    osc.start(t0);
    osc.stop(t1);
    osc.connect(pan);

    pan.pan.value = pos;
    pan.connect(gain);

    gain.gain.setValueAtTime(amp, t0);
    gain.gain.linearRampToValueAtTime(0, t1);
    gain.connect(context.destination);
  }

  function compose(e) {
    var t0 = e.playbackTime;
    var midi = 60 + sample([ 1, 2, 2, 2, 3, 4, 4, 5 ]) * 12;
    var dur = sample([ 0.125, 0.125, 0.125, 0.250, 0.250, 0.5 ]);
    var amp = sample([ 0.05, 0.1, 0.2, 0.4 ]);
    var pos = sample([ 0.2, 0.4, 0.6, 0.8, 1.0 ]) * sample([ -1, +1 ]);
    var iterations = sample([ 1, 1, 2, 2, 2, 3, 4, 8 ]);
    var interval = 0.250 / iterations;

    dur = dur / iterations;

    for (var i = 0; i < iterations; i++) {
      synth(t0 + interval * i, midi, dur, amp, pos);
    }

    sched.insert(t0 + 0.125, compose);
  }

  sched.start(compose);
};
