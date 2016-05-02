"use strict";

const fs = require("fs");
const wae = require("../");
const waeCLI = require("wae-cli");
const WebAudioScheduler = require("web-audio-scheduler");
const optionator = require("optionator")(require("./package").cliOptions);

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

function opts2argv(argv, opts) {
  argv = argv.slice(0, 2);

  Object.keys(opts).forEach((key) => {
    if (key !== "_") {
      if (typeof opts[key] !== "boolean") {
        argv.push("--" + key, "" + opts[key]);
      } else if (opts[key]) {
        argv.push("--" + key);
      }
    }
  });

  if (opts._.length) {
    argv.push(`${ __dirname }/sources/${ opts._[0] }.js`);
  }

  return argv;
}

function fetchAudioBuffer(context, filename) {
  if (Array.isArray(filename)) {
    return Promise.all(filename.map(filename => fetchAudioBuffer(context, filename)));
  }

  return new Promise((resolve, reject) => {
    fs.readFile(`${ __dirname }/assets/sound/${ filename }`, (err, data) => {
      context.decodeAudioData(data).then(resolve, reject);
    });
  });
}

function main(argv) {
  const opts = optionator.parse(process.argv);

  if (opts.help) {
    return showHelp();
  }

  if (opts.list) {
    return showList();
  }

  let sandbox = null;

  const util = {
    WebAudioScheduler: WebAudioScheduler,
    fetchAudioBuffer(filename) {
      return Promise.resolve().then(() => {
        return fetchAudioBuffer(sandbox.audioContext, filename);
      });
    },
    exit() { sandbox.process.exit(); }
  };

  argv = opts2argv(argv, opts);
  sandbox = waeCLI.run(wae, argv, util);
}

main(process.argv);
