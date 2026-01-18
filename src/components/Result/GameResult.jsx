import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { useGameContext } from "../../context/GameContext";
import { subscribeToGame } from "../../services/gameService";
import { Button, FullPageLoading } from "../UI";
import { MatchHistory } from "./MatchHistory";

/**
 * Generate confetti particles data
 */
const generateConfetti = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    rotate: Math.random() * 720,
    duration: 2 + Math.random() * 2,
    delay: Math.random() * 1,
    emoji: ["🎉", "✨", "🌟", "🎊", "🏆", "⚽"][Math.floor(Math.random() * 6)],
  }));
};

/**
 * Game Result component - shows final game results
 */
export const GameResult = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { playerKey, clearGameSession } = useGameContext();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId) return;

    const unsubscribe = subscribeToGame(gameId, (data) => {
      setGameData(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [gameId]);

  const handlePlayAgain = () => {
    clearGameSession();
    navigate("/");
  };

  // Calculate winner status before any early returns
  const isWinner = gameData?.winner === playerKey;
  const isLoser = gameData?.winner && gameData?.winner !== playerKey;

  // Generate confetti once (must be before early returns due to hooks rules)
  const confetti = useMemo(
    () => (isWinner ? generateConfetti(30) : []),
    [isWinner]
  );

  if (loading) {
    return <FullPageLoading text="Loading game results..." />;
  }

  if (!gameData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="game-panel p-8 text-center">
          <p className="text-red-400 text-xl mb-4">❌ Game data not found</p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const getResultEmoji = () => {
    if (isWinner) return "🏆";
    if (isLoser) return "😢";
    return "🤝";
  };

  const getResultText = () => {
    if (isWinner) return "Congratulations! You won!";
    if (isLoser) return "Sorry, you lost";
    return "Draw!";
  };

  const getResultColor = () => {
    if (isWinner) return "text-yellow-400";
    if (isLoser) return "text-red-400";
    return "text-blue-400";
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center">
      <Motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="game-panel p-8 max-w-md w-full text-center"
      >
        {/* Result emoji */}
        <Motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-8xl mb-4"
        >
          {getResultEmoji()}
        </Motion.div>

        {/* Result text */}
        <Motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`text-3xl font-bold mb-6 ${getResultColor()}`}
        >
          {getResultText()}
        </Motion.h1>

        {/* Final Score */}
        <Motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900/50 rounded-xl p-6 mb-6"
        >
          <p className="text-white/60 text-sm mb-2">Final Score</p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-white/70 text-sm">
                {gameData.player1?.name || "Player 1"}
              </p>
              <p
                className={`text-4xl font-bold ${
                  gameData.winner === "player1"
                    ? "text-yellow-400"
                    : "text-white"
                }`}
              >
                {gameData.player1?.score || 0}
              </p>
            </div>
            <p className="text-white/50 text-2xl">-</p>
            <div className="text-center">
              <p className="text-white/70 text-sm">
                {gameData.player2?.name || "Player 2"}
              </p>
              <p
                className={`text-4xl font-bold ${
                  gameData.winner === "player2"
                    ? "text-yellow-400"
                    : "text-white"
                }`}
              >
                {gameData.player2?.score || 0}
              </p>
            </div>
          </div>

          {/* End reason */}
          {gameData.endReason && (
            <p className="text-white/50 text-xs mt-4">
              {gameData.endReason === "sudden_death" &&
                "⚡ Ended with Sudden Death"}
              {gameData.endReason === "normal" && "🎯 Ended with Normal Game"}
              {gameData.endReason === "disconnect" && "📴 Opponent left the game"}
            </p>
          )}
        </Motion.div>

        {/* Match History */}
        <Motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <MatchHistory rounds={gameData.rounds || []} />
        </Motion.div>

        {/* Actions */}
        <Motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <Button onClick={handlePlayAgain} className="w-full" size="lg">
            🔄 Play Again
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="w-full"
          >
            🏠 Back to Home
          </Button>
        </Motion.div>

        {/* Confetti for winner */}
        {isWinner && confetti.length > 0 && (
          <Motion.div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
            {confetti.map((particle) => (
              <Motion.div
                key={particle.id}
                className="absolute text-2xl"
                initial={{
                  x: `${particle.x}%`,
                  y: -50,
                  opacity: 1,
                }}
                animate={{
                  y: "100vh",
                  opacity: 0,
                  rotate: particle.rotate,
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  ease: "easeIn",
                }}
              >
                {particle.emoji}
              </Motion.div>
            ))}
          </Motion.div>
        )}
      </Motion.div>
    </div>
  );
};

export default GameResult;
