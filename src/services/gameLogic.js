import CryptoJS from 'crypto-js';
import { DIRECTIONS, ROUND_RESULT, GAME_SETTINGS } from '../utils/constants';
import { getShooterForRound, getSaverForRound } from '../utils/helpers';

/**
 * Create commitment hash for choice (Commit-Reveal scheme)
 * @param {string} choice - Direction choice
 * @param {string} secret - Random secret
 * @returns {string} SHA256 hash
 */
export const commitChoice = (choice, secret) => {
  return CryptoJS.SHA256(choice + ':' + secret).toString();
};

/**
 * Verify revealed choice matches commitment
 * @param {string} choice - Revealed choice
 * @param {string} secret - Revealed secret
 * @param {string} commitment - Original commitment hash
 * @returns {boolean} Whether the reveal is valid
 */
export const verifyReveal = (choice, secret, commitment) => {
  const computedHash = CryptoJS.SHA256(choice + ':' + secret).toString();
  return computedHash === commitment;
};

/**
 * Determine round result based on shoot and save directions
 * @param {string} shootChoice - Shooter's direction
 * @param {string} saveChoice - Goalkeeper's direction
 * @returns {string} Result: 'goal' or 'saved'
 */
export const determineResult = (shootChoice, saveChoice) => {
  // If directions match, ball is saved
  // Otherwise, it's a goal
  return shootChoice === saveChoice ? ROUND_RESULT.SAVED : ROUND_RESULT.GOAL;
};

/**
 * Calculate scores from rounds
 * @param {Array} rounds - Array of completed rounds
 * @returns {object} { player1: number, player2: number }
 */
export const calculateScores = (rounds = []) => {
  const scores = { player1: 0, player2: 0 };
  
  rounds.forEach(round => {
    if (round.result === ROUND_RESULT.GOAL || round.result === ROUND_RESULT.TIMEOUT_GOAL) {
      scores[round.shooter]++;
    }
  });
  
  return scores;
};

/**
 * Check if game should end (normal mode)
 * @param {object} gameState - Current game state
 * @returns {object} { shouldEnd: boolean, winner: string|null, reason: string }
 */
export const checkGameEnd = (gameState) => {
  const { rounds = [], suddenDeath } = gameState;
  const scores = calculateScores(rounds);
  
  // Regular game: check after 10 rounds
  if (!suddenDeath && rounds.length >= GAME_SETTINGS.TOTAL_ROUNDS) {
    if (scores.player1 !== scores.player2) {
      return {
        shouldEnd: true,
        winner: scores.player1 > scores.player2 ? 'player1' : 'player2',
        reason: 'normal',
      };
    }
    // Tie - need sudden death
    return {
      shouldEnd: false,
      winner: null,
      reason: 'sudden_death_needed',
      enterSuddenDeath: true,
    };
  }
  
  // Sudden death mode: check after every 2 rounds (each player shot once)
  if (suddenDeath) {
    const suddenDeathRounds = rounds.slice(GAME_SETTINGS.TOTAL_ROUNDS);
    
    // Check only after both players have shot in current sudden death pair
    if (suddenDeathRounds.length >= 2 && suddenDeathRounds.length % 2 === 0) {
      const lastTwo = suddenDeathRounds.slice(-2);
      const p1Round = lastTwo.find(r => r.shooter === 'player1');
      const p2Round = lastTwo.find(r => r.shooter === 'player2');
      
      const p1Scored = p1Round && (p1Round.result === ROUND_RESULT.GOAL || p1Round.result === ROUND_RESULT.TIMEOUT_GOAL);
      const p2Scored = p2Round && (p2Round.result === ROUND_RESULT.GOAL || p2Round.result === ROUND_RESULT.TIMEOUT_GOAL);
      
      if (p1Scored && !p2Scored) {
        return { shouldEnd: true, winner: 'player1', reason: 'sudden_death' };
      }
      if (p2Scored && !p1Scored) {
        return { shouldEnd: true, winner: 'player2', reason: 'sudden_death' };
      }
      // Both scored or both missed - continue sudden death
    }
  }
  
  return { shouldEnd: false, winner: null, reason: null };
};

/**
 * Get next round info
 * @param {number} currentRound - Current round number
 * @param {boolean} suddenDeath - Whether in sudden death mode
 * @param {string} firstShooter - Who shoots first in the game ('player1' or 'player2')
 * @returns {object} { roundNumber, shooter, saver }
 */
export const getNextRoundInfo = (currentRound, suddenDeath = false, firstShooter = 'player1') => {
  const nextRound = currentRound + 1;
  
  // In sudden death, continue from the firstShooter pattern
  if (suddenDeath) {
    const suddenDeathRound = nextRound - GAME_SETTINGS.TOTAL_ROUNDS;
    // Use same alternating pattern based on firstShooter
    const isOddSuddenDeathRound = suddenDeathRound % 2 === 1;
    const shooter = (firstShooter === 'player1') 
      ? (isOddSuddenDeathRound ? 'player1' : 'player2')
      : (isOddSuddenDeathRound ? 'player2' : 'player1');
    const saver = shooter === 'player1' ? 'player2' : 'player1';
    return { roundNumber: nextRound, shooter, saver };
  }
  
  return {
    roundNumber: nextRound,
    shooter: getShooterForRound(nextRound, firstShooter),
    saver: getSaverForRound(nextRound, firstShooter),
  };
};

/**
 * Validate direction choice
 * @param {string} choice - Direction to validate
 * @returns {boolean} Whether choice is valid
 */
export const isValidDirection = (choice) => {
  return Object.values(DIRECTIONS).includes(choice);
};

/**
 * Get initial game state for new game
 * @param {string} gameId - Game ID
 * @param {string} player1Id - Player 1's user ID
 * @param {string} player1Name - Player 1's display name
 * @returns {object} Initial game state
 */
export const createInitialGameState = (gameId, player1Id, player1Name = 'Player 1') => {
  return {
    gameId,
    status: 'waiting',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    
    player1: {
      id: player1Id,
      name: player1Name,
      score: 0,
      connected: true,
      lastSeen: Date.now(),
      hasChosen: false,
      commitment: null,
    },
    
    player2: null,
    
    currentRound: 0,
    currentPhase: 'waiting_opponent',
    currentShooter: null,
    currentSaver: null,
    firstShooter: null, // Will be randomly set when game starts
    
    timer: null,
    rounds: [],
    
    suddenDeath: false,
    suddenDeathRound: 0,
    
    winner: null,
    endReason: null,
  };
};

/**
 * Create player 2 data for joining game
 * @param {string} player2Id - Player 2's user ID
 * @param {string} player2Name - Player 2's display name
 * @returns {object} Player 2 data
 */
export const createPlayer2Data = (player2Id, player2Name = 'Player 2') => {
  return {
    id: player2Id,
    name: player2Name,
    score: 0,
    connected: true,
    lastSeen: Date.now(),
    hasChosen: false,
    commitment: null,
  };
};
