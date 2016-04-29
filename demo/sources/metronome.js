module.exports = function(context, util) {
  var sched = new util.WebAudioScheduler({ context: context, timerAPI: global });

  function metronome(e) {
    var t0 = e.playbackTime;

    sched.insert(t0 + 0.000, ticktack, { frequency: 880, amp: 1.0, duration: 1.00 });
    sched.insert(t0 + 0.500, ticktack, { frequency: 440, amp: 0.4, duration: 0.25 });
    sched.insert(t0 + 1.000, ticktack, { frequency: 440, amp: 0.5, duration: 0.25 });
    sched.insert(t0 + 1.500, ticktack, { frequency: 440, amp: 0.4, duration: 0.25 });
    sched.insert(t0 + 2.000, metronome);
  }

  function ticktack(e) {
    var t0 = e.playbackTime;
    var t1 = t0 + e.args.duration;
    var osc = context.createOscillator();
    var amp = context.createGain();

    osc.frequency.value = e.args.frequency;
    osc.start(t0);
    osc.stop(t1);
    osc.connect(amp);

    amp.gain.setValueAtTime(0.5 * e.args.amp, t0);
    amp.gain.exponentialRampToValueAtTime(1e-6, t1);
    amp.connect(context.destination);
  }

  sched.start(metronome);
};
