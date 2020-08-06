# wav-web-audio-recorder

## This is a fork of `@gkt/microphone` with different default configs and promises as returns

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
  recorder
    .start()
    .then(() => {
      //do something
    })
    .catch((error) => {
      //do something
    });

  // periodically export a Blob containing WAV data of the audio recorded since the last export
  recorder
    .export()
    .then((blob) => {
      // do something
    })
    .catch((error) => {
      // do something
    });

  // stop recording audio
  recorder
    .stop()
    .then(() => {
      //do something
    })
    .catch((error) => {
      //do something
    });
});
```

## Publishing

To publish a new version, update the `version` field in the `package.json` file and run:

```
$ npm publish --access public
```

This will automatically apply a git tag matching the version and push it.
