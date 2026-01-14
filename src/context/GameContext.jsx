import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { auth, signInAnonymousUser, isFirebaseConfigured } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Create context
const GameContext = createContext(null);

/**
 * Game Provider component
 */
export const GameProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [gameId, setGameId] = useState(null);
  const [playerKey, setPlayerKey] = useState(null);
  const [playerName, setPlayerName] = useState(() => {
    // Initialize from localStorage
    return localStorage.getItem('playerName') || '';
  });
  const [isConfigured] = useState(() => isFirebaseConfigured());

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Auto sign in anonymously
  useEffect(() => {
    const signIn = async () => {
      if (!authLoading && !user && isConfigured) {
        try {
          await signInAnonymousUser();
        } catch (error) {
          console.error('Auto sign in failed:', error);
        }
      }
    };
    signIn();
  }, [authLoading, user, isConfigured]);

  /**
   * Set current game session
   */
  const setGameSession = useCallback((newGameId, newPlayerKey) => {
    setGameId(newGameId);
    setPlayerKey(newPlayerKey);
  }, []);

  /**
   * Clear current game session
   */
  const clearGameSession = useCallback(() => {
    setGameId(null);
    setPlayerKey(null);
  }, []);

  /**
   * Update player name
   */
  const updatePlayerName = useCallback((name) => {
    setPlayerName(name);
    // Optionally persist to localStorage
    localStorage.setItem('playerName', name);
  }, []);

  const value = {
    // Auth state
    user,
    userId: user?.uid || null,
    authLoading,
    isAuthenticated: !!user,
    isConfigured,
    
    // Game session
    gameId,
    playerKey,
    playerName,
    
    // Actions
    setGameSession,
    clearGameSession,
    updatePlayerName,
    signIn: signInAnonymousUser,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

/**
 * Hook to use game context
 */
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

export default GameContext;
