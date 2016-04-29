module.exports = function(context, util) {
  var sched = new util.WebAudioScheduler({ context: context, timerAPI: global });

  function sample(list) {
    return list[(Math.random() * list.length)|0];
  }

  function mtof(value) {
    return 440 * Math.pow(2, (value - 69) / 12);
  }

  function synth(t0, midi, dur) {
    var osc = context.createOscillator();
    var amp = context.createGain();
    var delay = context.createDelay(0.1);
    var out = context.createGain();
    var t1 = t0 + dur;

    osc.type = "triangle";
    osc.frequency.value = mtof(midi);
    osc.start(t0);
    osc.stop(t1);
    osc.connect(amp);

    amp.gain.setValueAtTime(0.075, t0);
    amp.gain.linearRampToValueAtTime(0, t1);
    amp.connect(out);
    amp.connect(delay);

    delay.delayTime.value = 0.09375;
    delay.connect(out);

    return out;
  }

  function createFeedbackDelay() {
    var input = context.createGain();
    var delay = context.createDelay();
    var feedback = context.createGain();
    var output = context.createGain();

    input.connect(delay);
    input.connect(output);

    delay.delayTime.value = 0.125;
    delay.connect(feedback);

    feedback.gain.value = 0.925;
    feedback.connect(input);

    return { input: input, output: output, feedback: feedback.gain };
  }

  var efx = createFeedbackDelay();

  function compose(e) {
    var t0 = e.playbackTime;
    var midi = sample([ 64, 65, 65, 65, 69, 69, 72, 76 ]) + 12;
    var dur = sample([ 0.125, 0.25, 0.25, 0.5 ]);
    var feedback = sample([ 0.4, 0.6, 0.8, 0.9, 0.975 ]);
    var nextTime = dur * sample([ 0.5, 1, 1, 1.5, 1.5, 2, 2, 4 ]);

    efx.feedback.setTargetAtTime(feedback, t0, 1);

    synth(t0, midi, dur).connect(efx.input);

    sched.insert(t0 + nextTime, compose);
  }

  efx.output.connect(context.destination);

  sched.start(compose);
};
