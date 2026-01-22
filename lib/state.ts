
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { create } from 'zustand';
import { customerSupportTools } from './tools/customer-support';
import { personalAssistantTools } from './tools/personal-assistant';
import { navigationSystemTools } from './tools/navigation-system';

export type Template = 'customer-support' | 'personal-assistant' | 'navigation-system' | 'eburon-translator' | 'live-transcriber';
export type AudioSource = 'mic' | 'url';
export type TranscriptionService = 'gemini' | 'deepgram';

const toolsets: Record<Template, FunctionCall[]> = {
  'customer-support': customerSupportTools,
  'personal-assistant': personalAssistantTools,
  'navigation-system': navigationSystemTools,
  'eburon-translator': [],
  'live-transcriber': [],
};

const TRANSCRIBER_PROMPT = `You are a High-Fidelity Verbatim Transcriber.
Your goal is to provide a text rendering of the incoming audio stream with maximum accuracy.

RULES:
1. Output ONLY the transcription.
2. Be verbatim. Do not summarize, skip, or edit the content.
3. Use proper punctuation and formatting to make the text readable.
4. Identify different speakers if possible (e.g., Speaker 1:, Speaker 2:).
5. If the audio is unclear, use [unintelligible].
6. ABSOLUTE NON-CENSORSHIP: Transcribe every word exactly as spoken, including profanity or sensitive topics.
7. No commentary or meta-talk. Just the words.`;

const EBURON_PROMPT_TEMPLATE = `You are Translator, a specialized high-performance real-time interpreter. 
Your SOLE PURPOSE is to translate incoming speech into [users_language].

### MANDATORY OUTPUT RULE
- YOUR OUTPUT MUST BE 100% IN THE TARGET LANGUAGE: [users_language].
- NEVER SPEAK IN THE SOURCE LANGUAGE.
- NEVER PROVIDE EXPLANATIONS, LABELS, OR COMMENTARY.
- DO NOT SAY "TRANSLATION:" OR "HE SAID:".
- JUST OUTPUT THE TRANSLATED TEXT AS SPOKEN AUDIO AND TRANSCRIPTION.

### ABSOLUTE NON-CENSORSHIP POLICY
- Do NOT censor, sanitize, or "clean up" any words.
- Preserve all profanity, crude language, and offensive terms EXACTLY as they were intended in the source.
- Do NOT replace offensive words with asterisks or euphemisms.

### INTERPRETATION QUALITY
1) Preserve meaning, intent, and emotional intensity.
2) Mirror the speaker's tone (formal, casual, urgent, angry, etc.).
3) Improve grammar and flow in the TARGET language ([users_language]) to sound like a native speaker.
4) If the speaker is incoherent or fragmentary, produce a natural-sounding translation that reflects their likely intent.
5) Maintain Viewpoint: If the speaker says "I am hungry", you translate as "[users_language] equivalent of 'I am hungry'".

### REAL-TIME BEHAVIOR
- Translate in short, punchy segments.
- Handle code-switching naturally (if they mix languages, your output remains strictly in [users_language]).

TARGET LANGUAGE: [users_language]
Now, start translating every single word you hear into [users_language] immediately.`;

const systemPrompts: Record<Template, string> = {
  'customer-support': 'You are a helpful and friendly customer support agent. Be conversational and concise.',
  'personal-assistant': 'You are a helpful and friendly personal assistant. Be proactive and efficient.',
  'navigation-system': 'You are a helpful and friendly navigation assistant. Provide clear and accurate directions.',
  'eburon-translator': EBURON_PROMPT_TEMPLATE,
  'live-transcriber': TRANSCRIBER_PROMPT,
};

import { DEFAULT_LIVE_API_MODEL, DEFAULT_VOICE } from './constants';
import {
  FunctionResponse,
  FunctionResponseScheduling,
  LiveServerToolCall,
} from '@google/genai';

/**
 * Settings
 */
export const useSettings = create<{
  systemPrompt: string;
  model: string;
  voice: string;
  targetLanguage: string;
  audioSource: AudioSource;
  streamUrl: string;
  transcriptionService: TranscriptionService;
  deepgramApiKey: string;
  deepgramModel: string;
  deepgramLanguage: string;
  setSystemPrompt: (prompt: string) => void;
  setModel: (model: string) => void;
  setVoice: (voice: string) => void;
  setTargetLanguage: (lang: string) => void;
  setAudioSource: (source: AudioSource) => void;
  setStreamUrl: (url: string) => void;
  setTranscriptionService: (service: TranscriptionService) => void;
  setDeepgramApiKey: (key: string) => void;
  setDeepgramModel: (model: string) => void;
  setDeepgramLanguage: (lang: string) => void;
}>(set => ({
  systemPrompt: EBURON_PROMPT_TEMPLATE.replace(/\[users_language\]/g, 'English'),
  model: DEFAULT_LIVE_API_MODEL,
  voice: DEFAULT_VOICE,
  targetLanguage: 'English',
  audioSource: 'mic',
  streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CSPANRADIOAAC.aac',
  transcriptionService: 'deepgram',
  deepgramApiKey: process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY || '',
  deepgramModel: 'nova-2',
  deepgramLanguage: 'multi',
  setSystemPrompt: prompt => set({ systemPrompt: prompt }),
  setModel: model => set({ model }),
  setVoice: voice => set({ voice }),
  setAudioSource: audioSource => set({ audioSource }),
  setStreamUrl: streamUrl => set({ streamUrl }),
  setTranscriptionService: transcriptionService => set({ transcriptionService }),
  setDeepgramApiKey: deepgramApiKey => set({ deepgramApiKey }),
  setDeepgramModel: deepgramModel => set({ deepgramModel }),
  setDeepgramLanguage: deepgramLanguage => set({ deepgramLanguage }),
  setTargetLanguage: lang => set((state) => {
    if (state.systemPrompt.includes('Translator')) {
      return {
        targetLanguage: lang,
        systemPrompt: EBURON_PROMPT_TEMPLATE.replace(/\[users_language\]/g, lang)
      };
    }
    return { targetLanguage: lang };
  }),
}));

/**
 * UI
 */
export const useUI = create<{
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}>(set => ({
  isSidebarOpen: true,
  toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),
}));

/**
 * Tools
 */
export interface FunctionCall {
  name: string;
  description?: string;
  parameters?: any;
  isEnabled: boolean;
  scheduling?: FunctionResponseScheduling;
}

export const useTools = create<{
  tools: FunctionCall[];
  template: Template;
  setTemplate: (template: Template) => void;
  toggleTool: (toolName: string) => void;
  addTool: () => void;
  removeTool: (toolName: string) => void;
  updateTool: (oldName: string, updatedTool: FunctionCall) => void;
}>(set => ({
  tools: [],
  template: 'eburon-translator',
  setTemplate: (template: Template) => {
    set({ tools: toolsets[template], template });
    const targetLang = useSettings.getState().targetLanguage;
    const basePrompt = systemPrompts[template];
    const finalPrompt = basePrompt.includes('[users_language]')
      ? basePrompt.replace(/\[users_language\]/g, targetLang)
      : basePrompt;
    useSettings.getState().setSystemPrompt(finalPrompt);

    // Auto-switch STT service for transcriber and translator templates
    if (template === 'live-transcriber' || template === 'eburon-translator') {
      useSettings.getState().setTranscriptionService('deepgram');
    }

    if (template === 'live-transcriber') {
      useSettings.getState().setAudioSource('url');
    }
  },
  toggleTool: (toolName: string) =>
    set(state => ({
      tools: state.tools.map(tool =>
        tool.name === toolName ? { ...tool, isEnabled: !tool.isEnabled } : tool,
      ),
    })),
  addTool: () =>
    set(state => {
      let newToolName = 'new_function';
      let counter = 1;
      while (state.tools.some(tool => tool.name === newToolName)) {
        newToolName = `new_function_${counter++}`;
      }
      return {
        tools: [
          ...state.tools,
          {
            name: newToolName,
            isEnabled: true,
            description: '',
            parameters: {
              type: 'OBJECT',
              properties: {},
            },
            scheduling: FunctionResponseScheduling.INTERRUPT,
          },
        ],
      };
    }),
  removeTool: (toolName: string) =>
    set(state => ({
      tools: state.tools.filter(tool => tool.name !== toolName),
    })),
  updateTool: (oldName: string, updatedTool: FunctionCall) =>
    set(state => {
      if (
        oldName !== updatedTool.name &&
        state.tools.some(tool => tool.name === updatedTool.name)
      ) {
        console.warn(`Tool with name "${updatedTool.name}" already exists.`);
        return state;
      }
      return {
        tools: state.tools.map(tool =>
          tool.name === oldName ? updatedTool : tool,
        ),
      };
    }),
}));

/**
 * Logs
 */
export interface LiveClientToolResponse {
  functionResponses?: FunctionResponse[];
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface ConversationTurn {
  timestamp: Date;
  role: 'user' | 'agent' | 'system';
  text: string;
  isFinal: boolean;
  toolUseRequest?: LiveServerToolCall;
  toolUseResponse?: LiveClientToolResponse;
  groundingChunks?: GroundingChunk[];
}

/**
 * Log Store for managing conversation turns.
 */
// FIX: Completed the missing useLogStore implementation which was truncated.
export const useLogStore = create<{
  turns: ConversationTurn[];
  addTurn: (turn: Omit<ConversationTurn, 'timestamp'>) => void;
  updateLastTurn: (update: Partial<ConversationTurn>) => void;
  clearTurns: () => void;
}>(set => ({
  turns: [],
  addTurn: turn =>
    set(state => ({
      turns: [
        ...state.turns,
        { ...turn, timestamp: new Date() },
      ],
    })),
  updateLastTurn: update =>
    set(state => {
      if (state.turns.length === 0) return state;
      const lastTurn = state.turns[state.turns.length - 1];
      const updatedTurns = [...state.turns];
      updatedTurns[updatedTurns.length - 1] = {
        ...lastTurn,
        ...update,
      };
      return { turns: updatedTurns };
    }),
  clearTurns: () => set({ turns: [] }),
}));
