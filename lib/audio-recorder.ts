/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { audioContext } from './utils';
import AudioRecordingWorklet from './worklets/audio-processing';
import VolMeterWorket from './worklets/vol-meter';
import { createWorketFromSrc } from './audioworklet-registry';
import EventEmitter from 'eventemitter3';

function arrayBufferToBase64(buffer: ArrayBuffer) {
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export class AudioRecorder {
  private emitter = new EventEmitter();

  public on = this.emitter.on.bind(this.emitter);
  public off = this.emitter.off.bind(this.emitter);

  stream: MediaStream | undefined;
  audioElement: HTMLAudioElement | undefined;
  audioContext: AudioContext | undefined;
  source: MediaStreamAudioSourceNode | MediaElementAudioSourceNode | undefined;
  recording: boolean = false;
  recordingWorklet: AudioWorkletNode | undefined;
  vuWorklet: AudioWorkletNode | undefined;

  private starting: Promise<void> | null = null;

  constructor(public sampleRate = 16000) {}

  async start(url?: string) {
    if (this.recording || this.starting) {
      return this.starting || Promise.resolve();
    }

    this.starting = new Promise(async (resolve, reject) => {
      try {
        this.audioContext = await audioContext({ sampleRate: this.sampleRate });

        if (url) {
          // Stream from URL
          this.audioElement = new Audio();
          this.audioElement.src = url;
          this.audioElement.crossOrigin = 'anonymous';
          
          // Handle play interruption error
          try {
            await this.audioElement.play();
          } catch (e) {
            if ((e as Error).name !== 'AbortError') {
              console.error('Audio element play failed:', e);
            }
          }
          
          this.source = this.audioContext.createMediaElementSource(this.audioElement);
        } else {
          // Stream from Mic
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Could not request user media');
          }
          this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          this.source = this.audioContext.createMediaStreamSource(this.stream);
        }

        const workletName = 'audio-recorder-worklet';
        const src = createWorketFromSrc(workletName, AudioRecordingWorklet);

        await this.audioContext.audioWorklet.addModule(src);
        this.recordingWorklet = new AudioWorkletNode(
          this.audioContext,
          workletName
        );

        this.recordingWorklet.port.onmessage = async (ev: MessageEvent) => {
          const arrayBuffer = ev.data.data.int16arrayBuffer;
          if (arrayBuffer) {
            const base64 = arrayBufferToBase64(arrayBuffer);
            this.emitter.emit('data', base64);
            this.emitter.emit('raw', arrayBuffer);
          }
        };

        this.source.connect(this.recordingWorklet);
        // Connect to destination if it's a stream URL so we can hear it
        if (url) {
            this.source.connect(this.audioContext.destination);
        }

        const vuWorkletName = 'vu-meter';
        await this.audioContext.audioWorklet.addModule(
          createWorketFromSrc(vuWorkletName, VolMeterWorket)
        );
        this.vuWorklet = new AudioWorkletNode(this.audioContext, vuWorkletName);
        this.vuWorklet.port.onmessage = (ev: MessageEvent) => {
          this.emitter.emit('volume', ev.data.volume);
        };

        this.source.connect(this.vuWorklet);
        this.recording = true;
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        this.starting = null;
      }
    });

    return this.starting;
  }

  stop() {
    const handleStop = () => {
      this.source?.disconnect();
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = undefined;
      }
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.src = "";
        this.audioElement.load(); // Ensure resources are cleared
        this.audioElement = undefined;
      }
      this.recordingWorklet = undefined;
      this.vuWorklet = undefined;
      this.recording = false;
    };

    if (this.starting) {
      this.starting.then(handleStop).catch(() => {});
      return;
    }
    handleStop();
  }
}
