# web-audio-engine
[![Build Status](http://img.shields.io/travis/mohayonao/web-audio-engine.svg?style=flat-square)](https://travis-ci.org/mohayonao/web-audio-engine)
[![NPM Version](http://img.shields.io/npm/v/web-audio-engine.svg?style=flat-square)](https://www.npmjs.org/package/web-audio-engine)
[![License](http://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://mohayonao.mit-license.org/)

This library implements the [Web Audio API](https://www.w3.org/TR/webaudio/) specification on Pure JavaScript.

## Implemented API

- `OscillatorNode (sine only)`
- `GainNode`

## Installation

```
npm install --save web-audio-engine
```

## API

### StreamAudioContext

StreamAudioContext writes raw PCM audio to the node stream. It can be used to play back sound using unix piping like as [`ALSA aplay`](http://alsa.opensrc.org/Aplay) or [`SoX play`](http://sox.sourceforge.net/) command.

#### Constructor
- `StreamAudioContext(opts: object)`
  - `opts.sampleRate: number` ( default: _44100_ )
  - `opts.numberOfChannels: number` ( default: _2_ )
  - `opts.blockSize: number` ( default: _1024_ )
  - `opts.bitDepth: number` ( default: _16_ )
  - `opts.float: boolean` ( default: _false_ )

#### Instance methods
- `pipe(stream: WritableStream): WritableStream`
- `resume(): Promise<void>`
- `suspend(): Promise<void>`

#### Example

```js
const AudioContext = require("web-audio-engine").StreamAudioContext;

const context = new AudioContext({ sampleRate: 48000 });

context.pipe(process.stdout);

// .. make sounds ..

// start rendering
context.resume();
```

## Demo

```
$ cd demo
$ npm install .
$ node . --help
```

Play simple demo with SoX play command.

```
$ node . sines | play -t s16 -r 44100 -c 2 -q -
```

## License

MIT
