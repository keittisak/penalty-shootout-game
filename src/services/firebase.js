import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Check if Firebase is configured
 * @returns {boolean} Whether Firebase is properly configured
 */
export const isFirebaseConfigured = () => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.databaseURL &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== "your_api_key_here"
  );
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const database = getDatabase(app);
export const auth = getAuth(app);

// Log Firebase connection status
console.log("🔥 Firebase initialized");
console.log("✅ Firebase configured:", isFirebaseConfigured() ? "Yes" : "No");

/**
 * Sign in anonymously
 * @returns {Promise<User>} Firebase User object
 */
export const signInAnonymousUser = async () => {
  try {
    const result = await signInAnonymously(auth);
    console.log("👤 Anonymous sign in success:", result.user.uid);
    return result.user;
  } catch (error) {
    console.error("❌ Anonymous sign in failed:", error);
    throw error;
  }
};

/**
 * Get current user ID
 * @returns {string|null} User ID or null
 */
export const getCurrentUserId = () => {
  return auth.currentUser?.uid || null;
};

export default app;
