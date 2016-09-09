module.exports = function(context, util) {
  return util.fetchAudioBuffer("amen.wav").then(function(instruments) {
    var bufSrc = context.createBufferSource();
    var iir = context.createIIRFilter([ 0.182377, 0, -0.182377 ], [ 1, -1.956784, 0.979231 ]);

    bufSrc.buffer = instruments;
    bufSrc.loop = true;
    bufSrc.start(context.currentTime);
    bufSrc.connect(iir);

    iir.connect(context.destination);
  });
};
