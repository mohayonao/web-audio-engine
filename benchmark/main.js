"use strict";

const fs = require("fs");
const vm = require("vm");
const readline = require("readline");

const files = fs.readdirSync(`${ __dirname }/suites`)
  .filter(filename => /\.js$/.test(filename))
  .sort();

function showList() {
  files.forEach((filename, index) => {
    console.log(`[${ index }] ${ filename.replace(/\.js$/, "") }`)
  });
}

function chooseBenchmark(callback) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  showList();

  rl.question("choose benchmark? ", (indices) => {
    run(indices);
    rl.close();
  });
}

function run(indices) {
  const names = Array.prototype.concat.apply([], indices.split(/\s+/g).map(collectBenchmark));

  return names.reduce((promise, name) => {
    return promise.then(() => {
      const func = require(`${ __dirname }/suites/${ name }`);

      console.log("-- " + name + " " + "-".repeat(Math.max(0, 71 - (name.length))));

      return new Promise((resolve) => { func(resolve); });
    });
  }, Promise.resolve());
}

function collectBenchmark(index) {
  if (/^\d+$/.test(index)) {
    return [ files[index] ];
  }
  return files.filter(name => name.indexOf(index) !== -1);
}

if (process.argv[2]) {
  run(process.argv.slice(2).join(" "));
} else {
  chooseBenchmark();
}
