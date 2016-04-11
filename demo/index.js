"use strict";

const fs = require("fs");
const optionator = require("optionator")(require("./package").cliOptions);
const tickable = require("tickable-timer");
const wae = require("../src");

function requireSourceIfExists(filepath) {
  try {
    return require(`${ __dirname }/sources/${ filepath }.js`);
  } catch (e) {
    return null;
  }
}

function createContextOptions(opts) {
  return Object.assign({
    sampleRate: +opts.rate,
    numberOfChannels: Math.max(1, opts.channels|0),
  }, {
    u8: { bitDepth: 8 },
    s16: { bitDepth: 16 },
    s32: { bitDepth: 32 },
    raw: { float: true }
  }[opts.type]);
}

function createPrintFunc(opts) {
  if (opts.verbose) {
    return (msg) => {
      process.stderr.write(msg + "\n");
    };
  }
  return () => {};
}

function fetchAudioBuffer(context, filename) {
  if (Array.isArray(filename)) {
    return Promise.all(filename.map(filename => fetchAudioBuffer(context, filename)));
  }

  return new Promise((resolve, reject) => {
    fs.readFile(`${ __dirname }/assets/sound/${ filename }`, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(context.decodeAudioData(data));
    });
  });
}

function showHelp() {
  console.log(optionator.generateHelp());
}

function showList() {
  fs.readdir(`${ __dirname }/sources`, (err, files) => {
    if (err) {
      return;
    }
    files = files.filter(filename => /\.js$/.test(filename));

    files.forEach((filename) => {
      console.log(filename.replace(/\.js$/, ""));
    });
  });
}

function main(opts) {
  const name = opts._.shift();
  const func = requireSourceIfExists(name);

  if (typeof func !== "function") {
    return console.log(`demo: ${ name } is not found`);
  }

  if (opts.out) {
    runWithRenderingAudioContext(func, opts);
  } else {
    runWithStreamAudioContext(func, opts);
  }
}

function runWithRenderingAudioContext(func, opts) {
  const AudioContext = wae.RenderingAudioContext;
  const context = new AudioContext(createContextOptions(opts));

  let isEnded = false;

  const util = {
    fetchAudioBuffer: fetchAudioBuffer.bind(null, context),
    timerAPI: tickable,
    print: createPrintFunc(opts),
    end: () => { isEnded = true }
  };

  const promise = func(context, util) || Promise.resolve();

  promise.then(() => {
    let currentTime = 0;
    let counter = 0;

    const beginTime = Date.now();
    const duration = Math.max(0, opts.duration) || 10;
    const numberOfProcessing = Math.ceil((duration * context.sampleRate) / context.processingSizeInFrames);
    const processingTimeInFrames = context.processingSizeInFrames / context.sampleRate;

    for (let i = 0; i < numberOfProcessing && !isEnded; i++) {
      tickable.tick(processingTimeInFrames * 1000);
      context.processTo(processingTimeInFrames * i);
    }

    const endTime = Date.now();
    const outputFilename = opts.out || "out.wav";
    const audioData = context.exportAsAudioData();

    context.encodeAudioData(audioData).then((arrayBuffer) => {
      fs.writeFile(outputFilename, new Buffer(arrayBuffer), (err) => {
        if (err) {
          console.error(err);
        } else {
          const renderingTime = (endTime - beginTime) / 1000;
          const duration = context.currentTime;

          console.log(`rendering time: ${ renderingTime }sec; duration: ${ duration }sec`);
        }
      });
    });
  });
}

function runWithStreamAudioContext(func, opts) {
  const AudioContext = wae.StreamAudioContext;
  const context = new AudioContext(createContextOptions(opts));
  const util = {
    fetchAudioBuffer: fetchAudioBuffer.bind(null, context),
    timerAPI: global,
    print: createPrintFunc(opts),
    end: () => { process.exit(0) }
  };

  context.pipe(process.stdout);

  const promise = func(context, util) || Promise.resolve();

  promise.then(() => {
    context.resume();
  });
}

const opts = optionator.parse(process.argv);

if (opts.help) {
  showHelp();
} else if (opts.list) {
  showList();
} else {
  main(opts);
}
