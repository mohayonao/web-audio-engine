module.exports = function(context) {
  var osc = context.createOscillator();

  osc.type = "sawtooth";
  osc.start(0.25);
  osc.stop(0.75);
  osc.connect(context.destination);
};
