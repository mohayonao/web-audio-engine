module.exports = function(context) {
  var osc = context.createOscillator();

  for (var i = 0; i < 1200; i++) {
    osc.detune.setValueAtTime(i, i / 1200);
  }

  osc.start(0.25);
  osc.stop(0.75);
  osc.connect(context.destination);
};
