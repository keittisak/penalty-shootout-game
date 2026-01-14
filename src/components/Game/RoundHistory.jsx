import { motion as Motion } from "framer-motion";
import { ROUND_RESULT, GAME_SETTINGS } from "../../utils/constants";

const getResultIcon = (result) => {
  if (result === ROUND_RESULT.GOAL || result === ROUND_RESULT.TIMEOUT_GOAL) {
    return "⚽";
  }
  return "❌";
};

/**
 * RoundDots - shows dots for each round result
 */
const RoundDots = ({
  playerRounds,
  maxRounds = GAME_SETTINGS.SHOTS_PER_PLAYER,
}) => (
  <div className="flex gap-1.5">
    {Array.from({ length: maxRounds }).map((_, i) => {
      const round = playerRounds[i];
      return (
        <Motion.div
          key={i}
          initial={round ? { scale: 0 } : {}}
          animate={round ? { scale: 1 } : {}}
          className={`
            w-6 h-6 rounded-full flex items-center justify-center text-sm
            ${
              round
                ? round.result === ROUND_RESULT.GOAL ||
                  round.result === ROUND_RESULT.TIMEOUT_GOAL
                  ? "bg-green-500/30"
                  : "bg-red-500/30"
                : "bg-gray-700/50"
            }
          `}
        >
          {round ? getResultIcon(round.result) : "_"}
        </Motion.div>
      );
    })}
  </div>
);

/**
 * Sudden Death Dots - shows only sudden death rounds
 */
const SuddenDeathDots = ({ playerRounds }) => (
  <div className="flex gap-1.5 flex-wrap justify-center">
    {playerRounds.map((round, i) => (
      <Motion.div
        key={i}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`
          w-6 h-6 rounded-full flex items-center justify-center text-sm
          ${
            round.result === ROUND_RESULT.GOAL ||
            round.result === ROUND_RESULT.TIMEOUT_GOAL
              ? "bg-yellow-500/30"
              : "bg-red-500/30"
          }
        `}
      >
        {getResultIcon(round.result)}
      </Motion.div>
    ))}
    {playerRounds.length === 0 && (
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm bg-yellow-700/50">
        _
      </div>
    )}
  </div>
);

/**
 * Round History - shows results of previous rounds
 */
export const RoundHistory = ({ rounds = [], suddenDeath = false }) => {
  // Calculate where normal rounds end (10 rounds = 5 shots per player)
  const normalRoundsCount = GAME_SETTINGS.SHOTS_PER_PLAYER * 2; // 10

  // Split into normal and sudden death rounds
  const normalRounds = rounds.slice(0, normalRoundsCount);
  const suddenDeathRounds = rounds.slice(normalRoundsCount);

  // For normal mode, show normal rounds
  // For sudden death mode, show sudden death rounds only
  const displayRounds = suddenDeath ? suddenDeathRounds : normalRounds;

  if (displayRounds.length === 0 && !suddenDeath) return null;

  // Split rounds by player
  const player1Rounds = displayRounds.filter((r) => r.shooter === "player1");
  const player2Rounds = displayRounds.filter((r) => r.shooter === "player2");

  return (
    <div className="bg-gray-800/50 rounded-lg p-3">
      <p className="text-white/50 text-xs text-center mb-2">
        {suddenDeath ? "⚡ Sudden Death" : "ประวัติการยิง"}
      </p>
      <div className="flex items-center justify-center gap-4">
        <div className="text-center">
          <p className="text-white/60 text-xs mb-1">P1</p>
          {suddenDeath ? (
            <SuddenDeathDots playerRounds={player1Rounds} />
          ) : (
            <RoundDots playerRounds={player1Rounds} />
          )}
        </div>
        <div className="text-white/30">|</div>
        <div className="text-center">
          <p className="text-white/60 text-xs mb-1">P2</p>
          {suddenDeath ? (
            <SuddenDeathDots playerRounds={player2Rounds} />
          ) : (
            <RoundDots playerRounds={player2Rounds} />
          )}
        </div>
      </div>
    </div>
  );
};

export default RoundHistory;
