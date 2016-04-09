"use strict";

const fs = require("fs");
const optionator = require("optionator")(require("./package").cliOptions);
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
    numberOfChannels: opts.channels|0,
  }, {
    u8: { bitDepth: 8 },
    s16: { bitDepth: 16 },
    s32: { bitDepth: 32 },
    raw: { float: true }
  }[opts.type]);
}

function createPrintFunc(opts) {
  if (opts.noShowProgress) {
    return () => {};
  }
  return (msg) => {
    process.stderr.write(msg + "\n");
  };
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

  runWithStreamAudioContext(func, opts);
}

function runWithStreamAudioContext(func, opts) {
  const AudioContext = wae.StreamAudioContext;
  const context = new AudioContext(createContextOptions(opts));

  func(context, {
    timerAPI: global,
    print: createPrintFunc(opts)
  });

  context.pipe(process.stdout);
  context.resume();
}

const opts = optionator.parse(process.argv);

if (opts.help) {
  showHelp();
} else if (opts.list) {
  showList();
} else {
  main(opts);
}
