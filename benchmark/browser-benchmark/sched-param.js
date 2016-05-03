module.exports = function(context) {
  var osc = context.createOscillator();

  for (var i = 0; i < 1000; i++) {
    osc.detune.setValueAtTime(i / 2000, i / 1000);
  }

  osc.start(0.25);
  osc.stop(0.75);
  osc.connect(context.destination);
};
