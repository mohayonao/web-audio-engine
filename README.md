-----

# STATE: WORK IN PROGRESS

:godmode::godmode::godmode::godmode::godmode::godmode::goberserk::goberserk::goberserk::goberserk: _60%_

-----

# web-audio-engine
[![Build Status](http://img.shields.io/travis/mohayonao/web-audio-engine.svg?style=flat-square)](https://travis-ci.org/mohayonao/web-audio-engine)
[![NPM Version](http://img.shields.io/npm/v/web-audio-engine.svg?style=flat-square)](https://www.npmjs.org/package/web-audio-engine)
[![License](http://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://mohayonao.mit-license.org/)

This library implements the [Web Audio API](https://www.w3.org/TR/webaudio/) specification on Pure JavaScript.

## Implemented API

- `OscillatorNode (wavetable synthesis)`
- `GainNode`
- `BiquadFilterNode`
- `StereoPannerNode`
- `ChannelMergerNode`
- `ChannelSplitterNode`
- `WaveShaperNode`
- `DelayNode (noisy..)`
- `ScriptProcessorNode`
- `AudioBufferSourceNode`
- other nodes behave to bypass input to output

## Installation

```
npm install --save web-audio-engine
```

## API
**web-audio-engine** has some AudioContexts for each use case.

### new StreamAudioContext(opts?: object)

`StreamAudioContext` writes raw [PCM audio](https://en.wikipedia.org/wiki/Pulse-code_modulation) data to the node writable stream. It can be used to play back sound using [`node-speaker`](https://github.com/TooTallNate/node-speaker) or unix piping like as [ALSA `aplay`](http://alsa.opensrc.org/Aplay) or [SoX `play`](http://sox.sourceforge.net/) command via `stdout`.

- `opts.sampleRate: number` - _default: 44100_
- `opts.numberOfChannels: number` - _default: 2_
- `opts.bitDepth: number` - _default: 16_
- `opts.float: boolean` - _default: false_

#### Instance methods
- `pipe(stream: WritableStream): WritableStream`
  - set the output writable stream
- `resume(): Promise<void>`
  - resume rendering audio data
- `suspend(): Promise<void>`
  - suspend rendering audio data

### new RenderingAudioContext(opts?: object)

`RenderingAudioContext` records audio data with stepwise processing. It is used to export to a wav file or test a web audio application.

- `opts.sampleRate: number` - _default: 44100_
- `opts.numberOfChannels: number` - _default: 2_

#### Instance methods
- `processTo(time: number|string): void`
  - execute rendering process until the provided time
  - `time`: e.g. `10` (10 seconds), `"01:30.500"` (convert to 90.5 seconds)
- `exportAsAudioData(): AudioData`
  - export the rendered data as `AudioData` format
- `encodeAudioData(audioData: AudioData, opts? object): Promise<ArrayBuffer>`
  - encode audio data to the binary format
  - `opts.bitDepth: number` - _default: 16_
  - `opts.float: boolean` - _default: false_

The `AudioData` interface is defined as below.

```
interface AudioData {
  numberOfChannels?: number;
  length?: number;
  sampleRate: number;
  channelData: Float32Array[];
}
```

## Example

```js
const Speaker = require("speaker");
const AudioContext = require("web-audio-context").StreamAudioContext;
const context = new AudioContext();

const osc = context.createOscillator();
const amp = context.createGain();

osc.type = "square";
osc.frequency.setValueAtTime(987.7666, 0);
osc.frequency.setValueAtTime(1318.5102, 0.075);
osc.start(0);
osc.stop(2);
osc.connect(amp);
osc.onended = () => {
  context.close().then(() => {
    process.exit(0);
  });
};

amp.gain.setValueAtTime(0.25, 0);
amp.gain.setValueAtTime(0.25, 0.075);
amp.gain.linearRampToValueAtTime(0, 2);
amp.connect(context.destination);

context.pipe(new Speaker());
context.resume();
```

## Offline Demo

```
$ git clone git@github.com:mohayonao/web-audio-engine.git
$ cd web-audio-engine
$ npm install .
$ npm run build
$ cd demo
$ npm install .
$ node . --help
```

Play demo with SoX `play` command (recommended for mac user).

```
$ node . sines | play -t s16 -r 44100 -c 2 -
```

Play demo with ALSA `aplay` command (recommended for linux user).

```
$ node . sines | aplay -f cd
```

Rendering and export to the wav file.

```
$ node . -o out.wav sines
```

## License

MIT
