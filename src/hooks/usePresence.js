import { useEffect } from 'react';
import { ref, onValue, onDisconnect, set, serverTimestamp } from 'firebase/database';
import { database } from '../services/firebase';

/**
 * Hook for managing player presence (online/offline status)
 * @param {string} gameId - Game ID
 * @param {string} playerKey - Player key ('player1' or 'player2')
 * @param {string} playerId - Player's user ID
 */
export const usePresence = (gameId, playerKey, playerId) => {
  useEffect(() => {
    if (!gameId || !playerKey || !playerId) return;

    const connectedRef = ref(database, '.info/connected');
    const playerConnectedRef = ref(database, `games/${gameId}/${playerKey}/connected`);
    const playerLastSeenRef = ref(database, `games/${gameId}/${playerKey}/lastSeen`);

    const unsubscribe = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        // Set up disconnect handlers
        onDisconnect(playerConnectedRef).set(false);
        onDisconnect(playerLastSeenRef).set(serverTimestamp());

        // Mark as online
        set(playerConnectedRef, true);
        set(playerLastSeenRef, serverTimestamp());
      }
    });

    return () => {
      unsubscribe();
      // Clean up on unmount
      set(playerConnectedRef, false);
    };
  }, [gameId, playerKey, playerId]);
};

/**
 * Hook for monitoring opponent's presence
 * @param {string} gameId - Game ID
 * @param {string} opponentKey - Opponent's player key
 * @param {function} onDisconnect - Callback when opponent disconnects
 * @param {function} onReconnect - Callback when opponent reconnects
 * @returns {object} { isOpponentConnected, opponentLastSeen }
 */
export const useOpponentPresence = (gameId, opponentKey, onDisconnect, onReconnect) => {
  useEffect(() => {
    if (!gameId || !opponentKey) return;

    const opponentConnectedRef = ref(database, `games/${gameId}/${opponentKey}/connected`);
    let wasConnected = null;

    const unsubscribe = onValue(opponentConnectedRef, (snapshot) => {
      const isConnected = snapshot.val();
      
      if (wasConnected !== null) {
        if (wasConnected && !isConnected) {
          onDisconnect?.();
        } else if (!wasConnected && isConnected) {
          onReconnect?.();
        }
      }
      
      wasConnected = isConnected;
    });

    return () => unsubscribe();
  }, [gameId, opponentKey, onDisconnect, onReconnect]);
};

export default usePresence;
