import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { useGameContext } from "../../context/GameContext";
import { subscribeToGame } from "../../services/gameService";
import { Button, Loading } from "../UI";
import { GAME_STATUS } from "../../utils/constants";

/**
 * Waiting Room component - displays game code and waits for opponent
 */
export const WaitingRoom = () => {
  const navigate = useNavigate();
  const { gameCode } = useParams();
  const { gameId, setGameSession } = useGameContext();
  const [gameData, setGameData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Subscribe to game updates
  useEffect(() => {
    if (!gameCode) return;

    // Set game session if not already set
    if (!gameId) {
      setGameSession(gameCode, "player1");
    }

    const unsubscribe = subscribeToGame(gameCode, (data) => {
      setGameData(data);

      // If game started, navigate to game
      if (data?.status === GAME_STATUS.PLAYING) {
        navigate(`/game/${gameCode}`);
      }
    });

    return () => unsubscribe();
  }, [gameCode, gameId, setGameSession, navigate]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(gameCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Penalty Shootout",
          text: `เข้าร่วมเกมยิงจุดโทษกับฉัน! รหัส: ${gameCode}`,
          url: window.location.href,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    } else {
      copyCode();
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="game-panel p-8 w-full max-w-md text-center"
    >
      <h2 className="text-2xl font-bold text-white mb-2">
        🏟️ รอผู้เล่นคนที่ 2
      </h2>

      <p className="text-white/70 mb-6">แชร์รหัสนี้ให้เพื่อนเพื่อเข้าร่วม</p>

      {/* Game Code Display */}
      <Motion.div
        className="bg-gray-900/50 rounded-xl p-6 mb-6"
        whileHover={{ scale: 1.02 }}
      >
        <p className="text-white/60 text-sm mb-2">รหัสห้อง</p>
        <Motion.p
          className="text-4xl font-mono font-bold text-yellow-400 tracking-widest cursor-pointer"
          onClick={copyCode}
          whileTap={{ scale: 0.95 }}
        >
          {gameCode}
        </Motion.p>
        {copied && (
          <Motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-400 text-sm mt-2"
          >
            ✓ คัดลอกแล้ว!
          </Motion.p>
        )}
      </Motion.div>

      {/* Waiting Animation */}
      <div className="mb-6">
        <Loading text="กำลังรอผู้เล่น..." />
      </div>

      {/* Player Info */}
      {gameData && (
        <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-green-400 text-2xl">👤</p>
              <p className="text-white text-sm">
                {gameData.player1?.name || "Player 1"}
              </p>
              <p className="text-green-400 text-xs">พร้อม</p>
            </div>
            <p className="text-white/50 text-2xl">VS</p>
            <div className="text-center">
              <p className="text-gray-500 text-2xl">👤</p>
              <p className="text-gray-500 text-sm">รอเข้าร่วม...</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <Button onClick={shareCode} className="w-full">
          📤 แชร์รหัส
        </Button>

        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="w-full"
        >
          ← ยกเลิก
        </Button>
      </div>
    </Motion.div>
  );
};

export default WaitingRoom;
