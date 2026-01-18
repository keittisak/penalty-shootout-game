import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { useGameContext } from "../../context/GameContext";
import { joinGame } from "../../services/gameService";
import { Button } from "../UI";

/**
 * Join Game component - allows player to join existing game with code
 */
export const JoinGame = () => {
  const navigate = useNavigate();
  const { playerName, updatePlayerName, setGameSession, isConfigured } =
    useGameContext();
  const [name, setName] = useState(playerName || "");
  const [gameCode, setGameCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!gameCode.trim()) {
      setError("Please enter game code");
      return;
    }

    if (!isConfigured) {
      setError("Firebase not configured - please set up .env file");
      return;
    }

    setLoading(true);
    setError("");

    try {
      updatePlayerName(name.trim());
      const { gameId, playerKey } = await joinGame(
        gameCode.trim(),
        name.trim()
      );
      setGameSession(gameId, playerKey);
      navigate(`/game/${gameId}`);
    } catch (err) {
      setError(err.message || "Failed to join game");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    // Auto uppercase and limit to 6 characters
    setGameCode(e.target.value.toUpperCase().slice(0, 6));
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="game-panel p-8 w-full max-w-md"
    >
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        🎯 JOIN GAME
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-white/70 text-sm mb-2">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            maxLength={20}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-white/70 text-sm mb-2">Game Code</label>
          <input
            type="text"
            value={gameCode}
            onChange={handleCodeChange}
            placeholder="XXXXXX"
            maxLength={6}
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-center text-2xl font-mono tracking-widest placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors uppercase"
            onKeyPress={(e) => e.key === "Enter" && handleJoin()}
          />
        </div>

        {error && (
          <Motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-sm text-center"
          >
            ❌ {error}
          </Motion.p>
        )}

        <Button
          onClick={handleJoin}
          loading={loading}
          disabled={!name.trim() || gameCode.length !== 6}
          variant="secondary"
          className="w-full"
          size="lg"
        >
          🚀 JOIN
        </Button>

        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="w-full"
        >
          ← BACK
        </Button>
      </div>
    </Motion.div>
  );
};

export default JoinGame;
