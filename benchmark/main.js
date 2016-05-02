"use strict";

const fs = require("fs");
const vm = require("vm");
const readline = require("readline");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const files = fs.readdirSync(`${ __dirname }/suites`)
  .filter(filename => /\.js$/.test(filename))
  .sort();

function showList() {
  files.forEach((filename, index) => {
    console.log(`[${ index }] ${ filename.replace(/\.js$/, "") }`)
  });
}

function chooseBenchmark(callback) {
  showList();
  rl.question("choose benchmark? ", (answer) => {
    console.log("----------------------------------------");
    run(answer|0);
  });
}

function run(index) {
  if (!files[index]) {
    chooseBenchmark();
  } else {
    console.log(files[index]);
    require(`${ __dirname }/suites/${ files[index] }`);
    rl.close();
  }
}

if (process.argv[2]) {
  run(process.argv[2]|0)
} else {
  chooseBenchmark();
}
