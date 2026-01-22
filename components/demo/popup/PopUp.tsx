/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import './PopUp.css';

interface PopUpProps {
  onClose: () => void;
}

const PopUp: React.FC<PopUpProps> = ({ onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Welcome to Translator</h2>
        <p>Your real-time AI interpreter with smart polishing and advanced function calling.</p>
        <p>To get started:</p>
        <ol>
          <li><span className="icon">play_circle</span>Press Play to start streaming audio.</li>
          <li><span className="icon">tune</span>Adjust settings and AI LLM version in the sidebar.</li>
          <li><span className="icon">auto_awesome</span>Select a Persona Template to change the translation mode.</li>
        </ol>
        <button onClick={onClose}>Start Translating</button>
      </div>
    </div>
  );
};

export default PopUp;
