// Game States
export const GAME_STATUS = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  FINISHED: 'finished',
};

// Game Phases
export const GAME_PHASE = {
  WAITING_OPPONENT: 'waiting_opponent',
  SHOOTING: 'shooting',
  SAVING: 'saving',
  REVEALING: 'revealing',
  RESULT: 'result',
  GAME_OVER: 'game_over',
};

// Directions
export const DIRECTIONS = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right',
};

// Results
export const ROUND_RESULT = {
  GOAL: 'goal',
  SAVED: 'saved',
  TIMEOUT_GOAL: 'timeout_goal',
  TIMEOUT_SAVED: 'timeout_saved',
};

// Timer durations (milliseconds)
export const TIMER = {
  SHOOTING_DURATION: parseInt(import.meta.env.VITE_GAME_SHOOTING_DURATION || '10000'),
  SAVING_DURATION: parseInt(import.meta.env.VITE_GAME_SAVING_DURATION || '10000'),
  RESULT_DISPLAY: parseInt(import.meta.env.VITE_GAME_RESULT_DISPLAY || '3000'),
  ROUND_TRANSITION: parseInt(import.meta.env.VITE_GAME_ROUND_TRANSITION || '2000'),
};

// Game settings
export const GAME_SETTINGS = {
  TOTAL_ROUNDS: parseInt(import.meta.env.VITE_GAME_TOTAL_ROUNDS || '6'),
  SHOTS_PER_PLAYER: parseInt(import.meta.env.VITE_GAME_SHOTS_PER_PLAYER || '3'),
  DISCONNECT_TIMEOUT: parseInt(import.meta.env.VITE_GAME_DISCONNECT_TIMEOUT || '30000'),
};

// Player keys
export const PLAYER_KEYS = {
  PLAYER1: 'player1',
  PLAYER2: 'player2',
};

// Direction display names
export const DIRECTION_NAMES = {
  [DIRECTIONS.LEFT]: 'LEFT',
  [DIRECTIONS.CENTER]: 'CENTER',
  [DIRECTIONS.RIGHT]: 'RIGHT',
};

// Direction icons/emojis
export const DIRECTION_ICONS = {
  [DIRECTIONS.LEFT]: '⬅️',
  [DIRECTIONS.CENTER]: '⬇️',
  [DIRECTIONS.RIGHT]: '➡️',
};

// Result messages
export const RESULT_MESSAGES = {
  [ROUND_RESULT.GOAL]: '⚽ GOAL!',
  [ROUND_RESULT.SAVED]: '🧤 SAVED!',
  [ROUND_RESULT.TIMEOUT_GOAL]: '⏰ TIMEOUT - GOAL!',
  [ROUND_RESULT.TIMEOUT_SAVED]: '⏰ TIMEOUT - SAVED!',
};

// Game code settings
export const GAME_CODE = {
  LENGTH: 6,
  CHARACTERS: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // Exclude similar chars (I, O, 0, 1)
};
