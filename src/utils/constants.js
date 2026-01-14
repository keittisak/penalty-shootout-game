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
  SHOOTING_DURATION: 10000,  // 10 seconds
  SAVING_DURATION: 10000,    // 10 seconds
  RESULT_DISPLAY: 3000,      // 3 seconds
  ROUND_TRANSITION: 2000,    // 2 seconds
};

// Game settings
export const GAME_SETTINGS = {
  TOTAL_ROUNDS: 6,           // 5 per player
  SHOTS_PER_PLAYER: 3,
  DISCONNECT_TIMEOUT: 30000,  // 30 seconds
};

// Player keys
export const PLAYER_KEYS = {
  PLAYER1: 'player1',
  PLAYER2: 'player2',
};

// Direction display names (Thai)
export const DIRECTION_NAMES = {
  [DIRECTIONS.LEFT]: 'ซ้าย',
  [DIRECTIONS.CENTER]: 'กลาง',
  [DIRECTIONS.RIGHT]: 'ขวา',
};

// Direction icons/emojis
export const DIRECTION_ICONS = {
  [DIRECTIONS.LEFT]: '⬅️',
  [DIRECTIONS.CENTER]: '⬇️',
  [DIRECTIONS.RIGHT]: '➡️',
};

// Result messages
export const RESULT_MESSAGES = {
  [ROUND_RESULT.GOAL]: '⚽ GOAL! ยิงเข้า!',
  [ROUND_RESULT.SAVED]: '🧤 SAVED! เซฟได้!',
  [ROUND_RESULT.TIMEOUT_GOAL]: '⏰ หมดเวลา - ยิงเข้า!',
  [ROUND_RESULT.TIMEOUT_SAVED]: '⏰ หมดเวลา - เซฟได้!',
};

// Game code settings
export const GAME_CODE = {
  LENGTH: 6,
  CHARACTERS: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // Exclude similar chars (I, O, 0, 1)
};
