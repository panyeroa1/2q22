/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { FunctionCall, useSettings, useUI, useTools } from '../lib/state';
import c from 'classnames';
import { DEFAULT_LIVE_API_MODEL, AVAILABLE_VOICES } from '../lib/constants';
import { useLiveAPIContext } from '../contexts/LiveAPIContext';
import { useState, useEffect } from 'react';
import ToolEditorModal from './ToolEditorModal';
import { fetchLanguages } from '../lib/firebase';

const AVAILABLE_MODELS = [
  DEFAULT_LIVE_API_MODEL
];

const DEEPGRAM_MODELS = ['nova-3', 'nova-2', 'base'];
const DEEPGRAM_LANGUAGES = [
  { value: 'multi', label: 'Multilingual' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'nl', label: 'Dutch' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
];

export default function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useUI();
  const {
    systemPrompt, model, voice, targetLanguage,
    audioSource, streamUrl, transcriptionService,
    deepgramModel, deepgramLanguage, deepgramApiKey,
    setSystemPrompt, setModel, setVoice, setTargetLanguage,
    setAudioSource, setStreamUrl, setTranscriptionService,
    setDeepgramModel, setDeepgramLanguage, setDeepgramApiKey
  } = useSettings();
  const { tools, toggleTool, addTool, removeTool, updateTool, setTemplate, template } = useTools();
  const { connected } = useLiveAPIContext();

  const [editingTool, setEditingTool] = useState<FunctionCall | null>(null);
  const [languages, setLanguages] = useState<string[]>([]);

  useEffect(() => {
    fetchLanguages().then(setLanguages);
  }, []);

  const handleSaveTool = (updatedTool: FunctionCall) => {
    if (editingTool) {
      updateTool(editingTool.name, updatedTool);
    }
    setEditingTool(null);
  };

  const showTranscriptionSettings = template === 'live-transcriber' || template === 'eburon-translator';

  return (
    <>
      <aside className={c('sidebar', { open: isSidebarOpen })}>
        <div className="sidebar-header">
          <h3>Settings</h3>
          <button onClick={toggleSidebar} className="close-button">
            <span className="icon">close</span>
          </button>
        </div>
        <div className="sidebar-content">
          <div className="sidebar-section">
            <fieldset disabled={connected}>
              <label>
                Persona Template
                <select value={template} onChange={e => setTemplate(e.target.value as any)}>
                  <option value="eburon-translator">Translator</option>
                  <option value="live-transcriber">Live Transcriber</option>
                  <option value="customer-support">Customer Support</option>
                  <option value="personal-assistant">Personal Assistant</option>
                  <option value="navigation-system">Navigation System</option>
                </select>
              </label>

              {showTranscriptionSettings && (
                <>
                  <label>
                    Audio Source
                    <select value={audioSource} onChange={e => setAudioSource(e.target.value as any)}>
                      <option value="mic">Microphone</option>
                      <option value="url">Stream URL</option>
                    </select>
                  </label>

                  {audioSource === 'url' && (
                    <label>
                      Stream URL
                      <input
                        type="text"
                        value={streamUrl}
                        onChange={e => setStreamUrl(e.target.value)}
                        placeholder="https://..."
                        className="sidebar-input"
                      />
                    </label>
                  )}

                  <label>
                    Transcription Service
                    <select value={transcriptionService} onChange={e => setTranscriptionService(e.target.value as any)}>
                      <option value="gemini">AI LLM 2.4</option>
                      <option value="deepgram">AI STT 2.4</option>
                    </select>
                  </label>

                  {transcriptionService === 'deepgram' && (
                    <div className="nested-settings">
                      <label>
                        Deepgram API Key
                        <input
                          type="password"
                          value={deepgramApiKey}
                          onChange={e => setDeepgramApiKey(e.target.value)}
                          placeholder="Deepgram API Key"
                          className="sidebar-input"
                        />
                      </label>
                      <label>
                        Deepgram Model
                        <select value={deepgramModel} onChange={e => setDeepgramModel(e.target.value)}>
                          {DEEPGRAM_MODELS.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Deepgram Language
                        <select value={deepgramLanguage} onChange={e => setDeepgramLanguage(e.target.value)}>
                          {DEEPGRAM_LANGUAGES.map(l => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  )}
                </>
              )}

              <label>
                Target Translation Language
                <select
                  value={targetLanguage}
                  onChange={e => setTargetLanguage(e.target.value)}
                >
                  {languages.length > 0 ? (
                    languages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))
                  ) : (
                    <option value="English">English</option>
                  )}
                </select>
              </label>

              <label>
                System Prompt
                <textarea
                  value={systemPrompt}
                  onChange={e => setSystemPrompt(e.target.value)}
                  rows={10}
                  placeholder="Describe the role and personality of the AI..."
                />
              </label>

              <label>
                Model
                <select value={model} onChange={e => setModel(e.target.value)}>
                  {AVAILABLE_MODELS.map(m => (
                    <option key={m} value={m}>
                      AI LLM 2.4
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Voice
                <select value={voice} onChange={e => setVoice(e.target.value)}>
                  {AVAILABLE_VOICES.map(v => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
            </fieldset>
          </div>

          {template !== 'eburon-translator' && template !== 'live-transcriber' && (
            <div className="sidebar-section">
              <h4 className="sidebar-section-title">Tools</h4>
              <div className="tools-list">
                {tools.map(tool => (
                  <div key={tool.name} className="tool-item">
                    <label className="tool-checkbox-wrapper">
                      <input
                        type="checkbox"
                        id={`tool-checkbox-${tool.name}`}
                        checked={tool.isEnabled}
                        onChange={() => toggleTool(tool.name)}
                        disabled={connected}
                      />
                      <span className="checkbox-visual"></span>
                    </label>
                    <label
                      htmlFor={`tool-checkbox-${tool.name}`}
                      className="tool-name-text"
                    >
                      {tool.name}
                    </label>
                    <div className="tool-actions">
                      <button
                        onClick={() => setEditingTool(tool)}
                        disabled={connected}
                        aria-label={`Edit ${tool.name}`}
                      >
                        <span className="icon">edit</span>
                      </button>
                      <button
                        onClick={() => removeTool(tool.name)}
                        disabled={connected}
                        aria-label={`Delete ${tool.name}`}
                      >
                        <span className="icon">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={addTool}
                className="add-tool-button"
                disabled={connected}
              >
                <span className="icon">add</span> Add function call
              </button>
            </div>
          )}
        </div>
      </aside>
      {editingTool && (
        <ToolEditorModal
          tool={editingTool}
          onClose={() => setEditingTool(null)}
          onSave={handleSaveTool}
        />
      )}
    </>
  );
}
