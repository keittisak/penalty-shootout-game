import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../services/firebase';

/**
 * Hook for managing game timer synchronized with Firebase
 * @param {string} gameId - Game ID
 * @param {function} onExpire - Callback when timer expires
 * @returns {object} { timeLeft, isExpired, isRunning }
 */
export const useTimer = (gameId, onExpire) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [timerData, setTimerData] = useState(null);

  // Subscribe to timer data from Firebase
  useEffect(() => {
    if (!gameId) return;

    const timerRef = ref(database, `games/${gameId}/timer`);
    
    const unsubscribe = onValue(timerRef, (snapshot) => {
      const data = snapshot.val();
      setTimerData(data);
      
      if (data && data.startedAt) {
        const elapsed = Date.now() - data.startedAt;
        const remaining = Math.max(0, data.duration - elapsed);
        setTimeLeft(remaining);
        setIsRunning(remaining > 0);
        setIsExpired(remaining === 0);
      } else {
        setTimeLeft(0);
        setIsRunning(false);
        setIsExpired(false);
      }
    });

    return () => unsubscribe();
  }, [gameId]);

  // Local countdown
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = Math.max(0, prev - 100);
        
        if (newTime === 0 && !isExpired) {
          setIsExpired(true);
          setIsRunning(false);
          onExpire?.();
        }
        
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, isExpired, onExpire]);

  return {
    timeLeft,
    timeLeftSeconds: Math.ceil(timeLeft / 1000),
    isExpired,
    isRunning,
    timerPhase: timerData?.phase,
  };
};

export default useTimer;
