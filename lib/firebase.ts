
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Using direct @firebase package imports instead of the firebase/app alias to resolve named export issues.
import { initializeApp, getApps } from '@firebase/app';
import type { FirebaseApp } from '@firebase/app';
import { getDatabase, ref, get } from '@firebase/database';
import type { Database } from '@firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDVw2Xt1gf52xXgx4E5TMKf2007AyQwBfQ",
  authDomain: "impactful-ring-469323-e5.firebaseapp.com",
  databaseURL: "https://impactful-ring-469323-e5-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "impactful-ring-469323-e5",
  storageBucket: "impactful-ring-469323-e5.firebasestorage.app",
  messagingSenderId: "316842561818",
  appId: "1:316842561818:web:8e580f90d4c766832c5ca3",
  measurementId: "G-VGVQRD1L46"
};

// Global singleton instance for the database to be lazily initialized
let dbInstance: Database | null = null;

/**
 * Lazily initializes and returns the Firebase App instance.
 */
const getFirebaseApp = (): FirebaseApp => {
  const apps = getApps();
  if (apps && apps.length > 0) {
    return apps[0];
  }
  return initializeApp(firebaseConfig);
};

/**
 * Lazily initializes and returns the Database instance.
 * Robustly handles initialization errors.
 */
const getDB = (): Database | null => {
  if (dbInstance) return dbInstance;
  
  try {
    const app = getFirebaseApp();
    // Use the modular getDatabase function with the app instance and explicit database URL
    dbInstance = getDatabase(app, firebaseConfig.databaseURL);
    return dbInstance;
  } catch (error) {
    console.error("Failed to initialize Firebase Database service:", error);
    return null;
  }
};

/**
 * Fetches the list of supported languages from the Firebase Realtime Database.
 * Falls back to a hardcoded list if the service is unavailable or the call fails.
 */
export const fetchLanguages = async (): Promise<string[]> => {
  const fallbackLanguages = ["English", "Spanish", "French", "German", "Dutch", "Tagalog", "Japanese", "Chinese", "Korean"];
  
  try {
    const db = getDB();
    if (!db) {
      console.warn("Firebase Database service unavailable; using fallback language list.");
      return fallbackLanguages;
    }

    const languagesRef = ref(db, 'languages');
    const snapshot = await get(languagesRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      
      // Handle object structure: { id1: { name: 'English' }, id2: { name: 'Spanish' } }
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        return Object.values(data)
          .map((l: any) => l.name)
          .filter(Boolean)
          .sort();
      }
      
      // Handle array structure: ['English', 'Spanish'] or [{ name: 'English' }]
      if (Array.isArray(data)) {
        return data.map((l: any) => typeof l === 'string' ? l : l?.name).filter(Boolean).sort();
      }
    }
    
    return fallbackLanguages;
  } catch (error) {
    console.error("Error fetching languages from Firebase:", error);
    return fallbackLanguages;
  }
};
