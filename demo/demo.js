"use strict";

const fs = require("fs");
const optionator = require("optionator")(require("./package").cliOptions);
const runInRenderingAudioContext = require("./runner/runInRenderingAudioContext");
const runInStreamAudioContext = require("./runner/runInStreamAudioContext");

function requireSourceIfExists(filepath) {
  try {
    return require(`${ __dirname }/sources/${ filepath }.js`);
  } catch (e) {
    return null;
  }
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

  const runner = opts.out ? runInRenderingAudioContext : runInStreamAudioContext;

  runner(func, opts).catch((e) => {
    console.error(e);
  });
}

const opts = optionator.parse(process.argv);

switch (true) {
case opts.help:
  showHelp();
  break;
case opts.list:
  showList();
  break;
default:
  main(opts);
}
