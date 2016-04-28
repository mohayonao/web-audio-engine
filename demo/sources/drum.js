module.exports = function(context, util) {
  var sched = new util.WebAudioScheduler({ context: context, timerAPI: global });

  function sample(list) {
    return list[(Math.random() * list.length)|0];
  }

  function coin(rate) {
    return Math.random() < rate;
  }

  return util.fetchAudioBuffer([ "kick.wav", "snare.wav", "hihat1.wav", "hihat2.wav" ]).then(function(instruments) {
    function shot(e) {
      var inst = instruments[e.args.inst % instruments.length];
      var t0 = e.playbackTime;
      var t1 = t0 + inst.duration * e.args.duration;
      var bufSrc = context.createBufferSource();
      var gain = context.createGain();

      bufSrc.buffer = inst;
      bufSrc.start(t0);
      bufSrc.stop(t1);
      bufSrc.connect(gain);

      gain.gain.setValueAtTime(0.4 * e.args.amp, t0);
      gain.gain.linearRampToValueAtTime(0, t1);
      gain.connect(context.destination);
    }

    function drum(e) {
      var t0;

      for (var i = 0; i < 16; i++) {
        var t0 = e.playbackTime + i * 0.125;

        // kick
        if (i === 0) {
          sched.insert(t0, shot, { inst: 0, amp: 1.0, duration: 1.00 });
        } else if (i % 4 === 0 && coin(0.25)) {
          sched.insert(t0, shot, { inst: 0, amp: 0.8, duration: 0.60 });
        } else if (i % 2 === 0 && coin(0.15)) {
          sched.insert(t0, shot, { inst: 0, amp: 0.6, duration: 0.40 });
        } else if (coin(0.05)) {
          sched.insert(t0, shot, { inst: 0, amp: 0.2, duration: 0.10 });
        }

        // snare
        if (i % 8 === 4 && coin(0.95)) {
          sched.insert(t0, shot, { inst: 1, amp: 1.0, duration: 1.00 });
        } else if (i % 4 === 0 && coin(0.1)) {
          sched.insert(t0, shot, { inst: 1, amp: 0.6, duration: 0.50 });
        } else if (i % 4 === 3 && coin(0.1)) {
          sched.insert(t0, shot, { inst: 1, amp: 0.6, duration: 0.75 });
        } else if (coin(0.1)) {
          sched.insert(t0, shot, { inst: 1, amp: 0.2, duration: 0.10 });
        }

        // hihat
        if (i % 4 === 0) {
          sched.insert(t0, shot, { inst: 2, amp: 0.40, duration: 1.00 });
        } else if (i % 2 === 0 && coin(0.25)) {
          sched.insert(t0, shot, { inst: 3, amp: 0.30, duration: 0.15 });
        } else if (i % 2 === 0 && coin(0.25)) {
          sched.insert(t0, shot, { inst: 3, amp: 0.50, duration: 0.05 });
        } else if (i % 2 === 0 && coin(0.5)) {
          sched.insert(t0, shot, { inst: 2, amp: 0.10, duration: 1.00 });
        } else if (coin(0.25)) {
          sched.insert(t0, shot, { inst: 3, amp: 0.10, duration: 0.10 });
        } else if (coin(0.25)) {
          sched.insert(t0, shot, { inst: 2, amp: 0.20, duration: 0.25 });
        } else if (coin(0.8)) {
          sched.insert(t0, shot, { inst: 2, amp: 0.05, duration: 0.85 });
        }
      }

      sched.insert(e.playbackTime + 2.000, drum);
    }

    sched.start(drum);
  });
};
