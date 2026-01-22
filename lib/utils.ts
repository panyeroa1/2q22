/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

type GetAudioContextOptions = AudioContextOptions & {
  id?: string;
};

const map: Map<string, AudioContext> = new Map();

let didInteractPromise: Promise<boolean> | null = null;

const getDidInteract = () => {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (!didInteractPromise) {
    didInteractPromise = new Promise(res => {
      const unlock = () => {
        res(true);
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
      };
      window.addEventListener('pointerdown', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
    });
  }
  return didInteractPromise;
};

export const audioContext: (
  options?: GetAudioContextOptions
) => Promise<AudioContext> = async (options?: GetAudioContextOptions) => {
  const createContext = (opts?: GetAudioContextOptions) => {
    if (opts?.id && map.has(opts.id)) {
      const existing = map.get(opts.id);
      if (existing) return existing;
    }
    const ctx = new AudioContext(opts);
    if (opts?.id) {
      map.set(opts.id, ctx);
    }
    return ctx;
  };

  try {
    // Attempt to unlock audio context immediately if possible
    const a = new Audio();
    a.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
    // Use catch to handle "play() request was interrupted" or "user didn't interact" errors
    await a.play().catch(() => { });

    return createContext(options);
  } catch (e) {
    // If we failed (likely due to lack of interaction), wait for the user to interact
    await getDidInteract();
    return createContext(options);
  }
};

export function base64ToArrayBuffer(base64: string) {
  try {
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  } catch (e) {
    console.error("Failed to decode base64 to ArrayBuffer:", e);
    return new ArrayBuffer(0);
  }
}
