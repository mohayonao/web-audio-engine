module.exports = function(context, util) {
  return util.fetchAudioBuffer("a11wlk01.wav").then(function(instruments) {
    var bufSrc = context.createBufferSource();
    var delay = context.createDelay();
    var lfo1 = context.createOscillator();
    var lfo2 = context.createGain();
    var amp1 = context.createGain();
    var amp2 = context.createGain();

    bufSrc.buffer = instruments;
    bufSrc.loop = true;
    bufSrc.start(context.currentTime);
    bufSrc.connect(amp1);
    bufSrc.connect(delay);

    lfo1.frequency.value = 0.125;
    lfo1.start(context.currentTime);
    lfo1.connect(lfo2);

    lfo2.gain.value = 0.015;
    lfo2.connect(delay.delayTime);

    delay.delayTime.value = 0.03;
    delay.connect(amp2);

    amp1.gain.value = 0.6;
    amp1.connect(context.destination);

    amp2.gain.value = 0.4;
    amp2.connect(context.destination);
  });
};
