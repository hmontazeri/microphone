import { encodeWAV } from "./encoders";

// A class for recording data from the microphone and exporting it to WAV
// format.
class Microphone {
  // Create a new Microphone instance.
  //
  // stream - A MediaStream object produced by the MediaDevices.getUserMedia()
  //          method with the audio constraint set.
  // opts   - An object of zero or more of the following options:
  //          bufferSize       - A Number indicating the buffer size in units of
  //                             sample frames. This gets passed directly to the
  //                             BaseAudioContext.createScriptProcessor method
  //                             (default 4096).
  //          exportSampleRate - A Number indicating the desired sample rate to
  //                             use in the exported WAV file. The actual sample
  //                             rate may not match this value exactly since the
  //                             downsampling algorithm used is very simple and
  //                             uses a whole number downsampling factor
  //                             (default: 16000).
  //          mono             - A Boolean indicating whether to record mono
  //                             audio (1 channel) or not (2 channels) (default:
  //                             true).
  //          streaming        - A Boolean indicating whether the audio is being
  //                             streamed. When true only the first export will
  //                             include the WAV header and all subsequent
  //                             exports will just contain the raw PCM encoded
  //                             data. When false the WAV header will be added
  //                             to all exports (default: true).
  //          audioContext     - The AudioContext class to use. This is only
  //                             useful for mocking AudioContext in tests
  //                             (default: window.AudioContext).
  //
  // Examples
  //
  //   navigator.mediaDevices.getUserMedia({audio: true}).then((stream) => {
  //     const mic = new Microphone(stream, { exportSampleRate: 8000, mono: false});
  //   });
  constructor(stream, { audioContext = window.AudioContext } = {}) {
    this.stream = stream;
    this.bufferSize = 4096;
    this.mono = true;
    this.streaming = false;
    this.context = new audioContext();
    this.source = this.context.createMediaStreamSource(this.stream);
    this.downsample = false;
    // this.downsample = this.context.sampleRate > this.exportSampleRate;
  }

  // Start recording audio. This will begin buffering audio data from the
  // microphone.
  //
  // Returns the receiver.
  start() {
    return new Promise((resolve, reject) => {
      try {
        const numChannels = 1;
        this.node = this.context.createScriptProcessor(
          this.bufferSize,
          numChannels,
          numChannels
        );
        this.source.connect(this.node);
        this.node.connect(this.context.destination);
        this.c0Bufs = [];

        this.node.onaudioprocess = (e) => {
          this.c0Bufs.push(e.inputBuffer.getChannelData(0).slice());
        };

        resolve(this);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Stop recording audio.
  //
  // Returns the receiver.
  stop() {
    return new Promise((resolve, reject) => {
      try {
        this.node.onaudioprocess = null;
        this.node.disconnect();
        this.node = null;
        resolve(this);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Exports the currently buffered audio data to WAV format.
  //
  // Returns a Blob of type audio/wav.
  export() {
    return new Promise((resolve, reject) => {
      // empty blob if no buffers
      if (this.c0Bufs.length === 0) {
        return new Blob([], { type: "audio/wav" });
      }
      // combine sample buffers
      let rate, samples;
      const c0 = flatten(this.c0Bufs);
      rate = this.context.sampleRate;
      samples = c0;
      this.c0Bufs = [];
      this.c1Bufs = [];

      try {
        const blob = encodeWAV(samples, {
          sampleRate: rate,
          mono: this.mono,
          streaming: false,
          addHeader: true,
        });
        resolve(blob);
      } catch (error) {
        reject(error);
      }
    });
  }
}

// Flattens the given list of buffers into a single buffer.
//
// buffers - An Array of Float32Arrays.
//
// Returns a new Float32Array with the contents from all of the given buffers.
export function flatten(buffers) {
  const buf = new Float32Array(buffers.reduce((sum, b) => sum + b.length, 0));

  for (
    let offset = 0, i = 0;
    i < buffers.length;
    offset += buffers[i].length, i++
  ) {
    buf.set(buffers[i], offset);
  }

  return buf;
}

// Interleaves two buffers into a single Float32Array.
//
// a - A Float32Array
// b - A Float32Array
//
// Returns a Float32Array.
// export function interleave(a, b) {
//   const buf = new Float32Array(a.length * 2);

//   for (let i = 0; i < a.length; i++) {
//     buf[i * 2] = a[i];
//     buf[i * 2 + 1] = b[i];
//   }

//   return buf;
// }

// Downsamples the given samples buffer from the given original rate to a rate
// as close to the desired rate as you can get without going under by using a
// whole number downsampling factor.
//
// originalSamples - A Float32Array.
// originalRate    - A Number indicating the rate at which the given samples
//                   were recorded at.
// desiredRate     - A Number indicating the desired rate to downsample to.
//
// Returns an Object with two fields:
//   rate    - A Number indicating the actual rate the original samples were
//             downsampled to.
//   samples - A Float32Array containing the downsampled values.
// export function downsample(originalSamples, originalRate, desiredRate) {
//   if (desiredRate > originalRate) {
//     throw new Error("desired rate must be less than original rate");
//   }

//   const filtered = lowpassFilter(originalSamples);
//   const factor = Math.floor(originalRate / desiredRate);
//   const samples = new Float32Array(Math.round(filtered.length / factor));

//   for (let i = 0, j = 0; i < samples.length; i++, j += factor) {
//     samples[i] = filtered[j];
//   }

//   return { rate: originalRate / factor, samples };
// }

// function lowpassFilter(samples) {
//   const length = Math.max(0, samples.length - FILTER.length + 1);
//   const buf = new Float32Array(length);

//   // convolve the lowpass FIR filter with the signal. We don't reverse the signal because the filter
//   // is symmetric. If the filter becomes non symettric this code will need to be adjusted.
//   for (let i = 0; i < length; i++) {
//     for (let j = 0; j < FILTER.length; j++) {
//       buf[i] += samples[i + j] * FILTER[j];
//     }
//   }

//   return buf;
// }

export default Microphone;
