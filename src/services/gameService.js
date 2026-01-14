import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  off,
  runTransaction,
  serverTimestamp,
  onDisconnect,
} from 'firebase/database';
import { database, getCurrentUserId } from './firebase';
import {
  createInitialGameState,
  createPlayer2Data,
  determineResult,
  calculateScores,
  checkGameEnd,
  getNextRoundInfo,
  verifyReveal,
} from './gameLogic';
import { generateGameCode, getRandomDirection, getRandomFirstShooter } from '../utils/helpers';
import { GAME_STATUS, GAME_PHASE, TIMER, ROUND_RESULT } from '../utils/constants';

/**
 * Create a new game
 * @param {string} playerName - Creator's name
 * @returns {Promise<object>} { gameId, gameCode }
 */
export const createGame = async (playerName = 'Player 1') => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const gameCode = generateGameCode();
  const gameId = gameCode; // Use code as ID for simplicity
  
  const gameState = createInitialGameState(gameId, userId, playerName);
  gameState.gameCode = gameCode;

  const gameRef = ref(database, `games/${gameId}`);
  await set(gameRef, gameState);

  return { gameId, gameCode };
};

/**
 * Join an existing game
 * @param {string} gameCode - Game code to join
 * @param {string} playerName - Joiner's name
 * @returns {Promise<object>} { gameId, playerKey }
 */
export const joinGame = async (gameCode, playerName = 'Player 2') => {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const gameId = gameCode.toUpperCase();
  const gameRef = ref(database, `games/${gameId}`);
  
  const snapshot = await get(gameRef);
  if (!snapshot.exists()) {
    throw new Error('Game not found');
  }

  const gameData = snapshot.val();
  
  if (gameData.status !== GAME_STATUS.WAITING) {
    throw new Error('Game already started or finished');
  }

  if (gameData.player1.id === userId) {
    throw new Error('Cannot join your own game');
  }

  if (gameData.player2) {
    throw new Error('Game is full');
  }

  // Add player 2 and start the game
  // Randomly determine who shoots first
  const firstShooter = getRandomFirstShooter();
  const player2Data = createPlayer2Data(userId, playerName);
  const firstRoundInfo = getNextRoundInfo(0, false, firstShooter);

  await update(gameRef, {
    player2: player2Data,
    status: GAME_STATUS.PLAYING,
    currentRound: 1,
    currentPhase: GAME_PHASE.SHOOTING,
    currentShooter: firstRoundInfo.shooter,
    currentSaver: firstRoundInfo.saver,
    firstShooter: firstShooter, // Store who shoots first for the entire game
    updatedAt: Date.now(),
    timer: {
      startedAt: Date.now(),
      duration: TIMER.SHOOTING_DURATION,
      phase: GAME_PHASE.SHOOTING,
    },
  });

  return { gameId, playerKey: 'player2' };
};

/**
 * Subscribe to game updates
 * @param {string} gameId - Game ID
 * @param {function} callback - Callback function for updates
 * @returns {function} Unsubscribe function
 */
export const subscribeToGame = (gameId, callback) => {
  const gameRef = ref(database, `games/${gameId}`);
  
  const unsubscribe = onValue(gameRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Game subscription error:', error);
    callback(null, error);
  });

  return () => off(gameRef, 'value', unsubscribe);
};

/**
 * Submit shooter's choice (with commitment and reveal data)
 * @param {string} gameId - Game ID
 * @param {string} playerKey - Player key
 * @param {string} commitment - Hash commitment
 * @param {string} choice - The actual direction choice
 * @param {string} secret - The secret used for commitment
 */
export const submitShooterChoice = async (gameId, playerKey, commitment, choice, secret) => {
  const gameRef = ref(database, `games/${gameId}`);
  
  await update(gameRef, {
    [`${playerKey}/hasChosen`]: true,
    [`${playerKey}/commitment`]: commitment,
    [`${playerKey}/pendingReveal`]: {
      choice,
      secret,
    },
    currentPhase: GAME_PHASE.SAVING,
    updatedAt: Date.now(),
    timer: {
      startedAt: Date.now(),
      duration: TIMER.SAVING_DURATION,
      phase: GAME_PHASE.SAVING,
    },
  });
};

/**
 * Submit goalkeeper's choice and reveal shooter's choice
 * @param {string} gameId - Game ID
 * @param {string} saverKey - Saver's player key
 * @param {string} saveChoice - Saver's direction choice
 * @param {string} shootChoice - Revealed shooter's choice
 * @param {string} shootSecret - Revealed shooter's secret
 */
export const submitSaverChoiceAndReveal = async (
  gameId,
  saverKey,
  saveChoice,
  shootChoice,
  shootSecret
) => {
  const gameRef = ref(database, `games/${gameId}`);
  
  await runTransaction(gameRef, (currentData) => {
    if (!currentData) return currentData;

    const shooterKey = saverKey === 'player1' ? 'player2' : 'player1';
    const commitment = currentData[shooterKey]?.commitment;
    
    // Verify the reveal
    let finalShootChoice = shootChoice;
    if (commitment && !verifyReveal(shootChoice, shootSecret, commitment)) {
      // Invalid reveal - shooter cheated, auto-save
      console.warn('Invalid reveal detected!');
      finalShootChoice = saveChoice; // Force same direction = saved
    }

    // Determine result
    const result = determineResult(finalShootChoice, saveChoice);
    
    // Create round record
    const roundRecord = {
      roundNumber: currentData.currentRound,
      shooter: shooterKey,
      saver: saverKey,
      shootChoice: finalShootChoice,
      saveChoice,
      result,
      timestamp: Date.now(),
    };

    // Update rounds array
    const rounds = [...(currentData.rounds || []), roundRecord];
    
    // Calculate new scores
    const scores = calculateScores(rounds);
    
    // Check for game end
    const gameEndCheck = checkGameEnd({ ...currentData, rounds });

    // Prepare updates
    currentData.rounds = rounds;
    currentData.player1.score = scores.player1;
    currentData.player2.score = scores.player2;
    currentData.player1.hasChosen = false;
    currentData.player1.commitment = null;
    currentData.player1.pendingReveal = null;
    currentData.player2.hasChosen = false;
    currentData.player2.commitment = null;
    currentData.player2.pendingReveal = null;
    currentData.currentPhase = GAME_PHASE.RESULT;
    currentData.lastRoundResult = result;
    currentData.updatedAt = Date.now();
    currentData.timer = null;

    if (gameEndCheck.shouldEnd) {
      currentData.status = GAME_STATUS.FINISHED;
      currentData.winner = gameEndCheck.winner;
      currentData.endReason = gameEndCheck.reason;
      currentData.currentPhase = GAME_PHASE.GAME_OVER;
    } else if (gameEndCheck.enterSuddenDeath) {
      currentData.suddenDeath = true;
    }

    return currentData;
  });
};

/**
 * Advance to next round
 * @param {string} gameId - Game ID
 */
export const advanceToNextRound = async (gameId) => {
  const gameRef = ref(database, `games/${gameId}`);
  
  await runTransaction(gameRef, (currentData) => {
    if (!currentData) return currentData;
    if (currentData.status === GAME_STATUS.FINISHED) return currentData;

    const nextRoundInfo = getNextRoundInfo(
      currentData.currentRound, 
      currentData.suddenDeath, 
      currentData.firstShooter || 'player1'
    );

    currentData.currentRound = nextRoundInfo.roundNumber;
    currentData.currentShooter = nextRoundInfo.shooter;
    currentData.currentSaver = nextRoundInfo.saver;
    currentData.currentPhase = GAME_PHASE.SHOOTING;
    currentData.lastRoundResult = null;
    currentData.updatedAt = Date.now();
    currentData.timer = {
      startedAt: Date.now(),
      duration: TIMER.SHOOTING_DURATION,
      phase: GAME_PHASE.SHOOTING,
    };

    return currentData;
  });
};

/**
 * Handle timeout - auto-select random choice
 * @param {string} gameId - Game ID
 * @param {string} phase - Current phase
 * @param {string} playerKey - Player who timed out
 */
export const handleTimeout = async (gameId, phase, playerKey) => {
  const randomChoice = getRandomDirection();
  
  if (phase === GAME_PHASE.SHOOTING) {
    // Shooter timed out - random shot, goes in
    const gameRef = ref(database, `games/${gameId}`);
    const snapshot = await get(gameRef);
    if (!snapshot.exists()) return;
    
    // Force to saving phase with random commitment
    await update(gameRef, {
      [`${playerKey}/hasChosen`]: true,
      [`${playerKey}/timeoutChoice`]: randomChoice,
      currentPhase: GAME_PHASE.SAVING,
      updatedAt: Date.now(),
      timer: {
        startedAt: Date.now(),
        duration: TIMER.SAVING_DURATION,
        phase: GAME_PHASE.SAVING,
      },
    });
  }
};

/**
 * Update player presence
 * @param {string} gameId - Game ID
 * @param {string} playerKey - Player key
 * @param {boolean} connected - Connection status
 */
export const updatePresence = async (gameId, playerKey, connected) => {
  const gameRef = ref(database, `games/${gameId}/${playerKey}`);
  await update(gameRef, {
    connected,
    lastSeen: Date.now(),
  });
};

/**
 * Setup disconnect handler
 * @param {string} gameId - Game ID
 * @param {string} playerKey - Player key
 */
export const setupDisconnectHandler = (gameId, playerKey) => {
  const connectedRef = ref(database, `games/${gameId}/${playerKey}/connected`);
  const lastSeenRef = ref(database, `games/${gameId}/${playerKey}/lastSeen`);
  
  onDisconnect(connectedRef).set(false);
  onDisconnect(lastSeenRef).set(serverTimestamp());
};

/**
 * Get game by code
 * @param {string} gameCode - Game code
 * @returns {Promise<object|null>} Game data or null
 */
export const getGameByCode = async (gameCode) => {
  const gameRef = ref(database, `games/${gameCode.toUpperCase()}`);
  const snapshot = await get(gameRef);
  return snapshot.exists() ? snapshot.val() : null;
};

/**
 * Delete a game
 * @param {string} gameId - Game ID
 */
export const deleteGame = async (gameId) => {
  const gameRef = ref(database, `games/${gameId}`);
  await remove(gameRef);
};

/**
 * Get all games (for admin)
 * @returns {Promise<Array>} Array of games
 */
export const getAllGames = async () => {
  const gamesRef = ref(database, 'games');
  const snapshot = await get(gamesRef);
  if (!snapshot.exists()) return [];
  
  const gamesData = snapshot.val();
  return Object.entries(gamesData).map(([id, data]) => ({
    id,
    ...data,
  }));
};

/**
 * Subscribe to all games (for admin real-time updates)
 * @param {function} callback - Callback function
 * @returns {function} Unsubscribe function
 */
export const subscribeToAllGames = (callback) => {
  const gamesRef = ref(database, 'games');
  
  const handleValue = (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    
    const gamesData = snapshot.val();
    const games = Object.entries(gamesData).map(([id, data]) => ({
      id,
      ...data,
    }));
    callback(games);
  };
  
  const handleError = (error) => {
    console.error('subscribeToAllGames error:', error);
    callback([]);
  };
  
  const unsubscribe = onValue(gamesRef, handleValue, handleError);
  
  return () => {
    off(gamesRef, 'value', handleValue);
  };
};

/**
 * Delete multiple games
 * @param {Array<string>} gameIds - Array of game IDs to delete
 */
export const deleteMultipleGames = async (gameIds) => {
  const updates = {};
  gameIds.forEach(id => {
    updates[`games/${id}`] = null;
  });
  await update(ref(database), updates);
};
