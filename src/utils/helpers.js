import { GAME_CODE, DIRECTIONS } from './constants';

/**
 * Generate a random game code
 * @returns {string} 6-character game code
 */
export const generateGameCode = () => {
  let code = '';
  for (let i = 0; i < GAME_CODE.LENGTH; i++) {
    code += GAME_CODE.CHARACTERS.charAt(
      Math.floor(Math.random() * GAME_CODE.CHARACTERS.length)
    );
  }
  return code;
};

/**
 * Generate a random secret for commit-reveal scheme
 * @returns {string} Random secret string
 */
export const generateSecret = () => {
  return crypto.randomUUID ? crypto.randomUUID() : 
    Math.random().toString(36).substring(2, 15) + 
    Math.random().toString(36).substring(2, 15);
};

/**
 * Get random direction (for timeout fallback)
 * @returns {string} Random direction
 */
export const getRandomDirection = () => {
  const directions = Object.values(DIRECTIONS);
  return directions[Math.floor(Math.random() * directions.length)];
};

/**
 * Format time from milliseconds to display string
 * @param {number} ms - Milliseconds
 * @returns {string} Formatted time string (e.g., "5.2")
 */
export const formatTime = (ms) => {
  const seconds = Math.max(0, ms / 1000);
  return seconds.toFixed(1);
};

/**
 * Format time as integer seconds
 * @param {number} ms - Milliseconds
 * @returns {number} Seconds (integer)
 */
export const formatTimeSeconds = (ms) => {
  return Math.ceil(Math.max(0, ms / 1000));
};

/**
 * Get player display name
 * @param {string} playerKey - 'player1' or 'player2'
 * @param {object} gameData - Game data object
 * @returns {string} Player name
 */
export const getPlayerName = (playerKey, gameData) => {
  return gameData?.[playerKey]?.name || (playerKey === 'player1' ? 'Player 1' : 'Player 2');
};

/**
 * Get opponent key
 * @param {string} myPlayerKey - Current player key
 * @returns {string} Opponent player key
 */
export const getOpponentKey = (myPlayerKey) => {
  return myPlayerKey === 'player1' ? 'player2' : 'player1';
};

/**
 * Check if it's my turn
 * @param {string} myPlayerKey - Current player key
 * @param {string} currentShooter - Current shooter key
 * @param {string} currentPhase - Current phase
 * @returns {boolean} Whether it's my turn
 */
export const isMyTurn = (myPlayerKey, currentShooter, currentPhase) => {
  if (currentPhase === 'shooting') {
    return myPlayerKey === currentShooter;
  }
  if (currentPhase === 'saving') {
    return myPlayerKey !== currentShooter;
  }
  return false;
};

/**
 * Randomly determine who shoots first
 * @returns {string} 'player1' or 'player2'
 */
export const getRandomFirstShooter = () => {
  return Math.random() < 0.5 ? 'player1' : 'player2';
};

/**
 * Determine who shoots in a given round
 * @param {number} roundNumber - Round number (1-based)
 * @param {string} firstShooter - Who shoots first ('player1' or 'player2')
 * @returns {string} Player key who shoots
 */
export const getShooterForRound = (roundNumber, firstShooter = 'player1') => {
  // Odd rounds: firstShooter shoots
  // Even rounds: other player shoots
  const isOddRound = roundNumber % 2 === 1;
  if (firstShooter === 'player1') {
    return isOddRound ? 'player1' : 'player2';
  } else {
    return isOddRound ? 'player2' : 'player1';
  }
};

/**
 * Determine who saves in a given round
 * @param {number} roundNumber - Round number (1-based)
 * @param {string} firstShooter - Who shoots first ('player1' or 'player2')
 * @returns {string} Player key who saves
 */
export const getSaverForRound = (roundNumber, firstShooter = 'player1') => {
  const shooter = getShooterForRound(roundNumber, firstShooter);
  return shooter === 'player1' ? 'player2' : 'player1';
};

/**
 * Calculate shots taken by each player
 * @param {Array} rounds - Completed rounds array
 * @returns {object} { player1: number, player2: number }
 */
export const getShotsTaken = (rounds = []) => {
  const shots = { player1: 0, player2: 0 };
  rounds.forEach(round => {
    if (round.shooter) {
      shots[round.shooter]++;
    }
  });
  return shots;
};

/**
 * Format score display
 * @param {number} score1 - Player 1 score
 * @param {number} score2 - Player 2 score
 * @returns {string} Formatted score (e.g., "3 - 2")
 */
export const formatScore = (score1, score2) => {
  return `${score1} - ${score2}`;
};

/**
 * Delay utility (promise-based)
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Clamp a number between min and max
 * @param {number} num - Number to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped number
 */
export const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
