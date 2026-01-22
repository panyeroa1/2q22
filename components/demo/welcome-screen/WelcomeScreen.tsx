/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import './WelcomeScreen.css';
import { useTools, Template } from '../../../lib/state';

const welcomeContent: Record<Template, { title: string; description: string; prompts: string[] }> = {
  'eburon-translator': {
    title: 'Translator',
    description: 'A strict real-time interpreter with smart grammatical polishing and non-censorship policy.',
    prompts: [
      "Translate this live for me.",
      "Interpret our conversation.",
      "Just start speaking and I will translate.",
    ],
  },
  'live-transcriber': {
    title: 'Live Transcriber',
    description: 'Verbatim transcription for live audio streams (e.g., C-SPAN) using Gemini or Deepgram.',
    prompts: [
      "Transcribe this live stream.",
      "Capture every word from this audio.",
      "Verbatim mode engaged.",
    ],
  },
  'customer-support': {
    title: 'Customer Support',
    description: 'Handle customer inquiries and see how function calls can automate tasks.',
    prompts: [
      "I'd like to return an item.",
      "What's the status of my order?",
      'Can I speak to a representative?',
    ],
  },
  'personal-assistant': {
    title: 'Personal Assistant',
    description: 'Manage your schedule, send emails, and set reminders.',
    prompts: [
      'Create a calendar event for a meeting tomorrow at 10am.',
      'Send an email to jane@example.com.',
      'Set a reminder to buy milk.',
    ],
  },
  'navigation-system': {
    title: 'Navigation System',
    description: 'Find routes, nearby places, and get traffic information.',
    prompts: [
      'Find a route to the nearest coffee shop.',
      'Are there any parks nearby?',
      "What's the traffic like on the way to the airport?",
    ],
  },
};

const WelcomeScreen: React.FC = () => {
  const { template, setTemplate } = useTools();
  const { title, description, prompts } = welcomeContent[template];
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="title-container">
          <span className="welcome-icon">translate</span>
          <div className="title-selector">
            <select value={template} onChange={(e) => setTemplate(e.target.value as Template)} aria-label="Select a template">
              <option value="eburon-translator">Translator</option>
              <option value="live-transcriber">Live Transcriber</option>
              <option value="customer-support">Customer Support</option>
              <option value="personal-assistant">Personal Assistant</option>
              <option value="navigation-system">Navigation System</option>
            </select>
            <span className="icon">arrow_drop_down</span>
          </div>
        </div>
        <p>{description}</p>
        <div className="example-prompts">
          {prompts.map((prompt, index) => (
            <div key={index} className="prompt">{prompt}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
