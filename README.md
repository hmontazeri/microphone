# wav-web-audio-recorder

## This is a fork of `@gkt/microphone` with different default configs

```
default: Sample Rate 44100
default: Streaming = false
```

`@gkt/microphone` is a JavaScript library for recording audio via the WebAudio API.

## Installation

```
$ yarn add wav-web-audio-recorder
```

or

```
$ npm install wav-web-audio-recorder
```

## Usage

```javascript
import Recorder from "wav-web-audio-recorder";

navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
  const recorder = new Recorder(stream);

  // start recording audio from the microphone
  recorder.start();

  // periodically export a Blob containing WAV data of the audio recorded since the last export
  const blob = recorder.export();

  // stop recording audio
  recorder.stop();
});
```

## Publishing

To publish a new version, update the `version` field in the `package.json` file and run:

```
$ npm publish --access public
```

This will automatically apply a git tag matching the version and push it.
