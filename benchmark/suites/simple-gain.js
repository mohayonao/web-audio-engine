module.exports = function(context) {
  var osc = context.createOscillator();
  var amp = context.createGain();

  osc.start(0);
  osc.stop(1);
  osc.connect(amp);

  amp.gain.setValueAtTime(1, 0);
  amp.gain.linearRampToValueAtTime(0, 1);
  amp.connect(context.destination);
};
