"use strict";

const fs = require("fs");
const optionator = require("optionator")(require("./package").cliOptions);
const runBenchmark = require("./runner/runBenchmark");

function requireSourceIfExists(filepath) {
  try {
    return require(`${ __dirname }/suites/${ filepath }.js`);
  } catch (e) {
    return null;
  }
}

function showHelp() {
  console.log(optionator.generateHelp());
}

function showList() {
  fs.readdir(`${ __dirname }/suites`, (err, files) => {
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
    return console.log(`suite: ${ name } is not found`);
  }

  runBenchmark(func, opts.target);
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
