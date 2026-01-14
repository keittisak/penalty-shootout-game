import { motion as Motion } from "framer-motion";

/**
 * Scoreboard component
 */
export const ScoreBoard = ({
  player1Name,
  player2Name,
  player1Score,
  player2Score,
  currentRound,
  totalRounds = 10,
  suddenDeath = false,
  myPlayerKey,
}) => {
  return (
    <div className="game-panel p-4">
      <div className="flex items-center justify-between">
        {/* Player 1 */}
        <Motion.div
          className={`text-center flex-1 ${
            myPlayerKey === "player1"
              ? "ring-2 ring-blue-400 rounded-lg p-2"
              : "p-2"
          }`}
          animate={myPlayerKey === "player1" ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-white/70 text-sm truncate max-w-24">
            {player1Name || "Player 1"}
            {myPlayerKey === "player1" && " (คุณ)"}
          </p>
          <p className="score-display">{player1Score}</p>
        </Motion.div>

        {/* Round indicator */}
        <div className="text-center px-4">
          <p className="text-white/50 text-xs">
            {suddenDeath
              ? "⚡ SUDDEN DEATH"
              : `รอบ ${currentRound}/${totalRounds}`}
          </p>
          <p className="text-white/80 text-2xl font-bold">VS</p>
        </div>

        {/* Player 2 */}
        <Motion.div
          className={`text-center flex-1 ${
            myPlayerKey === "player2"
              ? "ring-2 ring-blue-400 rounded-lg p-2"
              : "p-2"
          }`}
          animate={myPlayerKey === "player2" ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-white/70 text-sm truncate max-w-24">
            {player2Name || "Player 2"}
            {myPlayerKey === "player2" && " (คุณ)"}
          </p>
          <p className="score-display">{player2Score}</p>
        </Motion.div>
      </div>
    </div>
  );
};

export default ScoreBoard;
