# web-audio-engine
[![Build Status](http://img.shields.io/travis/mohayonao/web-audio-engine.svg?style=flat-square)](https://travis-ci.org/mohayonao/web-audio-engine)
[![NPM Version](http://img.shields.io/npm/v/web-audio-engine.svg?style=flat-square)](https://www.npmjs.org/package/web-audio-engine)
[![License](http://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://mohayonao.mit-license.org/)

This library implements the [Web Audio API](https://www.w3.org/TR/webaudio/) specification on Pure JavaScript.

## Installation

```
npm install --save web-audio-engine
```
##### download
- [web-audio-engine.js](https://raw.githubusercontent.com/mohayonao/web-audio-engine/master/build/web-audio-engine.js)

## API
`web-audio-engine` provides some `AudioContext` class for each use-case: audio playback, rendering and simulation.

### Class: StreamAudioContext
`StreamAudioContext` writes raw PCM audio data to a writable node stream. It can be used to playback audio in realtime.

##### new StreamAudioContext(opts?: object)
Creates new StreamAudioContext instance.
- `opts.sampleRate: number` audio sample rate (in Hz) - _default: 44100_
- `opts.numberOfChannels: number` audio channels (e.g. 2: stereo) - _default: 2_
- `opts.blockSize: number` samples each rendering quantum - _default: 128_
- `opts.bitDepth: number` bits per sample - _default: 16_
- `opts.float: boolean` use floating-point values - _default: false_

##### context.pipe(destination: stream.Writable): stream.Writable
:construction_worker: _TODO: WRITE DESCRIPTION_

```js
const AudioContext = require("web-audio-engine").StreamAudioContext;
const context = new AudioContext();

// Set the output for audio streaming
context.pipe(process.stdout);

// If you want to playback sound directly in this process, you can use 'node-speaker'.
// const Speaker = require("speaker");
// context.pipe(new Speaker());

// Start to render audio
context.resume();

// composeWith(context);
```

### Class: RenderingAudioContxt
`RenderingAudioContext` records audio data with stepwise processing. It is used to export to a wav file or test a web audio application.

##### new RenderingAudioContxt(opts?: object)
Creates new `RenderingAudioContxt` instance.
- `opts.sampleRate: number` audio sample rate (in Hz) - _default: 44100_
- `opts.numberOfChannels: number` audio channels (e.g. 2: stereo) - _default: 2_
- `opts.blockSize: number` samples each rendering quantum - _default: 128_

##### context.processTo(time: number|string)
Executes rendering process until the provided time.
- `time`: e.g. `10` (10 seconds), `"01:30.500"` (convert to 90.5 seconds)

##### context.exportAsAudioData(): AudioData
Exports the rendered data as `AudioData` format.

##### context.encodeAudioData(audioData: AudioData, opts?:object): Promise< ArrayBuffer >
Encode audio data to the binary format.

- `audioData: AudioData`
- `opts.bitDepth: number` bits per sample - _default: 16_
- `opts.float: boolean` use floating-point values - _default: false_

```js
const fs = require("fs");
const AudioContext = require("web-audio-engine").RenderingAudioContxt;
const context = new AudioContext();

// composeWith(context);

context.processTo("00:01:30.000");
// context.currentTime -> 90.00054421768708

context.processTo("00:02:00.000");
// context.currentTime -> 120.00072562358277

context.encodeAudioData(context.exportAsAudioData()).then((arrayBuffer) => {
  fs.writeFile("output.wav", new Buffer(arrayBuffer));
});
```

### Class: WebAudioContext
:construction_worker: _TODO: WRITE DESCRIPTION_

##### new WebAudioContext(opts?: object)
Creates new `WebAudioContext` instance.
- `opts.context?: AudioContext` the native Web Audio API AudioContext instance
- `opts.destination?: AudioNode` - _default: opts.context.destination_
- `opts.numberOfChannels: number` audio channels (e.g. 2: stereo) - _default: 2_
- `opts.blockSize: number` samples each rendering quantum - _default: 128_

```html
<script src="/path/to/web-audio-engine.js"></script>
<script>
var context = new WebAudioEngine.WebAudioContext({ context: new AudioContext() });

// composeWith(context);

context.resume();
</script>
```

### Class: OfflineAudioContext
This context is compatible with the natvie Web Audio API `OfflineAudioContext`.

```js
const OfflineAudioContext = require("web-audio-engine").OfflineAudioContext;
const context = new OfflineAudioContext(2, 44100 * 10, 44100);

// composeWith(context);

context.startRendering().then((audioBuffer) => {
  console.log(audioBuffer);
});
```

### Interface: AudioData

```
interface AudioData {
  numberOfChannels?: number;
  length?: number;
  sampleRate: number;
  channelData: Float32Array[];
}
```

### decoder
The default decoder of `web-audio-engine` supports "wav" format only. If you need to support other audio format, you are necessary to prepare a custom decoder yourself.

##### decoder.get(): function
Returns the function for decoding currently set.

##### decoder.set(decodeFn: function)
Sets the function for decoding.
- `decodeFn: (audioData: ArrayBuffer, opts?: object) => Promise< AudioData >` The decoding to use.

##### decoder.decode(audioData: ArrayBuffer, opts?: object): Promise< AudioData >
Executes decoding.
- `audioData: ArrayBuffer`

### encoder
The default encoder of `web-audio-engine` supports "wav" format only. If you need to support other audio format, you are necessary to prepare a custom encoder yourself.

##### encoder.get(): function
Returns the function for encoding currently set.

##### encoder.set(encodeFn: function)
Sets the function for encoding.
- `encodeFn: (audioData: AudioData, opts?: object) => Promise< ArrayBuffer >` The encoding to use.

##### encoder.encode(audioData: AudioData, opts?: object): Promise< ArrayBuffer >
Executes encoding.
- `audioData: AudioData`

## Implemented API
- `AudioBuffer`
- `AudioBufferSourceNode`
- `AudioContext`
- `AudioDestinationNode`
- `AudioNode`
- `AudioParam`
- `BiquadFilterNode` (audio rate parameter is not supported)
- `ChannelMergerNode`
- `ChannelSplitterNode`
- `DelayNode` (noisy..)
- `GainNode`
- `IIRFIlterNode`
- `OscillatorNode` (use wave-table synthesis, not use periodic wave)
- `PeriodicWave`
- `ScriptProcessorNode`
- `StereoPannerNode`
- `WaveShaperNode`
- The other not implemented nodes will pass its input to its output without modification.

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

## Online Demo
The online demo is here. In this site, you can compare `web-audio-engine` and the native Web Audio API.

- http://mohayonao.github.io/web-audio-engine/demo/

## Offline Demo

```
$ git clone git@github.com:mohayonao/web-audio-engine.git
$ cd web-audio-engine
$ npm install && npm run build
$ cd demo
$ npm install
$ node demo --help
```

Simplest play demo with `node-speaker`.

```
$ node demo sines
```

Rendering and export to the wav file.

```
$ node demo -o out.wav sines
```

## Online Benchmark
Currently, this benchmark doesn't work in Chrome or Safari, please use Firefox.

- http://mohayonao.github.io/web-audio-engine/benchmark/

## License

MIT
