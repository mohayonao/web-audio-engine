module.exports = function(context, util) {
  function sample(list) {
    return list[(Math.random() * list.length)|0];
  }

  function mtof(value) {
    return 440 * Math.pow(2, (value - 69) / 12);
  }

  function synth(midi) {
    var osc = context.createOscillator();
    var amp = context.createGain();
    var delay = context.createDelay(0.1);
    var out = context.createGain();
    var t0 = context.currentTime;
    var t1 = t0 + 0.125;

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

  function compose() {
    var midi = sample([ 64, 65, 65, 69, 72, 76 ]) + 12;
    var duration = sample([ 2, 2, 3, 4 ]);
    var feedback = sample([ 0.4, 0.6, 0.8, 0.9, 0.975 ]);
    var nextTime = (duration * 1000) * Math.random();

    efx.feedback.setTargetAtTime(feedback, context.currentTime, 1);

    synth(midi, duration).connect(efx.input);

    setTimeout(compose, nextTime);
  }

  efx.output.connect(context.destination);

  compose();
};
