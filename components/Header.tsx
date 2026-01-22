/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useUI } from '../lib/state';

export default function Header() {
  const { toggleSidebar } = useUI();

  return (
    <header>
      <div className="header-left">
        <h1>Eburon Translator</h1>
        <p>Real-time AI Translation and Function Calling powered by AI LLM 2.4.</p>
      </div>
      <div className="header-right">
        <button
          className="settings-button"
          onClick={toggleSidebar}
          aria-label="Settings"
        >
          <span className="icon">tune</span>
        </button>
      </div>
    </header>
  );
}