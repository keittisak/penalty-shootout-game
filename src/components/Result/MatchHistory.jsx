import { motion as Motion } from "framer-motion";
import { ROUND_RESULT, DIRECTION_NAMES } from "../../utils/constants";

/**
 * Match History - detailed round-by-round results
 */
export const MatchHistory = ({ rounds = [] }) => {
  if (rounds.length === 0) return null;

  const getResultIcon = (result) => {
    if (result === ROUND_RESULT.GOAL || result === ROUND_RESULT.TIMEOUT_GOAL) {
      return "⚽";
    }
    return "🛡️";
  };

  const getResultColor = (result) => {
    if (result === ROUND_RESULT.GOAL || result === ROUND_RESULT.TIMEOUT_GOAL) {
      return "bg-green-500/20 border-green-500/30";
    }
    return "bg-red-500/20 border-red-500/30";
  };

  return (
    <div className="bg-gray-900/30 rounded-lg p-4">
      <p className="text-white/60 text-sm mb-3 text-center">📋 Shot History</p>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {rounds.map((round, index) => (
          <Motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              flex items-center justify-between p-2 rounded-lg border
              ${getResultColor(round.result)}
            `}
          >
            <div className="flex items-center gap-2">
              <span className="text-white/50 text-xs w-6">
                #{round.roundNumber}
              </span>
              <span className="text-white/70 text-xs">
                {round.shooter === "player1" ? "P1" : "P2"}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-yellow-400">
                ⚽ {DIRECTION_NAMES[round.shootChoice] || round.shootChoice}
              </span>
              <span className="text-white/30">vs</span>
              <span className="text-blue-400">
                🧤 {DIRECTION_NAMES[round.saveChoice] || round.saveChoice}
              </span>
            </div>

            <span className="text-lg">{getResultIcon(round.result)}</span>
          </Motion.div>
        ))}
      </div>
    </div>
  );
};

export default MatchHistory;
