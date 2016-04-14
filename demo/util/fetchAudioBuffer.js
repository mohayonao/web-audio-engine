"use strict";

const fs = require("fs");

function fetchAudioBuffer(context, filename) {
  if (Array.isArray(filename)) {
    return Promise.all(filename.map(filename => fetchAudioBuffer(context, filename)));
  }

  return new Promise((resolve, reject) => {
    fs.readFile(`${ __dirname }/../assets/sound/${ filename }`, (err, data) => {
      context.decodeAudioData(data).then(resolve, reject);
    });
  });
}

module.exports = fetchAudioBuffer;
