module.exports = function(context, util) {
  var sched = new util.WebAudioScheduler({ context: context, timerAPI: global });

  function sample(list) {
    return list[(Math.random() * list.length)|0];
  }

  function mtof(value) {
    return 440 * Math.pow(2, (value - 69) / 12);
  }

  function synth(t0, midi, dur) {
    var osc1 = context.createOscillator();
    var osc2 = context.createOscillator();
    var gain = context.createGain();
    var t1 = t0 + dur * 0.25;
    var t2 = t1 + dur * 0.75;

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

  function compose(e) {
    var t0 = e.playbackTime;
    var midi = sample([ 72, 72, 74, 76, 76, 79, 81 ]);
    var dur = sample([ 2, 2, 4, 4, 4, 4, 8 ]);
    var nextTime = dur * sample([ 0.125, 0.125, 0.25, 0.25, 0.25, 0.25, 0.5, 0.75 ]);

    synth(t0, midi, dur);

    sched.insert(t0 + nextTime, compose);
  }

  sched.start(compose);
};
