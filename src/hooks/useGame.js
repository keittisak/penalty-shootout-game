import { useState, useEffect, useCallback, useRef } from "react";
import { subscribeToGame, advanceToNextRound } from "../services/gameService";
import { commitChoice } from "../services/gameLogic";
import { generateSecret, isMyTurn, getOpponentKey } from "../utils/helpers";
import { GAME_PHASE, GAME_STATUS, TIMER } from "../utils/constants";

/**
 * Main game hook for managing game state and actions
 * @param {string} gameId - Game ID
 * @param {string} myPlayerKey - Current player's key
 * @returns {object} Game state and actions
 */
export const useGame = (gameId, myPlayerKey) => {
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(() => !!gameId);
  const [error, setError] = useState(null);

  // Store choice and secret locally (not in Firebase until needed)
  const [myChoice, setMyChoice] = useState(null);
  const choiceRef = useRef({ choice: null, secret: generateSecret() });

  // Subscribe to game updates
  useEffect(() => {
    if (!gameId) {
      return;
    }

    const unsubscribe = subscribeToGame(gameId, (data, err) => {
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      // console.log("📊 Game Data from Firebase:", data);
      setGameData(data);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [gameId]);

  // Reset choice when phase changes to new shooting round
  const currentRoundRef = useRef(gameData?.currentRound);
  useEffect(() => {
    if (
      gameData?.currentPhase === GAME_PHASE.SHOOTING &&
      gameData?.currentRound !== currentRoundRef.current
    ) {
      // Reset for new round
      currentRoundRef.current = gameData?.currentRound;
      setMyChoice(null);
      choiceRef.current = { choice: null, secret: generateSecret() };
    }
  }, [gameData?.currentRound, gameData?.currentPhase]);

  // Auto advance to next round after result display
  useEffect(() => {
    if (
      gameData?.currentPhase === GAME_PHASE.RESULT &&
      gameData?.status === GAME_STATUS.PLAYING &&
      myPlayerKey === "player1" // Only player1 advances to prevent race condition
    ) {
      const timer = setTimeout(() => {
        advanceToNextRound(gameId).catch(console.error);
      }, TIMER.RESULT_DISPLAY);

      return () => clearTimeout(timer);
    }
  }, [gameData?.currentPhase, gameData?.status, gameId, myPlayerKey]);

  /**
   * Select a direction (shooter or goalkeeper)
   */
  const selectDirection = useCallback((direction) => {
    setMyChoice(direction);
    choiceRef.current.choice = direction;
  }, []);

  /**
   * Get commitment hash for current choice
   */
  const getCommitment = useCallback(() => {
    if (!choiceRef.current.choice || !choiceRef.current.secret) {
      return null;
    }
    return commitChoice(choiceRef.current.choice, choiceRef.current.secret);
  }, []);

  /**
   * Get reveal data for shooter
   */
  const getRevealData = useCallback(() => {
    return {
      choice: choiceRef.current.choice,
      secret: choiceRef.current.secret,
    };
  }, []);

  // Computed values
  const opponentKey = myPlayerKey ? getOpponentKey(myPlayerKey) : null;
  const isShooter = gameData?.currentShooter === myPlayerKey;
  const isSaver = gameData?.currentSaver === myPlayerKey;
  const isMyTurnNow = gameData
    ? isMyTurn(myPlayerKey, gameData.currentShooter, gameData.currentPhase)
    : false;

  // Debug log
  // console.log('🎮 useGame Debug:', {
  //   myPlayerKey,
  //   currentShooter: gameData?.currentShooter,
  //   currentPhase: gameData?.currentPhase,
  //   isShooter,
  //   isSaver,
  //   isMyTurnNow,
  // });

  const myScore = gameData?.[myPlayerKey]?.score ?? 0;
  const opponentScore = opponentKey ? gameData?.[opponentKey]?.score ?? 0 : 0;
  const myName = gameData?.[myPlayerKey]?.name ?? "Me";
  const opponentName = opponentKey
    ? gameData?.[opponentKey]?.name ?? "Opponent"
    : "Opponent";

  return {
    // State
    gameData,
    loading,
    error,
    myChoice,

    // Player info
    myPlayerKey,
    opponentKey,
    isShooter,
    isSaver,
    isMyTurnNow,
    myScore,
    opponentScore,
    myName,
    opponentName,

    // Game info
    currentRound: gameData?.currentRound ?? 0,
    currentPhase: gameData?.currentPhase ?? null,
    status: gameData?.status ?? null,
    winner: gameData?.winner ?? null,
    suddenDeath: gameData?.suddenDeath ?? false,
    rounds: gameData?.rounds ?? [],
    lastRoundResult: gameData?.lastRoundResult ?? null,

    // Actions
    selectDirection,
    getCommitment,
    getRevealData,
  };
};

export default useGame;
