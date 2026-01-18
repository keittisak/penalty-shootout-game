import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { useGameContext } from "../../context/GameContext";
import { createGame } from "../../services/gameService";
import { Button } from "../UI";

/**
 * Create Game component - allows player to create a new game room
 */
export const CreateGame = () => {
  const navigate = useNavigate();
  const { playerName, updatePlayerName, setGameSession, isConfigured } =
    useGameContext();
  const [name, setName] = useState(playerName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
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
      const { gameId, gameCode } = await createGame(name.trim());
      setGameSession(gameId, "player1");
      navigate(`/waiting/${gameCode}`);
    } catch (err) {
      setError(err.message || "Failed to create game");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error) console.log(error);
  }, [error]);

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="game-panel p-8 w-full max-w-md"
    >
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        🎮 CREATE GAME
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
            onKeyPress={(e) => e.key === "Enter" && handleCreate()}
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
          onClick={handleCreate}
          loading={loading}
          disabled={!name.trim()}
          className="w-full"
          size="lg"
        >
          ⚽ CREATE ROOM
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

export default CreateGame;
