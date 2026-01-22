
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import cn from 'classnames';
import { memo, ReactNode, useEffect, useRef, useState, FormEvent } from 'react';
import { AudioRecorder } from '../../../lib/audio-recorder';
import { useSettings, useTools, useLogStore } from '../../../lib/state';
import { useLiveAPIContext } from '../../../contexts/LiveAPIContext';
import { DeepgramClient } from '../../../lib/deepgram-client';

export type ControlTrayProps = {
  children?: ReactNode;
};

function ControlTray({ children }: ControlTrayProps) {
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [deepgram] = useState(() => new DeepgramClient());
  const [muted, setMuted] = useState(false);
  const [textInput, setTextInput] = useState('');
  const connectButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { client, connected, connect, disconnect } = useLiveAPIContext();
  const { audioSource, streamUrl, transcriptionService, deepgramModel, deepgramLanguage, deepgramApiKey } = useSettings();

  useEffect(() => {
    if (!connected && connectButtonRef.current) {
      connectButtonRef.current.focus();
    }
  }, [connected]);

  useEffect(() => {
    if (!connected) {
      setMuted(false);
      setTextInput('');
      deepgram.disconnect();
    }
  }, [connected, deepgram]);

  useEffect(() => {
    const onData = (base64: string) => {
      // Parallel: Always send audio to Gemini if connected.
      if (connected) {
        client.sendRealtimeInput([
          {
            mimeType: 'audio/pcm;rate=16000',
            data: base64,
          },
        ]);
      }
    };

    const onRaw = (buffer: ArrayBuffer) => {
      // Parallel: Send raw buffer to Deepgram if it's the selected transcriber service.
      if (transcriptionService === 'deepgram' && connected) {
        deepgram.send(buffer);
      }
    };

    if (connected && !muted && audioRecorder) {
      audioRecorder.on('data', onData);
      audioRecorder.on('raw', onRaw);
      
      const startOptions = audioSource === 'url' ? streamUrl : undefined;
      audioRecorder.start(startOptions);

      if (transcriptionService === 'deepgram') {
        deepgram.connect(deepgramApiKey, deepgramModel, deepgramLanguage);
      }
    } else {
      audioRecorder.stop();
      deepgram.disconnect();
    }

    return () => {
      audioRecorder.off('data', onData);
      audioRecorder.off('raw', onRaw);
    };
  }, [connected, client, muted, audioRecorder, audioSource, streamUrl, transcriptionService, deepgram, deepgramModel, deepgramLanguage, deepgramApiKey]);

  // Handle Deepgram events for parallel verbatim transcription display
  useEffect(() => {
    const handleDeepgramTranscript = (text: string, isFinal: boolean) => {
      const { addTurn, updateLastTurn } = useLogStore.getState();
      const turns = useLogStore.getState().turns;
      const last = turns[turns.length - 1];

      const prefix = '[Verbatim] ';

      if (last && last.role === 'agent' && last.text.startsWith(prefix) && !last.isFinal) {
        updateLastTurn({
          text: last.text + ' ' + text,
          isFinal,
        });
      } else {
        addTurn({ 
          role: 'agent', 
          text: `${prefix}${text}`, 
          isFinal 
        });
      }
    };

    deepgram.on('transcript', handleDeepgramTranscript);
    return () => deepgram.off('transcript', handleDeepgramTranscript);
  }, [deepgram]);

  const handleMicClick = () => {
    if (connected) {
      setMuted(!muted);
    } else {
      connect();
    }
  };

  const handleTextSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && connected) {
      const message = textInput.trim();
      client.send([{ text: message }]);
      useLogStore.getState().addTurn({
        role: 'user',
        text: message,
        isFinal: true,
      });
      setTextInput('');
    }
  };

  const micIcon = audioSource === 'url' 
    ? (muted ? 'volume_off' : 'volume_up')
    : (muted ? 'mic_off' : 'mic');

  const micButtonTitle = connected
    ? muted
      ? 'Unmute'
      : 'Mute'
    : 'Connect';

  const connectButtonTitle = connected ? 'Stop streaming' : 'Start streaming';

  return (
    <section className="control-tray">
      <nav className={cn('actions-nav', { 'with-input': connected })}>
        <button
          className={cn('action-button mic-button', { 'muted': muted })}
          onClick={handleMicClick}
          title={micButtonTitle}
        >
          <span className="material-symbols-outlined filled">{micIcon}</span>
        </button>

        {connected && transcriptionService === 'gemini' && (
          <form className="text-input-form" onSubmit={handleTextSubmit}>
            <input
              ref={inputRef}
              type="text"
              className="text-input"
              placeholder="Type a message..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="send-button"
              disabled={!textInput.trim()}
              title="Send message"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
        )}

        <button
          className={cn('action-button', { 'muted': muted })}
          onClick={() => setMuted(!muted)}
          aria-label={muted ? 'Unmute' : 'Mute'}
          title={muted ? 'Unmute' : 'Mute'}
        >
          <span className="material-symbols-outlined filled">
            {muted ? 'volume_off' : 'volume_up'}
          </span>
        </button>
        <button
          className={cn('action-button')}
          onClick={useLogStore.getState().clearTurns}
          aria-label="Reset Chat"
          title="Reset session logs"
        >
          <span className="material-symbols-outlined">refresh</span>
        </button>
        {children}
      </nav>

      <div className={cn('connection-container', { connected })}>
        <div className="connection-button-container">
          <button
            ref={connectButtonRef}
            className={cn('action-button connect-toggle', { connected })}
            onClick={connected ? disconnect : connect}
            title={connectButtonTitle}
          >
            <span className="material-symbols-outlined filled">
              {connected ? 'pause' : 'play_arrow'}
            </span>
          </button>
        </div>
        <span className="text-indicator">Streaming</span>
      </div>
    </section>
  );
}

export default memo(ControlTray);
