module.exports = function(context, util) {
  return util.fetchAudioBuffer("amen.wav").then(function(instruments) {
    var bufSrc = context.createBufferSource();

    bufSrc.buffer = instruments;
    bufSrc.loop = true;
    bufSrc.loopStart = 0.2;
    bufSrc.loopEnd = 0.4;
    bufSrc.start(0, 0);
    bufSrc.connect(context.destination);
  });
};
