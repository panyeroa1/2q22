/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import EventEmitter from 'eventemitter3';

export interface DeepgramEventTypes {
  transcript: (text: string, isFinal: boolean) => void;
  error: (err: any) => void;
  open: () => void;
  close: () => void;
}

export class DeepgramClient {
  private socket: WebSocket | null = null;
  private emitter = new EventEmitter<DeepgramEventTypes>();

  public on = this.emitter.on.bind(this.emitter);
  public off = this.emitter.off.bind(this.emitter);

  connect(apiKey: string, model: string = 'nova-3', language: string = 'multi') {
    // Dynamically build the endpoint based on settings
    const endpoint = `wss://api.deepgram.com/v1/listen?endpointing=false&punctuate=true&smart_format=true&vad_events=true&language=${language}&model=${model}&encoding=linear16&sample_rate=16000`;

    this.socket = new WebSocket(endpoint, ['token', apiKey]);

    this.socket.onopen = () => {
      console.log(`Deepgram connected (model: ${model}, language: ${language})`);
      this.emitter.emit('open');
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const transcript = data.channel?.alternatives?.[0]?.transcript;
        const isFinal = data.is_final;

        if (transcript) {
          this.emitter.emit('transcript', transcript, isFinal);
        }
      } catch (err) {
        console.error('Deepgram parse error', err);
      }
    };

    this.socket.onerror = (err) => {
      console.error('Deepgram socket error:', err);
      this.emitter.emit('error', err);
    };

    this.socket.onclose = (event) => {
      console.log(`Deepgram closed (code: ${event.code}, reason: ${event.reason || 'none'})`);
      this.emitter.emit('close');
    };
  }

  send(buffer: ArrayBuffer) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(buffer);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
