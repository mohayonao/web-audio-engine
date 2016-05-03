module.exports = function(context) {
  for (var i = 0; i < 500; i++) {
    var osc = context.createOscillator();

    osc.start(i * 0.01);
    osc.stop(i * 0.01 + 0.005);
    osc.connect(context.destination);
  }
};
